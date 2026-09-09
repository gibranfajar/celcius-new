import { apiClient } from "./client";
import { Paginated, Product, ProductType } from "./types";

export interface GetProductsParams {
  page?: number;
  type?: ProductType;
  category?: string;
  search?: string;
  onSale?: boolean;
}

export async function getProducts(params: GetProductsParams = {}): Promise<Paginated<Product>> {
  const { data } = await apiClient.get<Paginated<Product>>("products", {
    params: {
      page: params.page,
      type: params.type,
      category: params.category,
      search: params.search,
      on_sale: params.onSale ? 1 : undefined,
    },
  });
  return data;
}

export async function getProduct(slug: string): Promise<Product> {
  const { data } = await apiClient.get<{ data: Product }>(`products/${slug}`);
  return data.data;
}
