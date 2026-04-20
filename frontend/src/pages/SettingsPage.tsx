import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Bell, Archive, Brain, MessageSquare, Zap, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TONE_OPTIONS = ["Formal", "Friendly", "Concise"] as const;

type Condition = "From" | "Subject" | "Body";
type Operator = "Contains" | "Does not contain" | "Starts with";
type Action = "Label as Important" | "Label as Work" | "Archive" | "Mark as Read";

interface AutomationRule {
  id: string;
  condition: Condition;
  operator: Operator;
  value: string;
  action: Action;
}

const ACTION_COLORS: Record<Action, string> = {
  "Label as Important": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Label as Work": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Archive": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  "Mark as Read": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const INITIAL_RULES: AutomationRule[] = [
  { id: "r1", condition: "From", operator: "Contains", value: "boss@company.com", action: "Label as Important" },
  { id: "r2", condition: "Subject", operator: "Contains", value: "Invoice", action: "Label as Work" },
  { id: "r3", condition: "Body", operator: "Contains", value: "unsubscribe", action: "Archive" },
];

const EMPTY_FORM = {
  condition: "" as Condition | "",
  operator: "" as Operator | "",
  value: "",
  action: "" as Action | "",
};

export default function SettingsPage() {
  const {
    defaultTone,
    autoArchivePromotions,
    autoArchiveNewsletters,
    smartLabeling,
    dailyDigest,
    summaryOnOpen,
    setDefaultTone,
    setAutoArchivePromotions,
    setAutoArchiveNewsletters,
    setSmartLabeling,
    setDailyDigest,
    setSummaryOnOpen,
  } = useSettingsStore();

  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const handleSave = () => {
    toast.success("Settings saved", { description: "Your preferences have been updated." });
  };

  const openAddSheet = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setSheetOpen(true);
  };

  const openEditSheet = (rule: AutomationRule) => {
    setEditingRule(rule);
    setForm({
      condition: rule.condition,
      operator: rule.operator,
      value: rule.value,
      action: rule.action,
    });
    setFormError("");
    setSheetOpen(true);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rule deleted", { description: "Automation rule removed." });
  };

  const handleSubmitRule = () => {
    if (!form.condition || !form.operator || !form.value.trim() || !form.action) {
      setFormError("Please fill in all fields.");
      return;
    }

    const newRule: AutomationRule = {
      id: editingRule?.id ?? `r${Date.now()}`,
      condition: form.condition as Condition,
      operator: form.operator as Operator,
      value: form.value.trim(),
      action: form.action as Action,
    };

    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === editingRule.id ? newRule : r)));
      console.log("Rule updated:", newRule);
      toast.success("Rule updated (Mock)", { description: `${newRule.condition} ${newRule.operator} "${newRule.value}" → ${newRule.action}` });
    } else {
      setRules((prev) => [...prev, newRule]);
      console.log("New rule created:", newRule);
      toast.success("Rule created (Mock)", { description: `${newRule.condition} ${newRule.operator} "${newRule.value}" → ${newRule.action}` });
    }

    setSheetOpen(false);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground flex items-center gap-2"
          >
            <Settings className="w-6 h-6" />
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Customize your InboxFlow AI experience
          </motion.p>
        </div>

        {/* Default Reply Tone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Default Reply Tone</CardTitle>
              </div>
              <CardDescription className="text-xs">
                AI will use this tone when generating smart replies
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-3">
                {TONE_OPTIONS.map((tone) => (
                  <motion.button
                    key={tone}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDefaultTone(tone)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                      defaultTone === tone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                    )}
                  >
                    {tone}
                    <p className="text-xs font-normal mt-0.5 opacity-70">
                      {tone === "Formal" && "Professional"}
                      {tone === "Friendly" && "Conversational"}
                      {tone === "Concise" && "Brief & direct"}
                    </p>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Auto-Archive Rules */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Auto-Archive Rules</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Automatically archive emails matching these criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Promotional emails</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Auto-archive emails tagged as promotions</p>
                </div>
                <Switch checked={autoArchivePromotions} onCheckedChange={setAutoArchivePromotions} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Newsletters</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Auto-archive subscriptions and newsletters</p>
                </div>
                <Switch checked={autoArchiveNewsletters} onCheckedChange={setAutoArchiveNewsletters} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Behavior */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">AI Behavior</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Control how InboxFlow AI processes your inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Smart labeling</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">AI automatically labels and categorizes emails</p>
                </div>
                <Switch checked={smartLabeling} onCheckedChange={setSmartLabeling} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-summarize on open</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Generate AI summary when you open an email</p>
                </div>
                <Switch checked={summaryOnOpen} onCheckedChange={setSummaryOnOpen} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Daily digest</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Receive a daily summary of your inbox activity</p>
                </div>
                <Switch checked={dailyDigest} onCheckedChange={setDailyDigest} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Automation Rules ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Automation Rules</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs gap-1.5 flex-shrink-0"
                  onClick={openAddSheet}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Rule
                </Button>
              </div>
              <CardDescription className="text-xs">
                Automatically process emails that match custom conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No rules yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click "+ Add Rule" to create your first automation</p>
                </div>
              ) : (
                <div className="space-y-0 -mx-1">
                  <AnimatePresence initial={false}>
                    {rules.map((rule, i) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {i > 0 && <Separator className="mx-1" />}
                        <div className="group flex items-center gap-3 px-1 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                          {/* Rule description */}
                          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground font-medium">If</span>
                            <span className="font-semibold text-foreground">{rule.condition}</span>
                            <span className="text-muted-foreground">{rule.operator.toLowerCase()}</span>
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                              "{rule.value}"
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground font-medium">then</span>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", ACTION_COLORS[rule.action])}>
                              {rule.action}
                            </span>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditSheet(rule)}
                              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit rule"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Save button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Settings
          </Button>
        </motion.div>
      </div>

      {/* ─── Add / Edit Rule Sheet ─── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-base">
              {editingRule ? "Edit Rule" : "New Automation Rule"}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Define a condition and an action. InboxFlow AI will apply it automatically.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
            {/* Condition block */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Condition</p>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Field</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm((f) => ({ ...f, condition: v as Condition }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select field…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="From">From</SelectItem>
                    <SelectItem value="Subject">Subject</SelectItem>
                    <SelectItem value="Body">Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Operator</Label>
                <Select
                  value={form.operator}
                  onValueChange={(v) => setForm((f) => ({ ...f, operator: v as Operator }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select operator…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contains">Contains</SelectItem>
                    <SelectItem value="Does not contain">Does not contain</SelectItem>
                    <SelectItem value="Starts with">Starts with</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Value</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g. boss@company.com"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Action block */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</p>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Then…</Label>
                <Select
                  value={form.action}
                  onValueChange={(v) => setForm((f) => ({ ...f, action: v as Action }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select action…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Label as Important">Label as Important</SelectItem>
                    <SelectItem value="Label as Work">Label as Work</SelectItem>
                    <SelectItem value="Archive">Archive</SelectItem>
                    <SelectItem value="Mark as Read">Mark as Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            {form.condition && form.operator && form.value && form.action && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-muted/60 border border-border px-4 py-3"
              >
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Preview</p>
                <p className="text-xs text-foreground flex flex-wrap items-center gap-1">
                  <span className="text-muted-foreground">If</span>
                  <span className="font-semibold">{form.condition}</span>
                  <span className="text-muted-foreground">{form.operator.toLowerCase()}</span>
                  <span className="font-mono bg-background border border-border px-1.5 py-0.5 rounded">
                    "{form.value}"
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">then</span>
                  <span className={cn("px-2 py-0.5 rounded-full font-medium", ACTION_COLORS[form.action as Action])}>
                    {form.action}
                  </span>
                </p>
              </motion.div>
            )}

            {/* Error */}
            {formError && (
              <p className="text-xs text-destructive font-medium">{formError}</p>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 sm:justify-end">
            <SheetClose asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </SheetClose>
            <Button size="sm" className="flex-1 sm:flex-none gap-1.5" onClick={handleSubmitRule}>
              <Zap className="w-3.5 h-3.5" />
              {editingRule ? "Update Rule" : "Create Rule"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
