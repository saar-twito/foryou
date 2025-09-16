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
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

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
      setSelectedProducts(new Set());
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
      // Remove from selection if it was selected
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

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

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(new Set(products.map(p => p._id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const result = await productAPI.bulkUpdatePrice(Array.from(selectedProducts), discountPercent);

      // Update products in state with new prices
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const updated = result.updatedProducts.find((p: Product) => p._id === product._id);
          return updated || product;
        })
      );

      setSelectedProducts(new Set());
      setShowBulkUpdate(false);
      setDiscountPercent(0);
      alert(result.message);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Error updating prices');
    }
  };

  return (
    <div className={styles.admin}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <Link to="/" className={styles.backLink}>← Back to Catalog</Link>
          {selectedProducts.size > 0 && (
            <button
              onClick={() => setShowBulkUpdate(true)}
              className={styles.bulkUpdateButton}
            >
              Bulk Update ({selectedProducts.size})
            </button>
          )}
          <button onClick={handleAddNew} className={styles.addButton}>
            Add Product
          </button>
        </div>
      </header>

      {/* Simple bulk update modal */}
      {showBulkUpdate && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px',
            minWidth: '400px', textAlign: 'center'
          }}>
            <h3>Bulk Price Update</h3>
            <p>Apply discount to {selectedProducts.size} selected products</p>
            <input
              type="number"
              placeholder="Enter discount percentage (0-100)"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            {discountPercent > 0 && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Example: $100.00 → ${(100 * (1 - discountPercent / 100)).toFixed(2)}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleBulkUpdate}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Apply Discount
              </button>
              <button
                onClick={() => setShowBulkUpdate(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
        selectedProducts={selectedProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onProductSelect={handleProductSelect}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
};

export default AdminDashboard;