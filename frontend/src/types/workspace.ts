export interface WorkspaceItem {
  id: string;
  raw_text: string;
  label_title: string | null;
  label_company: string | null;
  is_muted: boolean;
  sort_order: number;
  created_at: string;
}

export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  item_count: number;
  updated_at: string;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  items: WorkspaceItem[];
  chat_messages: WorkspaceChatMessage[];
  updated_at: string;
}
