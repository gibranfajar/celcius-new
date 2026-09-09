import { apiClient } from "./client";
import { About } from "./types";

export async function getAbout(): Promise<About> {
  const { data } = await apiClient.get<{ data: About }>("about");
  return data.data;
}
