"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { ChatMessage } from "./ChatMessage";

export function ChatMessageList() {
  const messages = useChatStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg font-medium text-gray-400">No messages yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Paste job descriptions and ask questions to compare them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
