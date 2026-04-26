export type EmailCategory = "All" | "Important" | "Work" | "Promotions";

// Backend-aligned Email shape (normalized by emailStore)
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
  category: Exclude<EmailCategory, "All">;
  labels?: string[];
}

export const sentEmails: Email[] = [];

