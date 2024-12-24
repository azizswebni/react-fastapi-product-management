export interface AuthResponse {
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
export interface addProductPayload {
  name: string;
  category: string;
  description: string;
  price: number;
}

export interface updateProductPayload {
  name: string;
  category: string;
  description: string;
  price: number;
}

export interface ResponseDetail {
  details: string;
}

export interface AxiosError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}
