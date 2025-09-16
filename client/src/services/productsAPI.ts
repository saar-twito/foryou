import type { CreateProductData, Product, ProductsResponse } from "../interfaces/product";
import { API_BASE_URL } from "./baseURL";

// Products API
export const productAPI = {
  getProducts: async (page: number = 1, limit: number = 10, search: string = ''): Promise<ProductsResponse> => {
    const url = `${API_BASE_URL}/products?page=${page}&limit=${limit}&search=${search}`;
    const response = await fetch(url);
    return response.json();
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  createProduct: async (productData: CreateProductData): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  updateProduct: async (id: string, productData: CreateProductData): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  deleteProduct: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  bulkUpdatePrice: async (ids: string[], discountPercent: number) => {
    const response = await fetch(`${API_BASE_URL}/products/bulk-update-price`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids, discountPercent }),
    });
    return response.json();
  },
};