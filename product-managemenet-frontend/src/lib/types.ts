export interface LoginResponse {
    access_token: string;
  role: string;
}


export interface Product {
  name: string;
  description: string;
  price: string;
  category: string;
  id: string;
  is_favorite: boolean;
}

export interface PaginatedProductData {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
