import React from 'react';
import styles from './ProductTable.module.scss';
import type { Product } from '../../interfaces/product';
import Pagination from '../Pagination/Pagination';

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  selectedProducts: Set<string>;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onProductSelect: (productId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  currentPage,
  totalPages,
  loading,
  selectedProducts,
  onEdit,
  onDelete,
  onPageChange,
  onProductSelect,
  onSelectAll
}) => {
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(id);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const handleProductSelect = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    onProductSelect(productId, e.target.checked);
  };

  const allSelected = products.length > 0 && products.every(product => selectedProducts.has(product._id));

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.productTable}>
        {selectedProducts.size > 0 && (
          <div className={styles.selectionInfo}>
            {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                style={{
                  backgroundColor: selectedProducts.has(product._id) ? '#f0f9ff' : 'transparent'
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product._id)}
                    onChange={(e) => handleProductSelect(product._id, e)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.category}</td>
                <td className={styles.actions}>
                  <button
                    onClick={() => onEdit(product)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default ProductTable;