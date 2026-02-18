"use client";

import { useJDStore } from "@/stores/jdStore";
import { MAX_JD_CARDS } from "@/lib/constants";

export function JDAddButton() {
  const { cards, addCard } = useJDStore();

  if (cards.length >= MAX_JD_CARDS) return null;

  return (
    <button
      onClick={addCard}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-sm font-medium">Add Job Description</span>
    </button>
  );
}
