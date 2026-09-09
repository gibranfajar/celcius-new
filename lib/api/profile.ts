import { apiClient } from "./client";
import { User } from "./types";

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone_number: string | null;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<{ data: User }>("profile");
  return data.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.put<{ data: User }>("profile", payload);
  return data.data;
}
