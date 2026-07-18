// frontend/components/SettingsInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settingsStore';

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function SettingsInitializer() {
  const pathname = usePathname();
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const company = useSettingsStore((state) => state.company);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const hasLoaded = useSettingsStore((state) => state.hasLoaded);
  
  const isAuthPage = AUTH_PAGES.some(page => pathname === page || pathname?.startsWith(page + '/'));
  const hasFetched = useRef(false);

  
  useEffect(() => {
    if (!isAuthPage && !hasFetched.current && !isLoading && !hasLoaded) {
      hasFetched.current = true;
      fetchSettings();
    }
  }, [isAuthPage, isLoading, hasLoaded, fetchSettings]);

  useEffect(() => {
    if (company.name && company.name !== 'DUKA' && !isAuthPage) {
      document.title = `${company.name} | نظام إدارة المتاجر المتكامل`;
    }
  }, [company.name, isAuthPage]);

  return null;
}