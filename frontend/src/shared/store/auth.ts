import { create } from 'zustand';
import type { CurrentUserResponse } from '../api/client';

interface AuthStore {
  user: CurrentUserResponse | null;
  authHeader: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: CurrentUserResponse, authHeader: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  authHeader: null,
  isLoading: true,
  error: null,

  setUser: (user, authHeader) => set({ user, authHeader, isLoading: false, error: null }),
  clearAuth: () => set({ user: null, authHeader: null, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));
