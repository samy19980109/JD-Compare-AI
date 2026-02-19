"use client";

import { useEffect, useRef, useCallback } from "react";
import { create } from "zustand";
import { useJDStore } from "@/stores/jdStore";
import { syncItems } from "@/lib/workspace";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveStore {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
}

export const useAutoSaveStore = create<AutoSaveStore>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));

const DEBOUNCE_MS = 2000;

export function useAutoSave() {
  const cards = useJDStore((s) => s.cards);
  const workspaceId = useJDStore((s) => s.workspaceId);
  const setStatus = useAutoSaveStore((s) => s.setStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);

  const doSave = useCallback(async () => {
    if (!workspaceId) return;

    const payload = cards.map((c, idx) => ({
      id: c.id,
      raw_text: c.text,
      label_title: c.labelTitle,
      label_company: c.labelCompany,
      is_muted: c.isMuted,
      sort_order: idx,
    }));

    const snapshot = JSON.stringify(payload);
    if (snapshot === lastSavedRef.current) return;

    setStatus("saving");
    try {
      await syncItems(workspaceId, payload);
      lastSavedRef.current = snapshot;
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [cards, workspaceId, setStatus]);

  useEffect(() => {
    // Skip auto-save on initial load (workspace just loaded from server)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      // Set the initial snapshot so we don't re-save unchanged data
      const payload = cards.map((c, idx) => ({
        id: c.id,
        raw_text: c.text,
        label_title: c.labelTitle,
        label_company: c.labelCompany,
        is_muted: c.isMuted,
        sort_order: idx,
      }));
      lastSavedRef.current = JSON.stringify(payload);
      return;
    }

    if (!workspaceId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cards, workspaceId, doSave]);
}
