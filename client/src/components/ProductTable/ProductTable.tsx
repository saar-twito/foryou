import React from 'react';
import styles from './ProductTable.module.scss';
import type { Product } from '../../interfaces/product';
import Pagination from '../Pagination/Pagination';

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  currentPage,
  totalPages,
  loading,
  onEdit,
  onDelete,
  onPageChange
}) => {
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(id);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.productTable}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
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