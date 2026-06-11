import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockApi } from '@/services/mockApi';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, phone: string) => Promise<User>;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const user = await mockApi.login({ username, password });
        set({ user, isAuthenticated: true });
        return user;
      },

      register: async (username, password, phone) => {
        const user = await mockApi.register({ username, password, phone });
        set({ user, isAuthenticated: true });
        return user;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      initFromStorage: () => {
        // persist 中间件自动处理，此方法保留供未来扩展
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
