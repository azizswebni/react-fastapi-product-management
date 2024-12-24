import { AxiosError, AuthResponse } from "@/lib/types";
import { axiosInstance } from "../../lib/axios";

interface authCredentials {
  username: string;
  password: string;
}



export const loginService = async (
  credentials: authCredentials
): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return data;

  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};

export const RegisterService = async (
  credentials: authCredentials
): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    return data;

  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data?.detail || "An unexpected error occurred.";
  }
};