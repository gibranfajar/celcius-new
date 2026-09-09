import { apiClient } from "./client";
import { ApiCollection, Page, PageKey } from "./types";

export async function getPages(): Promise<Page[]> {
  const { data } = await apiClient.get<ApiCollection<Page>>("pages");
  return data.data;
}

export async function getPage(key: PageKey): Promise<Page> {
  const { data } = await apiClient.get<{ data: Page }>(`pages/${key}`);
  return data.data;
}
