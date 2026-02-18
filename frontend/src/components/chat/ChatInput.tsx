"use client";

import { useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isStreaming } = useChat();

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  }, [input, isStreaming, sendMessage]);

  return (
    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask about the job descriptions..."
          rows={2}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          disabled={isStreaming}
        />
        <button
          onClick={handleSubmit}
          disabled={isStreaming || !input.trim()}
          className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isStreaming ? "..." : "Send"}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        Press Ctrl+Enter to send
      </p>
    </div>
  );
}
