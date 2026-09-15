import { apiClient } from "./client";
import { ApiCollection, Banner, BannerPage } from "./types";

export async function getBanners(params?: {
  page?: BannerPage;
  position?: "top" | "bottom";
  display?: "desktop" | "tablet" | "mobile";
}): Promise<Banner[]> {
  const { data } = await apiClient.get<ApiCollection<Banner>>("banners", { params });
  return data.data;
}
