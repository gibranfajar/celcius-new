import { apiClient } from "./client";
import { ApiCollection, UserVoucher } from "./types";

export async function listVouchers(): Promise<UserVoucher[]> {
  const { data } = await apiClient.get<ApiCollection<UserVoucher>>("vouchers");
  return data.data;
}
