export interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming: boolean;
}

export interface ChatRequest {
  jd_cards: {
    id: string;
    text: string;
    label_title: string | null;
    label_company: string | null;
    is_muted: boolean;
  }[];
  messages: { role: "user" | "assistant"; content: string }[];
  user_message: string;
  provider: "openai" | "anthropic";
  jd_set_id?: string | null;
}
