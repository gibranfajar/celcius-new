import { apiClient } from "./client";
import { ApiCollection, Look } from "./types";

/**
 * Every look of the 3D showroom (men's and women's together), with the
 * products each one wears.
 */
export async function getLooks(): Promise<Look[]> {
  const { data } = await apiClient.get<ApiCollection<Look>>("looks");
  return data.data;
}
