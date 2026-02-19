import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { JDCard } from "@/types/jd";
import type { WorkspaceItem } from "@/types/workspace";

interface JDStore {
  cards: JDCard[];
  workspaceId: string | null;
  workspaceName: string;

  setWorkspaceId: (id: string | null) => void;
  setWorkspaceName: (name: string) => void;
  loadFromWorkspace: (items: WorkspaceItem[]) => void;
  addCard: () => void;
  removeCard: (id: string) => void;
  updateCardText: (id: string, text: string) => void;
  toggleMute: (id: string) => void;
  setLabel: (id: string, title: string | null, company: string | null) => void;
  setLabelLoading: (id: string, loading: boolean) => void;
  getActiveCards: () => JDCard[];
  resetForSwitch: () => void;
}

function createEmptyCard(): JDCard {
  return {
    id: uuidv4(),
    text: "",
    labelTitle: null,
    labelCompany: null,
    isMuted: false,
    isLabelLoading: false,
  };
}

export const useJDStore = create<JDStore>((set, get) => ({
  cards: [createEmptyCard()],
  workspaceId: null,
  workspaceName: "Untitled Workspace",

  setWorkspaceId: (id) => set({ workspaceId: id }),
  setWorkspaceName: (name) => set({ workspaceName: name }),

  loadFromWorkspace: (items) =>
    set({
      cards:
        items.length > 0
          ? items.map((item) => ({
              id: item.id,
              text: item.raw_text,
              labelTitle: item.label_title,
              labelCompany: item.label_company,
              isMuted: item.is_muted,
              isLabelLoading: false,
            }))
          : [createEmptyCard()],
    }),

  addCard: () =>
    set((state) => ({ cards: [...state.cards, createEmptyCard()] })),

  removeCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
    })),

  updateCardText: (id, text) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, text } : c)),
    })),

  toggleMute: (id) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, isMuted: !c.isMuted } : c
      ),
    })),

  setLabel: (id, title, company) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id
          ? { ...c, labelTitle: title, labelCompany: company }
          : c
      ),
    })),

  setLabelLoading: (id, loading) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, isLabelLoading: loading } : c
      ),
    })),

  getActiveCards: () => get().cards.filter((c) => !c.isMuted && c.text.trim()),

  resetForSwitch: () =>
    set({
      cards: [createEmptyCard()],
      workspaceId: null,
      workspaceName: "Untitled Workspace",
    }),
}));
