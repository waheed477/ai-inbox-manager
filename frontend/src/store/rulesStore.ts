import { create } from 'zustand';
import { apiRequest } from '@/lib/api';

export interface Rule {
  id: string;
  name: string;
  condition: string;
  operator: string;
  value: string;
  action: string;
  isActive: boolean;
}

interface RulesStore {
  rules: Rule[];
  loading: boolean;
  fetchRules: () => Promise<void>;
  addRule: (rule: Omit<Rule, 'id'>) => Promise<void>;
  updateRule: (id: string, data: Partial<Rule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string, isActive: boolean) => Promise<void>;
}

export const useRulesStore = create<RulesStore>((set, get) => ({
  rules: [],
  loading: false,

  fetchRules: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest('/api/rules');
      set({ rules: Array.isArray(data) ? data : [], loading: false });
    } catch {
      set({ rules: [], loading: false });
    }
  },

  addRule: async (rule) => {
    const data = await apiRequest('/api/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
    set((state) => ({ rules: [...state.rules, data] }));
  },

  updateRule: async (id, updates) => {
    await apiRequest('/api/rules', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },

  deleteRule: async (id) => {
    await apiRequest('/api/rules', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
  },

  toggleRule: async (id, isActive) => {
    await apiRequest('/api/rules', {
      method: 'PUT',
      body: JSON.stringify({ id, isActive }),
    });
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, isActive } : r)),
    }));
  },
}));