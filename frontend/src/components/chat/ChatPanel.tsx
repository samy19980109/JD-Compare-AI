"use client";

import { useChatStore } from "@/stores/chatStore";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatPanel() {
  const error = useChatStore((s) => s.error);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-6 py-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <ChatMessageList />
      </div>
      <div className="mx-auto w-full max-w-4xl px-6 py-4">
        <ChatInput />
      </div>
    </div>
  );
}
