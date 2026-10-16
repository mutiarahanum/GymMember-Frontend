import type { ApiResponse } from "@/types";

const API_BASE_URL = process.env.API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

export async function apiFetch<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL belum diatur di .env.local");
  }

  if (!API_TOKEN) {
    throw new Error("API_TOKEN belum diatur di .env.local");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API gagal: HTTP ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}
