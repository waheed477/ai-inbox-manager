import { create } from 'zustand';
import { apiRequest } from '@/lib/api';

interface ScheduleEmail {
  to: string;
  subject: string;
  body: string;
  scheduledAt: string;
  threadId?: string;
}

interface ScheduleStore {
  scheduled: any[];
  loading: boolean;
  fetchScheduled: () => Promise<void>;
  scheduleEmail: (data: ScheduleEmail) => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  scheduled: [],
  loading: false,

  fetchScheduled: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest('/api/gmail/schedule');
      set({ scheduled: Array.isArray(data) ? data : [], loading: false });
    } catch {
      set({ scheduled: [], loading: false });
    }
  },

  scheduleEmail: async (data) => {
    await apiRequest('/api/gmail/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
}));