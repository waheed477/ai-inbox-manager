import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useEmailStore } from "@/store/emailStore";
import EmailDetailPane from "@/components/EmailDetailPane";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function SentPage() {
  const { sentEmails, selectedEmail, setSelectedEmail } = useEmailStore();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sent list */}
      <div
        className={cn(
          "flex flex-col border-r border-border",
          "w-full lg:w-80 xl:w-96 flex-shrink-0",
          selectedEmail ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5" /> Sent
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sentEmails.map((email) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedEmail(email)}
              className={cn(
                "flex items-start gap-3 px-4 py-3.5 border-b border-border cursor-pointer transition-colors",
                selectedEmail?.id === email.id ? "bg-accent" : "hover:bg-muted/50"
              )}
            >
              <Avatar className="w-9 h-9 flex-shrink-0 mt-0.5">
                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200">
                  {email.senderAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground truncate">{email.subject}</span>
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">{email.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail pane */}
      <div className={cn("flex-1 overflow-hidden", selectedEmail ? "flex flex-col" : "hidden lg:flex lg:flex-col")}>
        <EmailDetailPane />
      </div>
    </div>
  );
}
