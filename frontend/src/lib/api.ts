import { API_BASE } from "./constants";
import type { LabelResponse } from "@/types/api";
import type { Provider } from "@/types/api";

export async function extractLabel(
  text: string,
  provider: Provider
): Promise<LabelResponse> {
  const res = await fetch(`${API_BASE}/api/v1/labels/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, provider }),
  });
  if (!res.ok) throw new Error("Failed to extract label");
  return res.json();
}
