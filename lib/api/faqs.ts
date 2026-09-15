import { apiClient } from "./client";
import { ApiCollection, Faq } from "./types";

export async function getFaqs(): Promise<Faq[]> {
  const { data } = await apiClient.get<ApiCollection<Faq>>("faqs");
  return data.data;
}
