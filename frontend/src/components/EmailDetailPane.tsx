import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Star, Archive, Trash2, Brain, Reply,
  ChevronDown, Clock, CalendarDays, SendHorizonal,
} from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { useEmailStore } from "@/store/emailStore";
import { useScheduleStore } from '@/store/scheduleStore';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { apiRequest } from '@/lib/api';

// API helper function with session header
const apiRequestWithSession = async (url: string, options: RequestInit = {}) => {
  const sessionId = localStorage.getItem('sessionId');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId || '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

const safeArray = (data: any): string[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return [data];
  return [];
};

const TONE_OPTIONS = ["Formal", "Friendly", "Concise"] as const;

const SMART_REPLIES: Record<string, string> = {
  Approve: "Thank you for sending this over. I've reviewed everything and I'm happy to approve. Please proceed.",
  Decline: "Thank you for reaching out. After careful consideration, I'm unable to move forward with this at this time. I appreciate your understanding.",
  "Let's schedule": "Thanks for your message! I'd love to find a time to discuss this further. Are you available for a 30-minute call this week?",
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = [0, 15, 30, 45];

function formatScheduled(date: Date, hour: number, minute: number): string {
  const dt = setMinutes(setHours(date, hour), minute);
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const isToday = format(dt, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  const isTomorrow = format(dt, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd");
  const timeStr = format(dt, "h:mm a");
  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  return `${format(dt, "MMM d")}, ${timeStr}`;
}

export default function EmailDetailPane() {
  const {
    selectedEmail,
    replyText,
    selectedTone,
    setSelectedEmail,
    toggleImportant,
    setReplyText,
    setSelectedTone,
  } = useEmailStore();

  // Schedule store
  const { scheduleEmail } = useScheduleStore();

  // Local state for API calls
  const [summarizing, setSummarizing] = useState(false);
  const [generatingReplies, setGeneratingReplies] = useState(false);

  // Schedule state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>(addDays(new Date(), 1));
  const [scheduleHour, setScheduleHour] = useState(9);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);

  // New schedule form state for simple date/time inputs
  const [scheduleDateInput, setScheduleDateInput] = useState('');
  const [scheduleTimeInput, setScheduleTimeInput] = useState('09:00');

  // REPLACED: Real API call for summarize
  const handleSummarize = async () => {
    if (!selectedEmail) return;
    setSummarizing(true);
    try {
      const data = await apiRequestWithSession('/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ emailBody: selectedEmail.body }),
      });
      selectedEmail.aiSummary = data.summary;
      setSummarizing(false);
      toast.success('AI summary generated');
    } catch (err) {
      setSummarizing(false);
      toast.error('Failed to summarize');
    }
  };

  // NEW: Real API call for reply suggestions
  const handleSuggestReplies = async () => {
    if (!selectedEmail) return;
    setGeneratingReplies(true);
    try {
      const data = await apiRequestWithSession('/api/ai/reply-suggestions', {
        method: 'POST',
        body: JSON.stringify({ emailBody: selectedEmail.body }),
      });
      selectedEmail.aiReplySuggestions = data.replies;
      setGeneratingReplies(false);
      toast.success('Reply suggestions ready');
    } catch (err) {
      setGeneratingReplies(false);
      toast.error('Failed to generate replies');
    }
  };

  const handleSmartReply = (type: keyof typeof SMART_REPLIES) => {
    const tone = selectedTone;
    let text = SMART_REPLIES[type];
    if (tone === "Concise") {
      text = text.split(".")[0] + ".";
    } else if (tone === "Friendly") {
      text = text.replace("Thank you", "Hey, thanks").replace("I've reviewed", "I've had a look");
    }
    setReplyText(text);
    toast.info("Smart reply loaded", { description: `Tone: ${tone}` });
  };

  const handleSendNow = () => {
    toast.success("Reply sent (mock)", { description: "Your reply has been queued." });
    setReplyText("");
    setScheduledFor(null);
  };

  // Handle schedule with real store
  const handleSchedule = async () => {
    if (!scheduleDateInput || !selectedEmail) return;
    
    const scheduledAt = new Date(`${scheduleDateInput}T${scheduleTimeInput}`).toISOString();
    
    try {
      await scheduleEmail({
        to: selectedEmail.senderEmail || '',
        subject: `Re: ${selectedEmail.subject || ''}`,
        body: replyText || '',
        scheduledAt,
      });
      toast.success(`Email scheduled for ${scheduleDateInput} at ${scheduleTimeInput}`);
      setReplyText("");
      setScheduleDateInput('');
      setScheduleTimeInput('09:00');
      setScheduledFor(null);
    } catch (err) {
      console.error('Failed to schedule email:', err);
      toast.error('Failed to schedule email');
    }
  };

  const handleScheduleConfirm = () => {
    const label = formatScheduled(scheduleDate, scheduleHour, scheduleMinute);
    setScheduledFor(label);
    setScheduleOpen(false);
    toast.success(`Reply scheduled for ${label} (Mock)`, {
      description: "You can cancel or edit before it sends.",
      icon: <Clock className="w-4 h-4" />,
    });
  };

  const handleCancelSchedule = () => {
    setScheduledFor(null);
    toast.info("Schedule cancelled");
  };

  const handleEmailChange = () => {
    setScheduledFor(null);
    setScheduleDate(addDays(new Date(), 1));
    setScheduleHour(9);
    setScheduleMinute(0);
    setScheduleDateInput('');
    setScheduleTimeInput('09:00');
  };

  return (
    <AnimatePresence>
      {selectedEmail ? (
        <motion.div
          key={selectedEmail.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onAnimationStart={handleEmailChange}
          className="flex flex-col h-full bg-background overflow-y-auto"
        >
          {/* ✅ UPDATED Toolbar with functional Archive and Delete */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border flex-shrink-0">
            <button
              className="lg:hidden p-1 rounded hover:bg-muted"
              onClick={() => setSelectedEmail(null)}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Star - already functional */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleImportant(selectedEmail.id)}
              >
                <Star className={cn("w-4 h-4", selectedEmail.isImportant && "fill-amber-500 text-amber-500")} />
              </Button>

              {/* Archive - functional */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={async () => {
                  try {
                    await apiRequest('/api/gmail/archive', {
                      method: 'POST',
                      body: JSON.stringify({ emailId: selectedEmail.id }),
                    });
                    toast.success('Email archived');
                    setSelectedEmail(null);
                  } catch {
                    toast.error('Failed to archive');
                  }
                }}
              >
                <Archive className="w-4 h-4" />
              </Button>

              {/* Delete - functional */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={async () => {
                  try {
                    await apiRequest('/api/gmail/delete', {
                      method: 'POST',
                      body: JSON.stringify({ emailId: selectedEmail.id }),
                    });
                    // Remove from local store
                    useEmailStore.setState((state) => ({
                      emails: state.emails.filter((e) => e.id !== selectedEmail.id),
                    }));
                    setSelectedEmail(null);
                    toast.success('Email deleted');
                  } catch {
                    toast.error('Failed to delete');
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Email content */}
          <div className="flex-1 px-6 py-5 space-y-5 overflow-visible">
            {/* Subject + sender */}
            <div>
              <h1 className="text-xl font-semibold text-foreground mb-3 leading-tight">
                {selectedEmail.subject}
              </h1>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200">
                    {selectedEmail.senderAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{selectedEmail.sender}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{selectedEmail.time}, {selectedEmail.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedEmail.senderEmail}</p>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 overflow-visible">
              <div className="flex items-center justify-between gap-2 mb-3 overflow-visible">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-200 dark:bg-amber-800 flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                  </div>
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">AI Summary</span>
                </div>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 hover:text-white active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex-shrink-0"
                >
                  <Brain className="w-3.5 h-3.5" />
                  {summarizing ? 'Summarizing...' : 'Summarize'}
                </button>
              </div>
              {summarizing ? (
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full bg-amber-200/60 dark:bg-amber-800/40" />
                  <Skeleton className="h-3.5 w-5/6 bg-amber-200/60 dark:bg-amber-800/40" />
                  <Skeleton className="h-3.5 w-4/5 bg-amber-200/60 dark:bg-amber-800/40" />
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {safeArray(selectedEmail.aiSummary).map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* AI Reply Suggestions Card */}
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 p-4 overflow-visible">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-200 dark:bg-purple-800">
                    <Reply className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                  </div>
                  <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">AI Reply Suggestions</span>
                </div>
                {!generatingReplies && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-800 dark:hover:text-purple-200 flex-shrink-0"
                    onClick={handleSuggestReplies}
                  >
                    Generate
                  </Button>
                )}
              </div>
              {generatingReplies ? (
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full bg-purple-200/60 dark:bg-purple-800/40" />
                  <Skeleton className="h-3.5 w-5/6 bg-purple-200/60 dark:bg-purple-800/40" />
                  <Skeleton className="h-3.5 w-4/5 bg-purple-200/60 dark:bg-purple-800/40" />
                </div>
              ) : (selectedEmail.aiReplySuggestions?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedEmail.aiReplySuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setReplyText(suggestion)}
                      className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800/60 text-sm text-purple-900 dark:text-purple-200 bg-purple-100/50 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-purple-700 dark:text-purple-300 opacity-70">
                  Click "Generate" to get AI-powered reply suggestions based on this email.
                </p>
              )}
            </div>

            {/* Email body */}
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {selectedEmail.body}
            </div>

            <Separator />

            {/* Smart Reply section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Smart Reply</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Tone:</span>
                <div className="flex gap-1.5">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-all",
                        selectedTone === tone
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["Approve", "Decline", "Let's schedule"] as const).map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSmartReply(type)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground bg-background hover:bg-accent hover:border-primary/30 transition-all shadow-sm"
                  >
                    {type}
                  </motion.button>
                ))}
              </div>

              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply or use a smart reply above..."
                className="min-h-[100px] text-sm resize-none"
              />

              {/* Simple Schedule Form */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <input
                  type="date"
                  value={scheduleDateInput}
                  onChange={(e) => setScheduleDateInput(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-border rounded px-2 py-1.5 text-sm flex-1"
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="time"
                  value={scheduleTimeInput}
                  onChange={(e) => setScheduleTimeInput(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-border rounded px-2 py-1.5 text-sm"
                />
                <Button
                  onClick={handleSchedule}
                  disabled={!scheduleDateInput || !replyText.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Schedule
                </Button>
              </div>

              <AnimatePresence>
                {scheduledFor && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 text-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-primary font-medium">Scheduled for {scheduledFor}</span>
                    <button
                      onClick={handleCancelSchedule}
                      className="ml-auto p-0.5 rounded hover:bg-primary/15 text-primary/70 hover:text-primary transition-colors"
                      title="Cancel schedule"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setReplyText(""); setScheduledFor(null); }}
                >
                  Clear
                </Button>

                <div className="flex items-center">
                  <Button
                    size="sm"
                    className="rounded-r-none border-r border-primary-border/40 pr-3"
                    onClick={handleSendNow}
                    disabled={!replyText.trim()}
                  >
                    <SendHorizonal className="w-3.5 h-3.5 mr-1.5" />
                    {scheduledFor ? "Send Now" : "Send Reply"}
                  </Button>

                  <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        className="rounded-l-none px-2 border-l-0"
                        disabled={!replyText.trim()}
                        title="Schedule send"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      align="end"
                      className="w-auto p-0 overflow-hidden"
                      sideOffset={6}
                    >
                      <div className="px-4 pt-4 pb-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <p className="text-sm font-semibold text-foreground">Schedule Send</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Pick a date and time to send your reply
                        </p>
                      </div>

                      <div className="p-2">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={(d) => d && setScheduleDate(d)}
                          disabled={{ before: new Date() }}
                          initialFocus
                        />
                      </div>

                      <div className="px-4 pb-4 pt-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs font-medium text-foreground">Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={scheduleHour}
                            onChange={(e) => setScheduleHour(Number(e.target.value))}
                            className="flex-1 h-8 px-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {HOUR_OPTIONS.map((h) => (
                              <option key={h} value={h}>
                                {String(h).padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`})
                              </option>
                            ))}
                          </select>
                          <span className="text-muted-foreground text-sm">:</span>
                          <select
                            value={scheduleMinute}
                            onChange={(e) => setScheduleMinute(Number(e.target.value))}
                            className="w-20 h-8 px-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {MINUTE_OPTIONS.map((m) => (
                              <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/60 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>
                            Will send: <span className="font-medium text-foreground">
                              {formatScheduled(scheduleDate, scheduleHour, scheduleMinute)}
                            </span>
                          </span>
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                          {[
                            { label: "Tomorrow 9 AM", d: addDays(new Date(), 1), h: 9, m: 0 },
                            { label: "Tomorrow 2 PM", d: addDays(new Date(), 1), h: 14, m: 0 },
                            { label: "In 2 days 9 AM", d: addDays(new Date(), 2), h: 9, m: 0 },
                          ].map((q) => (
                            <button
                              key={q.label}
                              onClick={() => { setScheduleDate(q.d); setScheduleHour(q.h); setScheduleMinute(q.m); }}
                              className="px-2 py-1 text-xs rounded border border-border bg-background hover:bg-accent hover:border-primary/30 transition-all text-foreground"
                            >
                              {q.label}
                            </button>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={handleScheduleConfirm}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Schedule Send
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="hidden lg:flex flex-col items-center justify-center h-full text-center px-8 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <Brain className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">Select an email to view</p>
          <p className="text-xs mt-1 text-muted-foreground/70">AI summaries and smart replies will appear here</p>
        </div>
      )}
    </AnimatePresence>
  );
}