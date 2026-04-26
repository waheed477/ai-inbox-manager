import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import InboxPage from "@/pages/InboxPage";
import ImportantPage from "@/pages/ImportantPage";
import SentPage from "@/pages/SentPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import ArchivedPage from "@/pages/ArchivedPage";
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setAuthed(true);
        } else {
          setAuthed(false);
          setLocation('/login');
        }
      })
      .catch(() => {
        setAuthed(false);
        setLocation('/login');
      });
  }, []);

  if (authed === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/archived">
  <ProtectedRoute><Layout><ArchivedPage /></Layout></ProtectedRoute>
</Route>
        <Route path="/login" component={LoginPage} />
        <Route path="/important">
          <ProtectedRoute><Layout><ImportantPage /></Layout></ProtectedRoute>
        </Route>
        <Route path="/sent">
          <ProtectedRoute><Layout><SentPage /></Layout></ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>
        </Route>
        <Route path="/">
          <ProtectedRoute><Layout><InboxPage /></Layout></ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster position="bottom-right" richColors />
    </WouterRouter>
  );
}

export default App;