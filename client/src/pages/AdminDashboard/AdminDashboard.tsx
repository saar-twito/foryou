import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import styles from './AdminDashboard.module.scss';
import { productAPI } from '../../services/productsAPI';
import type { Product, CreateProductData, ProductsResponse } from '../../interfaces/product';
import ProductForm from '../../components/ProductForm/ProductForm';
import ProductTable from '../../components/ProductTable/ProductTable';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async (page: number = 1) => {
    setLoading(true);
    try {
      const data: ProductsResponse = await productAPI.getProducts(page, 10);
      setProducts(data.products);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleFormSubmit = async (data: CreateProductData) => {
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, data);
      } else {
        await productAPI.createProduct(data);
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts(currentPage);
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
      fetchProducts(currentPage);
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