import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, Star, X } from "lucide-react";
import { useEmailStore, useFilteredEmails } from "@/store/emailStore";
import { EmailCategory } from "@/data/mockEmails";
import EmailRow from "@/components/EmailRow";
import EmailDetailPane from "@/components/EmailDetailPane";
import SemanticSearchModal from "@/components/SemanticSearchModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const CATEGORIES: EmailCategory[] = ["All", "Important", "Work", "Promotions"];

export default function InboxPage() {
  const { selectedEmail, selectedCategory, searchQuery, priorityMode, setPriorityMode, setSelectedCategory, setSearchQuery } = useEmailStore();
  const emails = useFilteredEmails();
  const [isLoading] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Email list panel */}
      <div
        className={cn(
          "flex flex-col border-r border-border",
          "w-full lg:w-80 xl:w-96 flex-shrink-0",
          selectedEmail ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-0 space-y-3 border-b border-border">
          {/* Title row with Priority toggle */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground flex-1">Inbox</h2>

            {/* Priority Mode chip — animates in when active */}
            <AnimatePresence>
              {priorityMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300"
                >
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap">Priority Mode On</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <label
                htmlFor="priority-toggle"
                className="text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
              >
                Important First
              </label>
              <Switch
                id="priority-toggle"
                checked={priorityMode}
                onCheckedChange={setPriorityMode}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>

          {/* Search bar — opens modal on click */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center gap-2 pl-3 pr-3 py-2 text-sm bg-muted/60 rounded-lg border border-transparent hover:border-primary/30 hover:bg-muted/80 transition-colors text-left group"
          >
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            <span className="flex-1 text-muted-foreground/70 text-sm">Search emails…</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded border border-border bg-background text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </button>

          {/* AI Search chip — also opens modal */}
          <div className="flex items-center gap-1.5 pb-1">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs hover:bg-primary/15 transition-colors"
            >
              <Brain className="w-3 h-3" />
              <span className="font-medium">Try: "client meeting about budget"</span>
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-0 -mx-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex-1 pb-2.5 pt-1 text-xs font-medium transition-all border-b-2 relative",
                  selectedCategory === cat
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
                {selectedCategory === cat && (
                  <motion.div
                    layoutId="categoryUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3.5 border-b border-border">
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <p className="text-sm font-medium text-foreground">No emails found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "This folder is empty"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {emails.map((email) => (
                <EmailRow
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Detail pane */}
      <div
        className={cn(
          "flex-1 overflow-hidden",
          selectedEmail ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        )}
      >
        <EmailDetailPane />
      </div>

      {/* Semantic Search Modal */}
      <SemanticSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
      />
    </div>
  );
}
