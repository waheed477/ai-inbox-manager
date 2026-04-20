export type EmailCategory = "All" | "Important" | "Work" | "Promotions";

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatar: string;
  subject: string;
  preview: string;
  body: string;
  aiSummary: string[];
  time: string;
  date: string;
  isRead: boolean;
  isImportant: boolean;
  category: Exclude<EmailCategory, "All">;
  labels?: string[];
}

export const mockEmails: Email[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    senderEmail: "sarah.johnson@acmecorp.com",
    senderAvatar: "SJ",
    subject: "Q3 Budget Approval Request",
    preview: "Hi, I wanted to follow up on the Q3 budget proposal we discussed...",
    body: `Hi,\n\nI wanted to follow up on the Q3 budget proposal we discussed in last week's meeting. We need your approval by Friday EOD to ensure the funds are allocated in time for the upcoming projects.\n\nThe key line items are:\n- Marketing campaigns: $45,000\n- Engineering tooling: $22,000\n- Team offsite: $15,000\n\nTotal requested: $82,000\n\nPlease let me know if you have any questions or need additional breakdown. I can schedule a call if that helps.\n\nBest regards,\nSarah Johnson\nHead of Finance, Acme Corp`,
    aiSummary: [
      "Request for Q3 budget approval — $82,000 total",
      "Action needed by Friday EOD",
      "Key items: Marketing ($45k), Engineering ($22k), Offsite ($15k)",
    ],
    time: "9:42 AM",
    date: "Today",
    isRead: false,
    isImportant: true,
    category: "Work",
    labels: ["Finance", "Urgent"],
  },
  {
    id: "2",
    sender: "Marcus Chen",
    senderEmail: "m.chen@devteam.io",
    senderAvatar: "MC",
    subject: "Re: API Integration Issues — Production",
    preview: "The endpoint is returning 503s intermittently. I've attached the logs...",
    body: `Hey team,\n\nWe're seeing intermittent 503 errors on the /api/v2/process endpoint in production. The issue started around 2:15 PM EST yesterday.\n\nAttached are the relevant logs. Initial investigation suggests it may be related to the database connection pool exhaustion under high load.\n\nProposed fix:\n1. Increase connection pool size from 10 to 25\n2. Add retry logic with exponential backoff\n3. Implement circuit breaker pattern\n\nI can push a hotfix tonight if you approve the approach.\n\n— Marcus`,
    aiSummary: [
      "Production API returning 503 errors since 2:15 PM EST yesterday",
      "Root cause: likely database connection pool exhaustion",
      "Proposed fix ready — awaiting approval to deploy hotfix",
    ],
    time: "8:15 AM",
    date: "Today",
    isRead: false,
    isImportant: true,
    category: "Work",
    labels: ["Engineering", "Production"],
  },
  {
    id: "3",
    sender: "TechCrunch",
    senderEmail: "newsletter@techcrunch.com",
    senderAvatar: "TC",
    subject: "This Week in AI: GPT-5, Gemini Ultra 2.0, and more",
    preview: "OpenAI's latest model benchmarks shatter previous records in reasoning tasks...",
    body: `This week in AI:\n\nOpenAI's GPT-5 has officially launched with a 40% improvement in reasoning benchmarks. Google's Gemini Ultra 2.0 follows closely with groundbreaking multimodal capabilities.\n\nHighlights:\n• GPT-5 achieves 95.2% on HumanEval coding benchmark\n• Gemini 2.0 Ultra natively processes video, audio, and images in real-time\n• Anthropic raises $4B Series D at $60B valuation\n• EU AI Act enforcement begins Q2 2025\n\nRead more at TechCrunch.com`,
    aiSummary: [
      "GPT-5 launched with 40% reasoning improvement",
      "Gemini Ultra 2.0 adds real-time multimodal processing",
      "Anthropic raises $4B at $60B valuation",
    ],
    time: "7:00 AM",
    date: "Today",
    isRead: true,
    isImportant: false,
    category: "Promotions",
    labels: ["Newsletter"],
  },
  {
    id: "4",
    sender: "Lisa Park",
    senderEmail: "lisa@clientco.com",
    senderAvatar: "LP",
    subject: "Client Meeting — Wednesday 3pm",
    preview: "Just confirming our Wednesday meeting to review the new proposal...",
    body: `Hi,\n\nJust confirming our Wednesday meeting at 3pm EST to review the new proposal. I've shared the Zoom link below.\n\nAgenda:\n1. Review Q4 project scope\n2. Discuss timeline adjustments\n3. Sign-off on revised pricing\n\nZoom: https://zoom.us/j/123456789\n\nLet me know if Wednesday doesn't work and we can reschedule.\n\nBest,\nLisa Park\nAccount Manager, ClientCo`,
    aiSummary: [
      "Meeting confirmed for Wednesday 3pm EST via Zoom",
      "Agenda: Q4 scope, timeline adjustments, and pricing sign-off",
      "Reply needed if reschedule is required",
    ],
    time: "Yesterday",
    date: "Yesterday",
    isRead: true,
    isImportant: true,
    category: "Work",
    labels: ["Meeting"],
  },
  {
    id: "5",
    sender: "Amazon Web Services",
    senderEmail: "billing@aws.amazon.com",
    senderAvatar: "AW",
    subject: "Your AWS Bill for March 2025 — $2,847.32",
    preview: "Your monthly AWS statement is ready. Total charges: $2,847.32...",
    body: `Dear Customer,\n\nYour AWS bill for March 2025 is now available.\n\nSummary:\n- EC2 Instances: $1,420.00\n- RDS Databases: $640.00\n- S3 Storage: $287.32\n- Data Transfer: $500.00\n\nTotal: $2,847.32\n\nPayment will be automatically charged to your card on file on April 1st.\n\nView detailed breakdown at console.aws.amazon.com/billing\n\nThank you for using AWS.`,
    aiSummary: [
      "AWS bill for March 2025: $2,847.32",
      "Auto-charged to card on file on April 1st",
      "Top cost: EC2 ($1,420) and RDS ($640)",
    ],
    time: "Mar 28",
    date: "Mar 28",
    isRead: true,
    isImportant: false,
    category: "Work",
    labels: ["Billing"],
  },
  {
    id: "6",
    sender: "Product Hunt",
    senderEmail: "hello@producthunt.com",
    senderAvatar: "PH",
    subject: "Today's top products: AI coding tools you need to try",
    preview: "Discover today's hottest launches: Cursor Pro, Devin 2.0, and GitHub Copilot X...",
    body: `Today's top products on Product Hunt:\n\n🥇 Cursor Pro — AI-first code editor with full codebase context\n🥈 Devin 2.0 — The autonomous software engineer, now 3x faster\n🥉 GitHub Copilot X — Agent mode for complete feature development\n\nPlus: 47 other launches in AI, productivity, and developer tools.\n\nVisit producthunt.com to upvote your favorites!`,
    aiSummary: [
      "Top launches: Cursor Pro, Devin 2.0, GitHub Copilot X",
      "47 new products in AI and developer tools category",
    ],
    time: "Mar 27",
    date: "Mar 27",
    isRead: false,
    isImportant: false,
    category: "Promotions",
    labels: ["Newsletter"],
  },
  {
    id: "7",
    sender: "David Kim",
    senderEmail: "d.kim@internal.co",
    senderAvatar: "DK",
    subject: "Design review feedback — v2.3 mockups",
    preview: "Thanks for sharing the mockups. A few notes before we proceed...",
    body: `Hi,\n\nThanks for sharing the v2.3 mockups. Overall the direction looks great! A few notes before we finalize:\n\n1. The onboarding flow needs a progress indicator — users are dropping off at step 3\n2. The dashboard color contrast on the metric cards fails WCAG AA — please fix before launch\n3. The mobile nav hamburger is 32px, should be at least 44px touch target\n\nOtherwise ship it. Can we schedule a final review call Friday?\n\n— David`,
    aiSummary: [
      "Design v2.3 approved with 3 required fixes before launch",
      "Issues: onboarding progress indicator, color contrast, mobile nav sizing",
      "Final review call requested for Friday",
    ],
    time: "Mar 26",
    date: "Mar 26",
    isRead: true,
    isImportant: false,
    category: "Work",
    labels: ["Design"],
  },
  {
    id: "8",
    sender: "GitHub",
    senderEmail: "noreply@github.com",
    senderAvatar: "GH",
    subject: "[inboxflow/frontend] PR #142 — Add AI summary feature",
    preview: "A pull request was opened by @marcus-chen: 'Add AI summary feature with streaming'...",
    body: `@you were requested to review a pull request\n\nPR #142: Add AI summary feature with streaming\nby @marcus-chen\n\nChanges:\n+ 14 files changed, 892 insertions, 41 deletions\n\nDescription:\nImplements the AI email summarization feature using streaming responses from the LLM API. Includes a loading skeleton and toast notifications.\n\nReview at: github.com/inboxflow/frontend/pull/142`,
    aiSummary: [
      "PR #142 awaiting your review: AI summary feature",
      "14 files changed, 892 insertions by @marcus-chen",
    ],
    time: "Mar 25",
    date: "Mar 25",
    isRead: false,
    isImportant: false,
    category: "Work",
    labels: ["Code Review"],
  },
];

export const sentEmails: Email[] = [
  {
    id: "s1",
    sender: "You",
    senderEmail: "you@inboxflow.ai",
    senderAvatar: "YO",
    subject: "Re: Q3 Budget Approval Request",
    preview: "Hi Sarah, I've reviewed the proposal and it looks good. Approving all items...",
    body: `Hi Sarah,\n\nI've reviewed the proposal and it looks good. Approving all line items:\n- Marketing campaigns: $45,000 ✓\n- Engineering tooling: $22,000 ✓\n- Team offsite: $15,000 ✓\n\nTotal approved: $82,000\n\nPlease proceed with the allocation.\n\nBest,`,
    aiSummary: ["Budget of $82,000 approved for all Q3 line items"],
    time: "10:05 AM",
    date: "Today",
    isRead: true,
    isImportant: false,
    category: "Work",
  },
  {
    id: "s2",
    sender: "You",
    senderEmail: "you@inboxflow.ai",
    senderAvatar: "YO",
    subject: "Meeting agenda for Wednesday",
    preview: "Lisa, I've prepared the agenda for our Wednesday meeting. See attached...",
    body: `Lisa,\n\nI've prepared the agenda for our Wednesday meeting. Happy to discuss all items.\n\nSee you Wednesday at 3pm!\n\nBest,`,
    aiSummary: ["Sent meeting agenda for Wednesday 3pm"],
    time: "Yesterday",
    date: "Yesterday",
    isRead: true,
    isImportant: false,
    category: "Work",
  },
];
