import { apiClient } from "./client";
import { ApiCollection, Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiCollection<Category>>("categories");
  return data.data;
}
