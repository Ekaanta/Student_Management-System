import { ApiResponse } from "@/types";
import { API_BASE_URL, STORAGE_KEYS } from "./constants";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "An error occurred during request execution.",
        errors: data.errors || [res.statusText],
      };
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Network error. Failed to communicate with API backend.",
      errors: [error.toString()],
    };
  }
}
