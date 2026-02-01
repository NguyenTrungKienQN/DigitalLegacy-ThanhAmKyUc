import { create } from "zustand";

type Draft = {
  title: string;
  narrator: string;
  tags: string[];
  note?: string;
  audioBlob?: Blob;
  audioMime?: string;
  durationMs?: number;
  savedId?: string;
};

type DraftStore = {
  draft: Draft;
  setMeta: (m: Pick<Draft, "title" | "narrator" | "tags">) => void;
  setRecording: (m: Pick<Draft, "audioBlob" | "audioMime" | "durationMs">) => void;
  setNote: (note: string) => void;
  setSavedId: (id: string) => void;
  reset: () => void;
};

const empty: Draft = { title: "", narrator: "", tags: [] };

export const useDraftStore = create<DraftStore>((set) => ({
  draft: empty,
  setMeta: (m) => set((s) => ({ draft: { ...s.draft, ...m } })),
  setRecording: (m) => set((s) => ({ draft: { ...s.draft, ...m } })),
  setNote: (note) => set((s) => ({ draft: { ...s.draft, note } })),
  setSavedId: (id) => set((s) => ({ draft: { ...s.draft, savedId: id } })),
  reset: () => set({ draft: empty }),
}));
