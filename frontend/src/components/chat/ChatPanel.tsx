"use client";

import { useChatStore } from "@/stores/chatStore";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatPanel() {
  const error = useChatStore((s) => s.error);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">AI Chat</h2>
        <p className="text-xs text-gray-400">
          Ask questions about your job descriptions
        </p>
      </div>
      {error && (
        <div className="mx-4 mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}
      <ChatMessageList />
      <ChatInput />
    </div>
  );
}
