import { apiClient } from "./client";
import { ShippingArea, ShippingRate } from "./types";

export async function getProvinces(): Promise<ShippingArea[]> {
  const { data } = await apiClient.get<{ data: ShippingArea[] }>("shipping/provinces");
  return data.data;
}

export async function getCities(provinceId: number | string): Promise<ShippingArea[]> {
  const { data } = await apiClient.get<{ data: ShippingArea[] }>(
    `shipping/provinces/${provinceId}/cities`,
  );
  return data.data;
}

export async function getDistricts(cityId: number | string): Promise<ShippingArea[]> {
  const { data } = await apiClient.get<{ data: ShippingArea[] }>(`shipping/cities/${cityId}/districts`);
  return data.data;
}

export async function getSubdistricts(districtId: number | string): Promise<ShippingArea[]> {
  const { data } = await apiClient.get<{ data: ShippingArea[] }>(
    `shipping/districts/${districtId}/subdistricts`,
  );
  return data.data;
}

export async function getShippingCost(params: {
  destination: string;
  weight: number;
  couriers: string[];
}): Promise<ShippingRate[]> {
  const { data } = await apiClient.post<{ data: ShippingRate[] }>("shipping/cost", params);
  return data.data;
}
