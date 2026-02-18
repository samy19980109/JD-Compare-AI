"use client";

interface JDLabelProps {
  index: number;
  title: string | null;
  company: string | null;
  isLoading: boolean;
  isMuted: boolean;
}

export function JDLabel({ index, title, company, isLoading, isMuted }: JDLabelProps) {
  const label = title
    ? company
      ? `${title} @ ${company}`
      : title
    : `Job ${index + 1}`;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-semibold ${
          isMuted ? "text-gray-400 line-through dark:text-gray-500" : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {isLoading ? "Detecting..." : label}
      </span>
      {isMuted && (
        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          Muted
        </span>
      )}
    </div>
  );
}
