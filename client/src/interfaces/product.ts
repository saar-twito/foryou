export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateProductData {
  name: string;
  price: number;
  category: string;
  description: string;
}