import axios, { AxiosError } from "axios";

const baseURL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class ApiError extends Error {
  status: number | null;
  errors: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number | null = null,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? null;
    const message =
      error.response?.data?.message ||
      (status === null ? "Network error. Please check your connection." : "Something went wrong.");

    return Promise.reject(new ApiError(message, status, error.response?.data?.errors ?? null));
  },
);

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
}
