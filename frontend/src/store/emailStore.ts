import { create } from 'zustand';
import { apiRequest } from '@/lib/api';
import { EmailCategory, sentEmails } from '@/data/mockEmails';

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatar: string;
  subject: string;
  preview: string;
  body: string;
  aiSummary: string[];
  aiReplySuggestions?: string[];
  time: string;
  date: string;
  isRead: boolean;
  isImportant: boolean;
  isStarred: boolean; // ✅ Added isStarred field
  category: Exclude<EmailCategory, "All">;
  labels?: string[];
}

interface EmailStore {
  emails: Email[];
  sentEmails: Email[];
  loading: boolean;
  selectedEmail: Email | null;
  selectedCategory: EmailCategory;
  searchQuery: string;
  priorityMode: boolean;
  isSummarizing: boolean;
  isGeneratingReplies: boolean;
  replyText: string;
  selectedTone: string;

  fetchEmails: () => Promise<void>;
  selectEmail: (id: string) => void;
  setSelectedEmail: (email: Email | null) => void;
  clearSelection: () => void;
  setSelectedCategory: (category: EmailCategory) => void;
  setSearchQuery: (query: string) => void;
  setPriorityMode: (mode: boolean) => void;
  toggleImportant: (id: string) => void;
  toggleStar: (id: string) => Promise<void>;
  generateSummary: (id: string) => Promise<void>;
  setReplyText: (text: string) => void;
  setSelectedTone: (tone: string) => void;
  setIsSummarizing: (val: boolean) => void;
  setIsGeneratingReplies: (val: boolean) => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  sentEmails: sentEmails,
  loading: false,
  selectedEmail: null,
  selectedCategory: "All",
  searchQuery: "",
  priorityMode: false,
  isSummarizing: false,
  isGeneratingReplies: false,
  replyText: "",
  selectedTone: "Formal",

  fetchEmails: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest('/api/gmail/messages');
      const normalized: Email[] = Array.isArray(data)
        ? data.map((item: any) => {
            const receivedDate = item.receivedAt ? new Date(item.receivedAt) : null;
            const fromStr = item.from || "";
            const emailMatch = fromStr.match(/<([^>]+)>/);
            const sender = emailMatch ? fromStr.split('<')[0].trim() : fromStr;
            const senderEmail = emailMatch ? emailMatch[1] : fromStr;
            return {
              id: item.id,
              sender: sender || "Unknown",
              senderEmail: senderEmail || "",
              senderAvatar: (sender || "??").slice(0, 2).toUpperCase(),
              subject: item.subject || "",
              preview: item.snippet || "",
              body: item.body || "",
              aiSummary: typeof item.aiSummary === 'string' ? [item.aiSummary] : [],
              aiReplySuggestions: Array.isArray(item.aiReplySuggestions) ? item.aiReplySuggestions : undefined,
              time: receivedDate ? receivedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
              date: receivedDate ? receivedDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : "",
              isRead: item.isRead ?? false,
              isImportant: item.isStarred ?? false,  // Map isStarred to isImportant
              isStarred: item.isStarred ?? false,    // ✅ Added: direct isStarred field
              category: item.category || "Work",
              labels: item.labels || [],
            };
          })
        : [];
      set({ emails: normalized, loading: false });
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      set({ emails: [], loading: false });
    }
  },

  selectEmail: (id) => {
    const email = get().emails.find((e) => e.id === id) || null;
    set({ selectedEmail: email });
  },

  setSelectedEmail: (email) => set({ selectedEmail: email }),
  clearSelection: () => set({ selectedEmail: null }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriorityMode: (mode) => set({ priorityMode: mode }),

  toggleImportant: (id) => {
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === id ? { ...e, isImportant: !e.isImportant, isStarred: !e.isStarred } : e
      ),
      selectedEmail:
        state.selectedEmail?.id === id
          ? { ...state.selectedEmail, isImportant: !state.selectedEmail.isImportant, isStarred: !state.selectedEmail.isStarred }
          : state.selectedEmail,
    }));
  },

  toggleStar: async (id: string) => {
    console.log('🔍 toggleStar called with id:', id);
    
    const email = get().emails.find((e) => e.id === id);
    console.log('📧 Found email:', email);
    console.log('📊 Current emails in store:', get().emails.length);
    
    if (!email) {
      console.error('❌ Email not found with id:', id);
      return;
    }

    const newStarred = !email.isImportant;
    console.log('⭐ New starred value:', newStarred);

    // Optimistic update - update both isImportant and isStarred
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === id ? { ...e, isImportant: newStarred, isStarred: newStarred } : e
      ),
      selectedEmail:
        state.selectedEmail?.id === id
          ? { ...state.selectedEmail, isImportant: newStarred, isStarred: newStarred }
          : state.selectedEmail,
    }));

    try {
      console.log('📡 Calling API: /api/gmail/star with emailId:', id);
      await apiRequest('/api/gmail/star', {
        method: 'POST',
        body: JSON.stringify({ emailId: id, isStarred: newStarred }),
      });
      console.log('✅ API call successful');
    } catch (err) {
      console.error('❌ API call failed:', err);
      // Revert on error - revert both fields
      set((state) => ({
        emails: state.emails.map((e) =>
          e.id === id ? { ...e, isImportant: !newStarred, isStarred: !newStarred } : e
        ),
        selectedEmail:
          state.selectedEmail?.id === id
            ? { ...state.selectedEmail, isImportant: !newStarred, isStarred: !newStarred }
            : state.selectedEmail,
      }));
    }
  },

  generateSummary: async (id) => {
    set({ isSummarizing: true });
    try {
      const email = get().emails.find((e) => e.id === id);
      if (!email) return;
      const data = await apiRequest('/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ emailBody: email.body }),
      });
      set((state) => ({
        emails: state.emails.map((e) =>
          e.id === id ? { ...e, aiSummary: data.summary ? [data.summary] : e.aiSummary } : e
        ),
        selectedEmail:
          state.selectedEmail?.id === id
            ? { ...state.selectedEmail, aiSummary: data.summary ? [data.summary] : state.selectedEmail.aiSummary }
            : state.selectedEmail,
        isSummarizing: false,
      }));
    } catch (err) {
      console.error('Failed to generate summary:', err);
      set({ isSummarizing: false });
    }
  },

  setReplyText: (text) => set({ replyText: text }),
  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setIsSummarizing: (val) => set({ isSummarizing: val }),
  setIsGeneratingReplies: (val) => set({ isGeneratingReplies: val }),
}));

export function useFilteredEmails(): Email[] {
  const { emails, selectedCategory, searchQuery, priorityMode } = useEmailStore();

  return emails
    .filter((email) => {
      if (selectedCategory !== "All" && email.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${email.sender} ${email.subject} ${email.preview} ${email.body}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (priorityMode) {
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
      }
      return 0;
    });
}

// ✅ NEW: useImportantEmails selector for Important page
export function useImportantEmails(): Email[] {
  const { emails } = useEmailStore();
  return emails.filter(e => e.isImportant || e.isStarred || e.labels?.includes('IMPORTANT'));
}