import { apiClient } from "./client";
import { ApiCollection, ProductCare } from "./types";

export async function getProductCares(): Promise<ProductCare[]> {
  const { data } = await apiClient.get<ApiCollection<ProductCare>>("product-cares");
  return data.data;
}
