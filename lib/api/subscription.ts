import { apiClient } from "./client";

export async function subscribe(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("subscribe", { email });
  return data;
}
