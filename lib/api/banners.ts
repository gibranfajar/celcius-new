import { apiClient } from "./client";
import { ApiCollection, Banner } from "./types";

export async function getBanners(params?: {
  page?: string;
  position?: string;
  display?: string;
}): Promise<Banner[]> {
  const { data } = await apiClient.get<ApiCollection<Banner>>("banners", { params });
  return data.data;
}
