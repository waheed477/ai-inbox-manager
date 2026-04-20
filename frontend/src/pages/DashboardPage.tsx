import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  Clock,
  Zap,
  Brain,
  Tag,
  Star,
  Archive,
  Reply,
  TrendingUp,
} from "lucide-react";
import { dashboardStats, emailVolumeData, activityFeed } from "@/data/mockDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: string;
  delay?: number;
}

function StatCard({ title, value, icon, description, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border">
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const activityIcons: Record<string, React.ReactNode> = {
  label: <Tag className="w-3.5 h-3.5 text-blue-500" />,
  star: <Star className="w-3.5 h-3.5 text-amber-500" />,
  archive: <Archive className="w-3.5 h-3.5 text-slate-500" />,
  reply: <Reply className="w-3.5 h-3.5 text-green-500" />,
  summarize: <Brain className="w-3.5 h-3.5 text-indigo-500" />,
};

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Your AI-powered inbox at a glance
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Emails Processed"
            value={dashboardStats.emailsProcessed.toLocaleString()}
            icon={<Mail className="w-5 h-5 text-primary" />}
            description="This month"
            trend="+12% from last month"
            delay={0}
          />
          <StatCard
            title="Avg Response Time"
            value={dashboardStats.avgResponseTime}
            icon={<Clock className="w-5 h-5 text-primary" />}
            description="Down from 18 min average"
            trend="76% faster than baseline"
            delay={0.08}
          />
          <StatCard
            title="AI Tokens Saved"
            value={dashboardStats.aiTokensSaved.toLocaleString()}
            icon={<Zap className="w-5 h-5 text-primary" />}
            description="Via smart compression"
            trend="~$14.20 in API costs"
            delay={0.16}
          />
          <StatCard
            title="AI Summaries"
            value={dashboardStats.aiSummariesGenerated}
            icon={<Brain className="w-5 h-5 text-primary" />}
            description="Generated this month"
            trend="+34 from last week"
            delay={0.24}
          />
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Email Volume — This Week</CardTitle>
                <CardDescription className="text-xs">Daily breakdown of received, sent, and AI-processed emails</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={emailVolumeData} barGap={3} barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
                    />
                    <Bar dataKey="received" name="Received" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} opacity={0.9} />
                    <Bar dataKey="sent" name="Sent" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} opacity={0.5} />
                    <Bar dataKey="aiProcessed" name="AI Processed" fill="#a855f7" radius={[3, 3, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <Card className="border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">AI Activity Feed</CardTitle>
                <CardDescription className="text-xs">Recent automated actions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-60 px-5">
                  <div className="space-y-0 pb-4">
                    {activityFeed.map((item, i) => (
                      <div key={item.id}>
                        <div className="flex items-start gap-3 py-3">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            {activityIcons[item.icon]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground leading-relaxed">{item.message}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                          </div>
                        </div>
                        {i < activityFeed.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
