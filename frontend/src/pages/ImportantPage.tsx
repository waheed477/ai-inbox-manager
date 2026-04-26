import { useEffect } from 'react';
import { useEmailStore } from '@/store/emailStore';
import EmailRow from '@/components/EmailRow';
import EmailDetailPane from '@/components/EmailDetailPane';

export default function ImportantPage() {
  // Direct store access - guarantees re-render on every change
  const emails = useEmailStore(state => state.emails);
  const loading = useEmailStore(state => state.loading);
  const selectedEmail = useEmailStore(state => state.selectedEmail);
  const fetchEmails = useEmailStore(state => state.fetchEmails);
  const selectEmail = useEmailStore(state => state.selectEmail);
  const clearSelection = useEmailStore(state => state.clearSelection);

  useEffect(() => {
    if (emails.length === 0) fetchEmails();
  }, []);

  const importantEmails = emails.filter(
    e => e.isImportant === true || e.isStarred === true || e.labels?.includes('IMPORTANT')
  );

  if (loading && emails.length === 0) {
    return <div className="flex items-center justify-center h-96">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-full">
      <div className={`${selectedEmail ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-zinc-800 overflow-y-auto`}>
        <h2 className="p-4 text-lg font-bold">Important</h2>
        {importantEmails.length === 0 ? (
          <p className="p-4 text-zinc-400">No important emails</p>
        ) : (
          importantEmails.map(email => (
            <EmailRow
              key={email.id}
              email={email}
              isSelected={selectedEmail?.id === email.id}
            />
          ))
        )}
      </div>
      <div className={`${selectedEmail ? 'block' : 'hidden md:block'} flex-1`}>
        <EmailDetailPane />
      </div>
    </div>
  );
}