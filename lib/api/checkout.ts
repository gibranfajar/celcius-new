import { apiClient } from "./client";
import { CheckoutResponse, FulfillmentMethod } from "./types";

export interface CheckoutPayload {
  /** Delivered by courier (the default) or collected at a store. */
  fulfillment_method?: FulfillmentMethod;
  /** The store a pickup order is collected at. */
  pickup_store_code?: string | null;
  shipping_receiver_name: string;
  shipping_email?: string | null;
  shipping_phone: string;
  /** The delivery address and courier: required for shipping, left out for pickup. */
  shipping_address?: string;
  shipping_province?: string;
  shipping_city?: string;
  shipping_district?: string;
  shipping_postal_code?: string;
  shipping_cost?: number;
  courier_code?: string;
  courier_service?: string;
  voucher_code?: string | null;
  notes?: string | null;
  items: { product_size_id: number; quantity: number; store_code?: string | null }[];
}

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>("checkout", payload);
  return data;
}
