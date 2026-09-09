import { apiClient } from "./client";
import { CheckoutResponse, Order, Paginated } from "./types";

export async function listOrders(page = 1): Promise<Paginated<Order>> {
  const { data } = await apiClient.get<Paginated<Order>>("orders", { params: { page } });
  return data;
}

export async function confirmOrder(orderId: number): Promise<Order> {
  const { data } = await apiClient.post<{ data: Order }>(`orders/${orderId}/confirm`);
  return data.data;
}

// Always mints a fresh Snap token - the one from checkout is short-lived and
// has typically expired by the time a customer comes back to pay.
export async function payOrder(
  orderId: number,
): Promise<Pick<CheckoutResponse, "snap_token" | "redirect_url">> {
  const { data } = await apiClient.post<Pick<CheckoutResponse, "snap_token" | "redirect_url">>(
    `orders/${orderId}/pay`,
  );
  return data;
}
