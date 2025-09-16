import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './AdminDashboard.module.scss';
import { productAPI } from '../../services/productsAPI';
import type { Product, CreateProductData, ProductsResponse } from '../../interfaces/product';
import ProductForm from '../../components/ProductForm/ProductForm';
import ProductTable from '../../components/ProductTable/ProductTable';

interface SearchData {
  search: string;
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');

  // Search validation schema
  const searchSchema = yup.object({
    search: yup
      .string()
      .default('')
      .transform((value) => value?.trim() || '')
      .max(200, 'Search term must not exceed 200 characters')
  });

  const {
    register,
    formState: { errors },
    watch,
    reset: resetSearch
  } = useForm<SearchData>({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      search: ''
    }
  });

  // Watch the search input for debouncing
  const watchedSearch = watch('search');

  const fetchProducts = useCallback(async (page: number = 1, searchTerm: string = '') => {
    setLoading(true);
    try {
      const data: ProductsResponse = await productAPI.getProducts(page, 10, searchTerm);
      setProducts(data.products);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedSearch = watchedSearch?.trim() || '';
      if (trimmedSearch !== currentSearch) {
        setCurrentSearch(trimmedSearch);
        setCurrentPage(1);
        fetchProducts(1, trimmedSearch);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [watchedSearch, currentSearch, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts(1, '');
  }, [fetchProducts]);

  const handleFormSubmit = async (data: CreateProductData) => {
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, data);
      } else {
        await productAPI.createProduct(data);
      }
      setShowForm(false);
      setEditingProduct(null);
      // Refresh the current page with current search
      fetchProducts(currentPage, currentSearch);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error; // Re-throw so form can handle it
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productAPI.deleteProduct(id);
      // If we're on a page > 1 and it becomes empty after deletion,
      // we might want to go back to the previous page
      const remainingProducts = products.length - 1;
      const shouldGoToPreviousPage = currentPage > 1 && remainingProducts === 0;

      if (shouldGoToPreviousPage) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        fetchProducts(newPage, currentSearch);
      } else {
        fetchProducts(currentPage, currentSearch);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, currentSearch);
  };

  const handleClearSearch = () => {
    resetSearch();
    setCurrentSearch('');
    setCurrentPage(1);
    fetchProducts(1, '');
  };

  return (
    <div className={styles.admin}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <Link to="/" className={styles.backLink}>← Back to Catalog</Link>
          <button onClick={handleAddNew} className={styles.addButton}>
            Add Product
          </button>
        </div>
      </header>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchForm}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="Search products..."
              {...register('search')}
              className={`${styles.searchInput} ${errors.search ? styles.errorInput : ''}`}
            />
            {errors.search && (
              <span className={styles.fieldError}>{errors.search.message}</span>
            )}
          </div>
          {currentSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearButton}
            >
              Clear
            </button>
          )}
        </div>

        {currentSearch && !loading && (
          <p className={styles.searchInfo}>
            Showing results for: <strong>"{currentSearch}"</strong>
          </p>
        )}
      </div>

      <ProductForm
        showForm={showForm}
        editingProduct={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />

      <ProductTable
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AdminDashboard;