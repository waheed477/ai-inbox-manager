import { useEffect } from "react";
import { useEmailStore } from "@/store/emailStore";
import InboxPage from "@/pages/InboxPage";

export default function ImportantPage() {
  const { setSelectedCategory } = useEmailStore();
  useEffect(() => {
    setSelectedCategory("Important");
  }, [setSelectedCategory]);
  return <InboxPage />;
}
