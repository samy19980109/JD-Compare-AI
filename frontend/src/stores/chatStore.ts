import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessageUI } from "@/types/chat";
import type { Provider } from "@/types/api";

type Tab = "jd" | "chat";

interface ChatStore {
  messages: ChatMessageUI[];
  isStreaming: boolean;
  error: string | null;
  provider: Provider;
  chatOpen: boolean;
  activeTab: Tab;

  setProvider: (provider: Provider) => void;
  setChatOpen: (open: boolean) => void;
  setActiveTab: (tab: Tab) => void;

  addUserMessage: (content: string) => void;
  startAssistantMessage: () => string;
  appendToMessage: (id: string, token: string) => void;
  finishMessage: (id: string) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  error: null,
  provider: "openai",
  chatOpen: false,
  activeTab: "jd",

  setProvider: (provider) => set({ provider }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: uuidv4(),
          role: "user",
          content,
          timestamp: Date.now(),
          isStreaming: false,
        },
      ],
    })),

  startAssistantMessage: () => {
    const id = uuidv4();
    set((state) => ({
      isStreaming: true,
      error: null,
      messages: [
        ...state.messages,
        {
          id,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          isStreaming: true,
        },
      ],
    }));
    return id;
  },

  appendToMessage: (id, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m
      ),
    })),

  finishMessage: (id) =>
    set((state) => ({
      isStreaming: false,
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming: false } : m
      ),
    })),

  setError: (error) => set({ error, isStreaming: false }),

  clearMessages: () => set({ messages: [], error: null }),
}));
