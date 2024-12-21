import { axiosInstance } from "@/lib/axios";
import { PaginatedProductData } from "@/lib/types";

export const getProductsService = async (page:number,size:number): Promise<PaginatedProductData> => {
  const { data } = await axiosInstance.get<PaginatedProductData>(`/products/?page=${page}&size=${size}`);
  return data;
};
