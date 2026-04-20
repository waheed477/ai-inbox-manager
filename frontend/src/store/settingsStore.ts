import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  defaultTone: "Formal" | "Friendly" | "Concise";
  autoArchivePromotions: boolean;
  autoArchiveNewsletters: boolean;
  smartLabeling: boolean;
  dailyDigest: boolean;
  summaryOnOpen: boolean;

  setDefaultTone: (tone: "Formal" | "Friendly" | "Concise") => void;
  setAutoArchivePromotions: (val: boolean) => void;
  setAutoArchiveNewsletters: (val: boolean) => void;
  setSmartLabeling: (val: boolean) => void;
  setDailyDigest: (val: boolean) => void;
  setSummaryOnOpen: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultTone: "Formal",
      autoArchivePromotions: true,
      autoArchiveNewsletters: false,
      smartLabeling: true,
      dailyDigest: false,
      summaryOnOpen: false,

      setDefaultTone: (tone) => set({ defaultTone: tone }),
      setAutoArchivePromotions: (val) => set({ autoArchivePromotions: val }),
      setAutoArchiveNewsletters: (val) => set({ autoArchiveNewsletters: val }),
      setSmartLabeling: (val) => set({ smartLabeling: val }),
      setDailyDigest: (val) => set({ dailyDigest: val }),
      setSummaryOnOpen: (val) => set({ summaryOnOpen: val }),
    }),
    { name: "inboxflow-settings" }
  )
);
