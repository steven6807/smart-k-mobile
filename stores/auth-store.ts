import { create } from 'zustand';
import { TenantUser } from '../lib/types';
import { currentUser } from '../lib/mock-data';

interface AuthState {
  user: TenantUser | null;
  isAuthenticated: boolean;
  login: (unitNumber: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (unitNumber: string, password: string) => {
    if (unitNumber === '301' && password === '1234') {
      set({ user: currentUser, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
