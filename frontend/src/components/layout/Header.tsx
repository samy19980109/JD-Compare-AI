"use client";

import { useChatStore } from "@/stores/chatStore";
import type { Provider } from "@/types/api";

export function Header() {
  const { provider, setProvider } = useChatStore();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">JD-Compare AI</h1>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          Beta
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Provider:</span>
        <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-0.5">
          {(["openai", "anthropic"] as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                provider === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "openai" ? "OpenAI" : "Anthropic"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
