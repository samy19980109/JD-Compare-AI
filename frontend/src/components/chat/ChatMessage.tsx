"use client";

import ReactMarkdown from "react-markdown";
import { StreamingIndicator } from "./StreamingIndicator";
import type { ChatMessageUI } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageUI;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : message.isStreaming ? (
              <StreamingIndicator />
            ) : null}
            {message.isStreaming && message.content && (
              <span className="ml-1 inline-block">
                <StreamingIndicator />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
