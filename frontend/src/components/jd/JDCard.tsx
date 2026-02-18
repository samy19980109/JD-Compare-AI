"use client";

import { useJDStore } from "@/stores/jdStore";
import { useAutoLabel } from "@/hooks/useAutoLabel";
import { JDLabel } from "./JDLabel";
import type { JDCard as JDCardType } from "@/types/jd";

interface JDCardProps {
  card: JDCardType;
  index: number;
}

export function JDCard({ card, index }: JDCardProps) {
  const { updateCardText, removeCard, toggleMute } = useJDStore();
  const { triggerAutoLabel } = useAutoLabel();

  const handleTextChange = (text: string) => {
    updateCardText(card.id, text);
    triggerAutoLabel(card.id, text);
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800 ${
        card.isMuted
          ? "border-gray-200 opacity-60 dark:border-gray-700"
          : "border-gray-300 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-500"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <JDLabel
          index={index}
          title={card.labelTitle}
          company={card.labelCompany}
          isLoading={card.isLabelLoading}
          isMuted={card.isMuted}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleMute(card.id)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title={card.isMuted ? "Unmute" : "Mute"}
          >
            {card.isMuted ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => removeCard(card.id)}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="Remove"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <textarea
        value={card.text}
        onChange={(e) => handleTextChange(e.target.value)}
        onPaste={(e) => {
          setTimeout(() => {
            const text = (e.target as HTMLTextAreaElement).value;
            triggerAutoLabel(card.id, text);
          }, 0);
        }}
        placeholder="Paste a job description here..."
        className="h-48 w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
      />
    </div>
  );
}
