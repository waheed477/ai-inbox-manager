import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Star,
  Send,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Menu,
  X,
  LayoutDashboard,
  Twitter,
  Github,
  Linkedin,
  Archive, // ✅ Added Archive icon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmailStore } from "@/store/emailStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Inbox", icon: Inbox, badge: 4 },
  { href: "/important", label: "Important", icon: Star },
  { href: "/sent", label: "Sent", icon: Send },
  { href: "/archived", label: "Archived", icon: Archive }, // ✅ Added Archived link
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const SOCIAL_LINKS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

function BrandLogo({ size = "default" }: { size?: "default" | "sm" }) {
  const isSmall = size === "sm";
  return (
    <div className={cn("flex items-center gap-2.5", isSmall && "gap-2")}>
      {/* Logo mark: layered envelope with gradient */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl flex-shrink-0",
        "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600",
        "shadow-md shadow-indigo-500/30",
        isSmall ? "w-6 h-6 rounded-md" : "w-9 h-9"
      )}>
        <Mail className={cn("text-white", isSmall ? "w-3.5 h-3.5" : "w-4.5 h-4.5")} strokeWidth={2.2} />
        {/* pulse dot for "connected" feel */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white dark:border-sidebar shadow-sm" />
      </div>

      {/* Wordmark */}
      <div className="flex items-baseline gap-1 leading-none">
        <span className={cn(
          "font-bold tracking-tight text-sidebar-foreground",
          isSmall ? "text-sm" : "text-[15px]"
        )}>
          InboxFlow
        </span>
        <span className={cn(
          "font-semibold px-1 py-0 rounded text-[10px] leading-none",
          "bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent",
          "border border-indigo-200 dark:border-indigo-800/60",
          isSmall && "text-[9px]"
        )}>
          AI
        </span>
      </div>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { emails, clearEmails } = useEmailStore();
  const unreadCount = emails.filter((e) => !e.isRead).length;

  // Real user session state
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Fetch user session on mount
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setUser(data.user);
        }
        setSessionLoading(false);
      })
      .catch(() => setSessionLoading(false));
  }, []);

  // Updated: Simple logout redirect to signout endpoint
  const handleLogout = () => {
    window.location.href = '/api/auth/signout';
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed lg:relative z-50 lg:z-auto inset-y-0 left-0 w-64 flex flex-col bg-sidebar border-r border-sidebar-border",
          "transition-transform lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-sidebar-border">
          <BrandLogo />
          <button
            className="ml-auto lg:hidden text-sidebar-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gmail Connection Status - Real */}
        <div className="px-4 pt-4">
          {user ? (
            <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Gmail Connected
              </span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          ) : sessionLoading ? (
            <div className="w-full h-9 rounded-lg bg-muted animate-pulse" />
          ) : (
            <Link href="/login">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Connect Gmail
                </span>
              </button>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? location === "/" || location === ""
                : location.startsWith(item.href);
            const Icon = item.icon;
            const badge = item.href === "/" ? unreadCount : item.badge;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badge && badge > 0 ? (
                    <Badge className="ml-auto h-5 min-w-5 text-xs px-1.5" variant="default">
                      {badge}
                    </Badge>
                  ) : null}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User section with Sign Out button */}
        <div className="px-4 pb-3 pt-3 border-t border-sidebar-border">
          {user ? (
            <>
              {/* User profile info */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                {user.image ? (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email || ''}
                  </p>
                </div>
              </div>
              
              {/* Sign Out button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : sessionLoading ? (
            <div className="w-full h-12 rounded-lg bg-muted animate-pulse" />
          ) : (
            <div className="text-xs text-muted-foreground text-center py-2">
              Not signed in
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="px-5 py-3 border-t border-sidebar-border bg-sidebar/80">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              © 2026 InboxFlow AI
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background border-b border-border flex items-center px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <BrandLogo size="sm" />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Main Footer */}
        <footer className="hidden lg:flex items-center justify-between px-6 py-2.5 border-t border-border bg-background/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-[11px] text-muted-foreground/60">
              © 2026 InboxFlow AI, Inc. · All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Help", href: "#" },
              ].map(({ label, href }) => (
                <Link key={label} href={href}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                  >
                    {label}
                  </a>
                </Link>
              ))}
            </div>

            <div className="w-px h-3 bg-border" />

            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}