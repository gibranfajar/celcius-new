import { apiClient } from "./client";
import { Collection, Paginated } from "./types";

export async function getCollections(page = 1): Promise<Paginated<Collection>> {
  const { data } = await apiClient.get<Paginated<Collection>>("collections", {
    params: { page },
  });
  return data;
}

export async function getCollection(slug: string): Promise<Collection> {
  const { data } = await apiClient.get<{ data: Collection }>(`collections/${slug}`);
  return data.data;
}
