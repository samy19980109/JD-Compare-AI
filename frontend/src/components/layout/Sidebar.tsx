"use client";

import { useChatStore } from "@/stores/chatStore";
import { ChatPanel } from "@/components/chat/ChatPanel";

export function Sidebar() {
  const { chatOpen, setChatOpen } = useChatStore();

  if (!chatOpen) return null;

  return (
    <div className="flex h-full w-[480px] flex-shrink-0 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-end px-4 pt-2">
        <button
          onClick={() => setChatOpen(false)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Close chat"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ChatPanel />
    </div>
  );
}
