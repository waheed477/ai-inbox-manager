export interface DashboardStats {
  emailsProcessed: number;
  avgResponseTime: string;
  aiTokensSaved: number;
  aiSummariesGenerated: number;
}

export interface EmailVolumeData {
  day: string;
  received: number;
  sent: number;
  aiProcessed: number;
}

export interface ActivityItem {
  id: string;
  icon: "label" | "star" | "archive" | "reply" | "summarize";
  message: string;
  time: string;
}

export const dashboardStats: DashboardStats = {
  emailsProcessed: 1284,
  avgResponseTime: "4.2 min",
  aiTokensSaved: 48320,
  aiSummariesGenerated: 312,
};

export const emailVolumeData: EmailVolumeData[] = [
  { day: "Mon", received: 42, sent: 18, aiProcessed: 35 },
  { day: "Tue", received: 67, sent: 24, aiProcessed: 58 },
  { day: "Wed", received: 55, sent: 31, aiProcessed: 49 },
  { day: "Thu", received: 89, sent: 42, aiProcessed: 76 },
  { day: "Fri", received: 73, sent: 38, aiProcessed: 65 },
  { day: "Sat", received: 21, sent: 8, aiProcessed: 18 },
  { day: "Sun", received: 14, sent: 5, aiProcessed: 12 },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "a1",
    icon: "label",
    message: "AI labeled 3 emails as Important",
    time: "2 min ago",
  },
  {
    id: "a2",
    icon: "summarize",
    message: "AI generated summary for Q3 Budget email",
    time: "12 min ago",
  },
  {
    id: "a3",
    icon: "star",
    message: "AI flagged email from lisa@clientco.com as high priority",
    time: "1 hour ago",
  },
  {
    id: "a4",
    icon: "archive",
    message: "AI auto-archived 12 promotional emails",
    time: "2 hours ago",
  },
  {
    id: "a5",
    icon: "reply",
    message: "Smart reply sent to Marcus Chen re: API issue",
    time: "3 hours ago",
  },
  {
    id: "a6",
    icon: "summarize",
    message: "AI generated 7 email summaries in batch",
    time: "Yesterday",
  },
  {
    id: "a7",
    icon: "label",
    message: "AI categorized 18 emails into Work and Promotions",
    time: "Yesterday",
  },
];
