"use client";

import { useJDStore } from "@/stores/jdStore";
import { useChatStore } from "@/stores/chatStore";
import { JDCardList } from "@/components/jd/JDCardList";

export function MainContent() {
  const cards = useJDStore((s) => s.cards);
  const setActiveTab = useChatStore((s) => s.setActiveTab);

  const hasContent = cards.some((c) => c.text.trim().length > 0);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Job Descriptions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Paste job descriptions below. Add more with the + button.
          </p>
        </div>

        <JDCardList />

        {hasContent && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setActiveTab("chat")}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Start Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
