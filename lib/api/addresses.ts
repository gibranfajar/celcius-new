import { apiClient } from "./client";
import { ApiCollection, UserAddress } from "./types";

export interface UserAddressPayload {
  receiver_name: string;
  phone_number: string;
  province_id: number;
  province: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  subdistrict_id: number;
  subdistrict: string;
  postal_code: string;
  address: string;
  is_primary?: boolean;
}

export async function listAddresses(): Promise<UserAddress[]> {
  const { data } = await apiClient.get<ApiCollection<UserAddress>>("addresses");
  return data.data;
}

export async function createAddress(payload: UserAddressPayload): Promise<UserAddress> {
  const { data } = await apiClient.post<{ data: UserAddress }>("addresses", payload);
  return data.data;
}

export async function updateAddress(
  id: number,
  payload: Partial<UserAddressPayload>,
): Promise<UserAddress> {
  const { data } = await apiClient.put<{ data: UserAddress }>(`addresses/${id}`, payload);
  return data.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await apiClient.delete(`addresses/${id}`);
}
