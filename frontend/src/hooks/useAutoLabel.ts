import { useCallback, useRef } from "react";
import { useJDStore } from "@/stores/jdStore";
import { useChatStore } from "@/stores/chatStore";
import { extractLabel } from "@/lib/api";

export function useAutoLabel() {
  const { setLabel, setLabelLoading } = useJDStore();
  const provider = useChatStore((s) => s.provider);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const triggerAutoLabel = useCallback(
    (cardId: string, text: string) => {
      // Clear any pending debounce
      if (timers.current[cardId]) {
        clearTimeout(timers.current[cardId]);
      }

      // Don't label empty or very short text
      if (text.trim().length < 50) {
        setLabel(cardId, null, null);
        return;
      }

      timers.current[cardId] = setTimeout(async () => {
        setLabelLoading(cardId, true);
        try {
          const result = await extractLabel(text, provider);
          setLabel(cardId, result.title, result.company);
        } catch {
          // Silently fail - labels are non-critical
        } finally {
          setLabelLoading(cardId, false);
        }
      }, 500);
    },
    [provider, setLabel, setLabelLoading]
  );

  return { triggerAutoLabel };
}
