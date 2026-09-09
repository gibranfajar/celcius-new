import { apiClient } from "./client";
import { News, Paginated } from "./types";

export async function getNews(page = 1): Promise<Paginated<News>> {
  const { data } = await apiClient.get<Paginated<News>>("news", { params: { page } });
  return data;
}
