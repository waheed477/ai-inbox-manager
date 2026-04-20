import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import InboxPage from "@/pages/InboxPage";
import ImportantPage from "@/pages/ImportantPage";
import SentPage from "@/pages/SentPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={InboxPage} />
        <Route path="/important" component={ImportantPage} />
        <Route path="/sent" component={SentPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
      <Toaster position="bottom-right" richColors />
    </WouterRouter>
  );
}

export default App;
