import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './ProductForm.module.scss';
import type { Product, CreateProductData } from '../../interfaces/product';

interface ProductFormProps {
  showForm: boolean;
  editingProduct: Product | null;
  onSubmit: (data: CreateProductData) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  showForm,
  editingProduct,
  onSubmit,
  onCancel
}) => {
  // Validation schema
  const productSchema = yup.object().shape({
    name: yup
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(200, 'Product name must not exceed 200 characters')
      .required('Product name is required'),
    price: yup
      .number()
      .positive('Price must be a positive number')
      .min(0.01, 'Price must be at least $0.01')
      .required('Price is required'),
    category: yup
      .string()
      .min(2, 'Category must be at least 2 characters')
      .max(100, 'Category must not exceed 100 characters')
      .required('Category is required'),
    description: yup
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must not exceed 1000 characters')
      .required('Description is required')
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateProductData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: '',
      description: ''
    }
  });

  // Update form values when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      reset({
        name: editingProduct.name,
        price: editingProduct.price,
        category: editingProduct.category,
        description: editingProduct.description
      });
    } else {
      reset({
        name: '',
        price: 0,
        category: '',
        description: ''
      });
    }
  }, [editingProduct, reset]);

  const handleFormSubmit = async (data: CreateProductData) => {
    await onSubmit(data);
    reset({
      name: '',
      price: 0,
      category: '',
      description: ''
    });
  };

  const handleCancel = () => {
    reset({
      name: '',
      price: 0,
      category: '',
      description: ''
    });
    onCancel();
  };

  if (!showForm) return null;

  return (
    <div className={styles.formOverlay}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.productForm}>
        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>

        <div>
          <input
            type="text"
            placeholder="Product Name"
            {...register('name')}
            className={errors.name ? styles.errorInput : ''}
          />
          {errors.name && (
            <span className={styles.fieldError}>{errors.name.message}</span>
          )}
        </div>

        <div>
          <input
            type="number"
            placeholder="Price"
            step="0.01"
            min="0"
            {...register('price', {
              setValueAs: (value) => parseFloat(value) || 0
            })}
            className={errors.price ? styles.errorInput : ''}
          />
          {errors.price && (
            <span className={styles.fieldError}>{errors.price.message}</span>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Category"
            {...register('category')}
            className={errors.category ? styles.errorInput : ''}
          />
          {errors.category && (
            <span className={styles.fieldError}>{errors.category.message}</span>
          )}
        </div>

        <div>
          <textarea
            placeholder="Description"
            rows={4}
            {...register('description')}
            className={errors.description ? styles.errorInput : ''}
          />
          {errors.description && (
            <span className={styles.fieldError}>{errors.description.message}</span>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            {editingProduct ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;