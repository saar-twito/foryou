import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import styles from './ProductDetails.module.scss';
import { productAPI } from '../../services/productsAPI';
import type { Product } from '../../interfaces/product';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const productData = await productAPI.getProduct(id);
        setProduct(productData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error || 'Product not found'}</p>
        <Link to="/" className={styles.backLink}>
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.productDetails}>
      <Link to="/" className={styles.backLink}>
        Back to catalog
      </Link>

      <div className={styles.productInfo}>
        <h1 className={styles.productName}>{product.name}</h1>

        <div className={styles.productMeta}>
          <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
          <p className={styles.productCategory}>Category: {product.category}</p>
        </div>

        <div className={styles.productDescription}>
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>

        <div className={styles.productDates}>
          <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          <p><strong>Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;