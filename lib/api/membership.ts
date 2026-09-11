import { apiClient } from "./client";
import {
  MembershipPromo,
  MembershipProfileResponse,
} from "./types";

export async function getMembershipPromos(): Promise<MembershipPromo[]> {
  const { data } = await apiClient.get<{ data: MembershipPromo[] }>(
    "membership/promos",
  );
  return data.data;
}

export async function getMembershipProfile(): Promise<MembershipProfileResponse> {
  const { data } =
    await apiClient.get<MembershipProfileResponse>("membership/profile");
  return data;
}
