import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Clock, Star, Search, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Email, useEmailStore } from "@/store/emailStore";
import { apiRequest } from '@/lib/api';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SUGGESTED_QUERIES = [
  "client meeting about budget",
  "invoices or billing from last month",
  "production issues or engineering alerts",
  "emails needing urgent reply",
  "newsletters I haven't read",
];

interface SemanticSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SemanticSearchModal({ open, onOpenChange }: SemanticSearchModalProps) {
  const { emails, setSelectedEmail } = useEmailStore();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Email[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // REAL API SEARCH FUNCTION
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setResults([]);
    setHasSearched(false);

    try {
      const data = await apiRequest('/api/ai/search', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery }),
      });
      // ✅ Safety: Ensure results is an array
      const searchResults = Array.isArray(data.results) ? data.results : [];
      setResults(searchResults);
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      setHasSearched(true);
      toast.error('Search failed', { description: 'Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setIsSearching(false);
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setIsSearching(false);
        setHasSearched(false);
      }, 200);
    }
  }, [open]);

  const handleSelect = useCallback(
    (email: Email) => {
      setSelectedEmail(email);
      onOpenChange(false);
      toast.success("Email opened", {
        description: email.subject,
      });
    },
    [setSelectedEmail, onOpenChange]
  );

  const handleSuggestedQuery = (q: string) => {
    setQuery(q);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-hidden p-0 gap-0 max-w-xl w-full shadow-2xl border-border",
          "backdrop-blur-sm"
        )}
        style={{ borderRadius: "14px" }}
      >
        <Command
          shouldFilter={false}
          className="[&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4"
        >
          <div className="flex items-center gap-2 border-b border-border px-3" cmdk-input-wrapper="">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-primary flex-shrink-0">
              <Brain className="w-3 h-3 text-primary-foreground" />
            </div>
            <CommandInput
              placeholder="Search emails by meaning… e.g. 'client meeting about budget'"
              value={query}
              onValueChange={setQuery}
              className="flex-1 border-0 focus:ring-0 pl-0"
            />
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border border-border bg-muted text-[10px] font-medium text-muted-foreground">esc</kbd>
            </div>
          </div>

          <CommandList className="max-h-[420px]">
            <AnimatePresence mode="wait">
              {isSearching && (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10 gap-3"
                >
                  <div className="relative w-8 h-8">
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    />
                    <Brain className="absolute inset-0 m-auto w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Searching semantically…</p>
                    <p className="text-xs text-muted-foreground mt-0.5">AI is scanning your inbox for meaning</p>
                  </div>
                </motion.div>
              )}

              {!isSearching && hasSearched && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/30">
                    <Brain className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground font-medium">
                      Found{" "}
                      <span className="text-primary font-semibold">{results.length} email{results.length !== 1 ? "s" : ""}</span>{" "}
                      related to{" "}
                      <span className="italic text-muted-foreground">"{query}"</span>
                    </span>
                  </div>

                  {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Search className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No emails found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different search phrase</p>
                    </div>
                  ) : (
                    <CommandGroup>
                      {/* ✅ Safety check: Ensure results is array and filter out null/undefined items */}
                      {Array.isArray(results) && results.length > 0 && results.filter(Boolean).map((email: any) => (
                        <CommandItem
                          key={email.id}
                          value={email.id}
                          onSelect={() => handleSelect(email)}
                          className="flex items-start gap-3 rounded-lg mx-1 my-0.5 cursor-pointer aria-selected:bg-accent"
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200">
                              {email.senderAvatar}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn("text-sm truncate", !email.isRead ? "font-semibold" : "font-medium")}>
                                {email.sender}
                              </span>
                              {email.isImportant && (
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                              )}
                              {!email.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <span className="ml-auto text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {email.time}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-foreground truncate">{email.subject}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{email.aiSummary?.[0] ?? email.preview}</p>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-1" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </motion.div>
              )}

              {!isSearching && !hasSearched && !query && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-3"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-2">
                    Suggested searches
                  </p>
                  <CommandGroup>
                    {SUGGESTED_QUERIES.map((q) => (
                      <CommandItem
                        key={q}
                        value={q}
                        onSelect={() => handleSuggestedQuery(q)}
                        className="flex items-center gap-2.5 rounded-lg mx-1 my-0.5 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{q}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto" />
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator className="my-2" />

                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-2 pt-1">
                    Recent emails
                  </p>
                  <CommandGroup>
                    {Array.isArray(emails) && emails.slice(0, 3).map((email) => (
                      <CommandItem
                        key={email.id}
                        value={`recent-${email.id}`}
                        onSelect={() => handleSelect(email)}
                        className="flex items-center gap-2.5 rounded-lg mx-1 my-0.5 cursor-pointer"
                      >
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200">
                            {email.senderAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground truncate block">{email.subject}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!email.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          <span className="text-xs text-muted-foreground">{email.time}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </CommandList>

          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border bg-muted/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <kbd className="inline-flex items-center justify-center h-4 px-1 rounded border border-border bg-muted text-[10px] font-medium">↵</kbd>
              <span>open email</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <kbd className="inline-flex items-center justify-center h-4 px-1 rounded border border-border bg-muted text-[10px] font-medium">↑↓</kbd>
              <span>navigate</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                <Brain className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-medium text-primary">AI Semantic Search</span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}