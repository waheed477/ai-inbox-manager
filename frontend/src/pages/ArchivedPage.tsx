import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import EmailRow from '@/components/EmailRow';
import EmailDetailPane from '@/components/EmailDetailPane';
import { useEmailStore } from '@/store/emailStore';
import { toast } from 'sonner';
import { ArchiveRestore } from 'lucide-react';

export default function ArchivedPage() {
  const [archivedEmails, setArchivedEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedEmail, setSelectedEmail, clearSelection, fetchEmails } = useEmailStore();

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/gmail/archived');
      setArchivedEmails(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load archived emails');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleUnarchive = async (emailId: string) => {
    try {
      await apiRequest('/api/gmail/unarchive', {
        method: 'POST',
        body: JSON.stringify({ emailId }),
      });
      setArchivedEmails((prev) => prev.filter((e) => e.id !== emailId));
      toast.success('Email moved to inbox');
      fetchEmails(); // Refresh inbox
    } catch {
      toast.error('Failed to unarchive');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      <div className={`${selectedEmail ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-zinc-200 overflow-y-auto`}>
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">Archived</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{archivedEmails.length} emails</p>
        </div>
        {archivedEmails.length === 0 ? (
          <div className="p-8 text-center">
            <ArchiveRestore className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No archived emails</p>
          </div>
        ) : (
          archivedEmails.map((email) => (
            <div key={email.id} className="group relative">
              <EmailRow
                email={{
                  id: email.id,
                  sender: email.from?.split('<')[0]?.trim() || email.from,
                  senderEmail: email.from?.match(/<([^>]+)>/)?.[1] || email.from,
                  senderAvatar: (email.from || '?').slice(0, 2).toUpperCase(),
                  subject: email.subject || '(No Subject)',
                  preview: email.snippet || '',
                  body: email.body || '',
                  aiSummary: [],
                  time: email.receivedAt ? new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                  date: email.receivedAt ? new Date(email.receivedAt).toLocaleDateString() : '',
                  isRead: email.isRead ?? true,
                  isImportant: email.isStarred ?? false,
                  isStarred: email.isStarred ?? false,
                  category: email.category || 'Archived',
                  labels: email.labels || [],
                }}
                isSelected={selectedEmail?.id === email.id}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnarchive(email.id);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 transition"
              >
                Move to Inbox
              </button>
            </div>
          ))
        )}
      </div>
      <div className={`${selectedEmail ? 'block' : 'hidden md:block'} flex-1`}>
        <EmailDetailPane />
      </div>
    </div>
  );
}