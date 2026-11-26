import { apiClient } from "./client";
import { ApiCollection, UserVoucher, VoucherCheck } from "./types";

export async function listVouchers(): Promise<UserVoucher[]> {
  const { data } = await apiClient.get<ApiCollection<UserVoucher>>("vouchers");
  return data.data;
}

/**
 * Whether a voucher can be used on these items and how much it takes off.
 * Rejected vouchers throw an ApiError whose message says why.
 */
export async function checkVoucher(
  code: string,
  items: { product_size_id: number; quantity: number }[],
): Promise<VoucherCheck> {
  const { data } = await apiClient.post<{ data: VoucherCheck }>("vouchers/check", {
    code,
    items,
  });
  return data.data;
}
