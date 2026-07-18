// frontend/components/LayoutWrapper.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSettingsStore } from '@/lib/store/settingsStore';

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const company = useSettingsStore((state) => state.company);
  const hasLoaded = useSettingsStore((state) => state.hasLoaded);
  
  const isAuthPage = AUTH_PAGES.some(page => pathname === page || pathname?.startsWith(page + '/'));

  // ✅ جلب الإعدادات فقط إذا:
  // 1. ليس في صفحة مصادقة
  // 2. لم يتم تحميلها من قبل
  useEffect(() => {
    if (!isAuthPage && !hasLoaded) {
      fetchSettings();
    }
  }, [isAuthPage, hasLoaded, fetchSettings]);

  // ✅ تحديث عنوان الصفحة فقط في الصفحات المحمية
  useEffect(() => {
    if (company.name && company.name !== 'DUKA' && !isAuthPage) {
      document.title = `${company.name} | نظام إدارة المتاجر المتكامل`;
    }
  }, [company.name, isAuthPage]);

  // ✅ صفحات المصادقة - لا تعرض Sidebar/Header/Footer
  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 md:mr-20 lg:mr-64 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
        <Footer />
      </main>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}