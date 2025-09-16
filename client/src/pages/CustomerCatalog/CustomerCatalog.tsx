import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './CustomerCatalog.module.scss';
import { productAPI } from '../../services/productsAPI';
import type { Product, ProductsResponse } from '../../interfaces/product';
import Pagination from '../../components/Pagination/Pagination';

interface SearchData {
  search: string;
}

const CustomerCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState('');
  const [loading, setLoading] = useState(false);

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
    reset
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
  }, []);

  const handleClearSearch = () => {
    reset();
    setCurrentSearch('');
    setCurrentPage(1);
    fetchProducts(1, '');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch products immediately when page changes
    fetchProducts(page, currentSearch);
  };

  return (
    <div className={styles.catalog}>
      <header className={styles.header}>
        <h1>Product Catalog</h1>
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
      </header>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className={styles.noResults}>
              <h1>
                {currentSearch
                  ? `No products found for "${currentSearch}"`
                  : 'No products available'
                }
              </h1>
            </div>
          ) : (
            <>
              <div className={styles.productGrid}>
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className={styles.productCard}
                  >
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
                    <p className={styles.productCategory}>{product.category}</p>
                    <p className={styles.productDescription}>
                      {product.description.substring(0, 100)}...
                    </p>
                  </Link>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerCatalog;