import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export default function SentPage() {
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/gmail/messages?label=SENT')
      .then(data => {
        setSentEmails(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Sent</h2>
      {sentEmails.length === 0 ? (
        <p className="text-zinc-400">No sent emails</p>
      ) : (
        sentEmails.map(email => (
          <div key={email.id} className="border-b border-zinc-800 p-3 hover:bg-zinc-900">
            <p className="font-medium">{email.subject}</p>
            <p className="text-sm text-zinc-400">{email.snippet}</p>
          </div>
        ))
      )}
    </div>
  );
}