import { motion } from "framer-motion";
import { Star, Brain } from "lucide-react";
import { Email } from "@/store/emailStore";
import { useEmailStore } from "@/store/emailStore";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
}

export default function EmailRow({ email, isSelected }: EmailRowProps) {
  const { setSelectedEmail, toggleImportant, generateSummary, toggleStar } = useEmailStore();

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmail(email);
    await generateSummary(email.id);
    toast.success("AI Summary Generated", {
      description: "Summary ready in the detail pane.",
    });
  };

  const handleToggleImportant = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleImportant(email.id);
  };

  // ✅ New handler for star button using toggleStar
  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStar(email.id);
    toast.success(email.isImportant ? "Removed from important" : "Marked as important", {
      description: email.isImportant ? "Star removed from this email." : "Email added to important list.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      onClick={() => setSelectedEmail(email)}
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3.5 border-b border-border cursor-pointer transition-colors",
        isSelected ? "bg-accent" : "hover:bg-muted/50",
        !email.isRead && "bg-blue-50/40 dark:bg-blue-950/20"
      )}
    >
      {/* Unread indicator */}
      {!email.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* Avatar */}
      <Avatar className="w-9 h-9 flex-shrink-0 mt-0.5">
        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200">
          {email.senderAvatar}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-sm truncate", !email.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
            {email.sender}
          </span>
          <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">{email.time}</span>
        </div>
        <p className={cn("text-sm truncate mb-1", !email.isRead ? "font-medium text-foreground" : "text-foreground")}>
          {email.subject}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-relaxed">
          {email.preview}
        </p>
      </div>

      {/* Action buttons (visible on hover) */}
      <div className="absolute right-3 bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="sm"
          className="h-6 px-2 text-xs gap-1 bg-background border shadow-sm hover:bg-primary hover:text-primary-foreground"
          onClick={handleSummarize}
        >
          <Brain className="w-3 h-3" />
          Summarize
        </Button>
        {/* ✅ Updated star button with toggleStar */}
        <button
          onClick={handleStarClick}
          className={cn(
            "p-1 rounded transition-colors hover:bg-muted",
            email.isImportant ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
          )}
        >
          <Star className={cn("w-3.5 h-3.5", email.isImportant && "fill-amber-500")} />
        </button>
      </div>
    </motion.div>
  );
}