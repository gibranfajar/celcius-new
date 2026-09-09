import { apiClient } from "./client";
import { ApiCollection, Location } from "./types";

export async function getLocations(params?: { type?: string }): Promise<Location[]> {
  const { data } = await apiClient.get<ApiCollection<Location>>("locations", { params });
  return data.data;
}
