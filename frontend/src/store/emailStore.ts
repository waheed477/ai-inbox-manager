import { create } from "zustand";
import { mockEmails, sentEmails, Email, EmailCategory } from "@/data/mockEmails";

interface EmailStore {
  emails: Email[];
  sentEmails: Email[];
  selectedEmail: Email | null;
  selectedCategory: EmailCategory;
  searchQuery: string;
  isSummarizing: boolean;
  replyText: string;
  selectedTone: "Formal" | "Friendly" | "Concise";
  priorityMode: boolean;

  setSelectedEmail: (email: Email | null) => void;
  setSelectedCategory: (cat: EmailCategory) => void;
  setSearchQuery: (q: string) => void;
  markAsRead: (id: string) => void;
  toggleImportant: (id: string) => void;
  generateSummary: (id: string) => Promise<void>;
  setReplyText: (text: string) => void;
  setSelectedTone: (tone: "Formal" | "Friendly" | "Concise") => void;
  setPriorityMode: (on: boolean) => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: mockEmails,
  sentEmails: sentEmails,
  selectedEmail: null,
  selectedCategory: "All",
  searchQuery: "",
  isSummarizing: false,
  replyText: "",
  selectedTone: "Formal",
  priorityMode: false,

  setSelectedEmail: (email) => {
    set({ selectedEmail: email, replyText: "" });
    if (email) {
      get().markAsRead(email.id);
    }
  },

  setSelectedCategory: (cat) => set({ selectedCategory: cat, selectedEmail: null }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  markAsRead: (id) =>
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)),
    })),

  toggleImportant: (id) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === id ? { ...e, isImportant: !e.isImportant } : e
      ),
      selectedEmail:
        state.selectedEmail?.id === id
          ? { ...state.selectedEmail, isImportant: !state.selectedEmail.isImportant }
          : state.selectedEmail,
    })),

  generateSummary: async (id) => {
    set({ isSummarizing: true });
    await new Promise((res) => setTimeout(res, 1500));
    set({ isSummarizing: false });
  },

  setReplyText: (text) => set({ replyText: text }),

  setSelectedTone: (tone) => set({ selectedTone: tone }),

  setPriorityMode: (on) => set({ priorityMode: on }),
}));

export function useFilteredEmails() {
  const { emails, sentEmails, selectedCategory, searchQuery, priorityMode } = useEmailStore();

  let list = selectedCategory === "All" || selectedCategory === "Important" || selectedCategory === "Work" || selectedCategory === "Promotions"
    ? emails
    : sentEmails;

  if (selectedCategory === "Important") {
    list = list.filter((e) => e.isImportant);
  } else if (selectedCategory === "Work") {
    list = list.filter((e) => e.category === "Work");
  } else if (selectedCategory === "Promotions") {
    list = list.filter((e) => e.category === "Promotions");
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.sender.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q)
    );
  }

  // Priority mode: float important emails to the top, preserve relative order within each group
  if (priorityMode) {
    const important = list.filter((e) => e.isImportant);
    const rest = list.filter((e) => !e.isImportant);
    list = [...important, ...rest];
  }

  return list;
}
