import { LoginResponse } from "@/lib/types";
import { axiosInstance } from "../../lib/axios";

interface LoginCredentials {
  username: string;
  password: string;
}



export const loginService = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    credentials
  );  
  return data;
};
