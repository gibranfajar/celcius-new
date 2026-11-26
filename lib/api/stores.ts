import { apiClient } from "./client";
import { StoreStockResult } from "./types";

export interface GetStoreStockParams {
  latitude?: number;
  longitude?: number;
  province?: string;
}

/**
 * The stores that have one size of a product in stock, nearest first when
 * the shopper's location is given.
 */
export async function getStoreStock(
  productSizeId: number,
  params: GetStoreStockParams = {},
): Promise<StoreStockResult> {
  const { data } = await apiClient.get<{ data: StoreStockResult }>(
    `product-sizes/${productSizeId}/stores`,
    { params },
  );
  return data.data;
}
