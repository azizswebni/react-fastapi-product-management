import { axiosInstance } from "@/lib/axios";
import {
  addProductPayload,
  PaginatedProductData,
  ResponseDetail,
} from "@/lib/types";

export const deleteProductService = async (
  id: string
): Promise<ResponseDetail> => {
  const { data } = await axiosInstance.delete<ResponseDetail>(
    `/products/${id}`
  );
  return data;
};

export const addProductService = async (
  addProductData: addProductPayload
): Promise<ResponseDetail> => {
  const { data } = await axiosInstance.post<ResponseDetail>(
    "/products/",
    addProductData
  );
  return data;
};

export const getProductsService = async (
  page: number,
  size: number,
  optionValue?: string,
  options?: string
): Promise<PaginatedProductData> => {
  const params: Record<string, unknown> = {
    page,
    size,
  };
  if (optionValue) {
    params[`${options}`] = optionValue;
  }

  const { data } = await axiosInstance.get<PaginatedProductData>("/products/", {
    params,
  });
  return data;
};

export const addFavoriteService = async (
  productId: string
): Promise<{ detail: string }> => {
  const { data } = await axiosInstance.post<{ detail: string }>(
    `/products/${productId}/favorite`
  );
  return data;
};

export const deleteFavoriteService = async (
  productId: string
): Promise<{ detail: string }> => {
  const { data } = await axiosInstance.delete<{ detail: string }>(
    `/products/${productId}/favorite`
  );
  return data;
};
