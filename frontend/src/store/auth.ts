import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, LoginResponse } from '@/types';
import apiClient from '../api/client';
import { getToken, getUser, setToken, setRefreshToken, removeToken, setUser } from '../utils/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isLoading: true,
        isInitialized: false,

        initialize: () => {
          const token = getToken();
          const user = getUser();
          set({
            user: user || null,
            token: token || null,
            isLoading: false,
            isInitialized: true,
          });
        },

        login: async (email: string, password: string) => {
          set({ isLoading: true });

          try {
            const response = await apiClient.post<LoginResponse>('/auth/api/login/', {
              email,
              password,
            });

            const { user, access, refresh } = response;

            setToken(access);
            setRefreshToken(refresh);
            setUser(user);
            set({ user, token: access, isLoading: false });

            return response;
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: () => {
          removeToken();
          set({ user: null, token: null });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }),
      }
    )
  )
);