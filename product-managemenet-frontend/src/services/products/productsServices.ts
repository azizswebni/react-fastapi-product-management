import { axiosInstance } from "@/lib/axios";
import {
  addProductPayload,
  AxiosError,
  PaginatedProductData,
  Product,
  ResponseDetail,
  updateProductPayload,
} from "@/lib/types";

export const deleteProductService = async (
  id: string
): Promise<ResponseDetail> => {
  try {
    const { data } = await axiosInstance.delete<ResponseDetail>(
      `/products/${id}`
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const addProductService = async (
  addProductData: addProductPayload
): Promise<ResponseDetail> => {
  try {
    const { data } = await axiosInstance.post<ResponseDetail>(
      "/products/",
      addProductData
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const updateProductService = async (
  id: string,
  updateProductData: updateProductPayload
): Promise<ResponseDetail> => {
  try {
    const { data } = await axiosInstance.put<ResponseDetail>(
      `/products/${id}`,
      updateProductData
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const getProductsService = async (
  page: number,
  size: number,
  optionValue?: string,
  options?: string
): Promise<PaginatedProductData> => {
  try {
    const params: Record<string, unknown> = {
      page,
      size,
    };
    if (optionValue) {
      params[`${options}`] = optionValue;
    }

    const { data } = await axiosInstance.get<PaginatedProductData>(
      "/products/",
      {
        params,
      }
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const addFavoriteService = async (
  productId: string
): Promise<{ detail: string }> => {
  try {
    const { data } = await axiosInstance.post<{ detail: string }>(
      `/products/${productId}/favorite`
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const getFavoriteProductsService = async (): Promise<[Product]> => {
  try {
    const { data } = await axiosInstance.get<[Product]>(
      `/products/favorites`
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const deleteFavoriteService = async (
  productId: string
): Promise<{ detail: string }> => {
  try {
    const { data } = await axiosInstance.delete<{ detail: string }>(
      `/products/${productId}/favorite`
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};
