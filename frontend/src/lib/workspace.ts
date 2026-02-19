import { API_BASE } from "./constants";
import type { WorkspaceDetail, WorkspaceSummary } from "@/types/workspace";

export async function listWorkspaces(): Promise<WorkspaceSummary[]> {
  const res = await fetch(`${API_BASE}/api/v1/jd-sets`);
  if (!res.ok) throw new Error("Failed to list workspaces");
  return res.json();
}

export async function createWorkspace(
  name?: string
): Promise<WorkspaceDetail> {
  const res = await fetch(`${API_BASE}/api/v1/jd-sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || null }),
  });
  if (!res.ok) throw new Error("Failed to create workspace");
  return res.json();
}

export async function loadWorkspace(id: string): Promise<WorkspaceDetail> {
  const res = await fetch(`${API_BASE}/api/v1/jd-sets/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("WORKSPACE_NOT_FOUND");
    throw new Error("Failed to load workspace");
  }
  return res.json();
}

export async function updateWorkspaceName(
  id: string,
  name: string
): Promise<WorkspaceDetail> {
  const res = await fetch(`${API_BASE}/api/v1/jd-sets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update workspace");
  return res.json();
}

export async function deleteWorkspace(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/jd-sets/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete workspace");
}

export async function syncItems(
  id: string,
  items: {
    id: string;
    raw_text: string;
    label_title: string | null;
    label_company: string | null;
    is_muted: boolean;
    sort_order: number;
  }[]
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/jd-sets/${id}/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Failed to sync items");
}
