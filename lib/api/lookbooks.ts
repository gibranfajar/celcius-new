import { apiClient } from "./client";
import { Lookbook, Paginated } from "./types";

export async function getLookbooks(page = 1): Promise<Paginated<Lookbook>> {
  const { data } = await apiClient.get<Paginated<Lookbook>>("lookbooks", {
    params: { page },
  });
  return data;
}

export async function getLookbook(slug: string): Promise<Lookbook> {
  const { data } = await apiClient.get<{ data: Lookbook }>(`lookbooks/${slug}`);
  return data.data;
}
