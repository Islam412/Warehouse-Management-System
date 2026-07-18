// frontend/lib/store/settingsStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsApi } from '@/lib/api/endpoints/settings';

interface SettingsState {
  company: {
    name: string;
    name_ar: string;
    logo: string;
    favicon: string;
    phone: string;
    email: string;
    address: string;
    currency: string;
    currency_symbol: string;
    tax_rate: number;
    low_stock_alert: boolean;
    email_notifications: boolean;
  };
  isLoading: boolean;
  hasLoaded: boolean; // ✅ إضافة متتبع التحميل
  fetchSettings: () => Promise<void>;
  updateCompany: (data: Partial<SettingsState['company']>) => Promise<void>;
  reset: () => void;
}

const defaultSettings = {
  name: 'DUKA',
  name_ar: 'DUKA',
  logo: '',
  favicon: '',
  phone: '0123456789',
  email: 'info@duka.com',
  address: 'القاهرة، مصر',
  currency: 'EGP',
  currency_symbol: 'ج.م',
  tax_rate: 14,
  low_stock_alert: true,
  email_notifications: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      company: defaultSettings,
      isLoading: false,
      hasLoaded: false,

      fetchSettings: async () => {
        // ✅ منع الجلب المتكرر إذا كانت البيانات محملة بالفعل
        if (get().hasLoaded) {
          return;
        }

        set({ isLoading: true });
        try {
          const response = await settingsApi.getCompany();
          const data = response.data;
          set({
            company: {
              name: data.name || defaultSettings.name,
              name_ar: data.name_ar || defaultSettings.name_ar,
              logo: data.logo || '',
              favicon: data.favicon || '',
              phone: data.phone || defaultSettings.phone,
              email: data.email || defaultSettings.email,
              address: data.address || defaultSettings.address,
              currency: data.currency || defaultSettings.currency,
              currency_symbol: data.currency_symbol || defaultSettings.currency_symbol,
              tax_rate: data.tax_rate || defaultSettings.tax_rate,
              low_stock_alert: data.low_stock_alert !== undefined ? data.low_stock_alert : defaultSettings.low_stock_alert,
              email_notifications: data.email_notifications !== undefined ? data.email_notifications : defaultSettings.email_notifications,
            },
            isLoading: false,
            hasLoaded: true,
          });
        } catch (error) {
          console.error('Error fetching settings:', error);
          set({ isLoading: false });
        }
      },

      updateCompany: async (data) => {
        try {
          const response = await settingsApi.updateCompany(data);
          const updated = response.data;
          set((state) => ({
            company: { ...state.company, ...updated },
          }));
        } catch (error) {
          console.error('Error updating company:', error);
          throw error;
        }
      },

      reset: () => {
        set({ 
          company: defaultSettings,
          hasLoaded: false,
        });
      },
    }),
    {
      name: 'duka-settings',
    }
  )
);