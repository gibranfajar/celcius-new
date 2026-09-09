import { apiClient } from "./client";
import { CheckoutResponse } from "./types";

export interface CheckoutPayload {
  shipping_receiver_name: string;
  shipping_email?: string | null;
  shipping_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string;
  shipping_cost: number;
  courier_code: string;
  courier_service: string;
  voucher_code?: string | null;
  notes?: string | null;
  items: { product_size_id: number; quantity: number }[];
}

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>("checkout", payload);
  return data;
}
