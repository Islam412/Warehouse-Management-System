'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

// الصفحات التي لا تظهر فيها Sidebar
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // التحقق مما إذا كانت الصفحة الحالية من صفحات Auth
  const isAuthPage = AUTH_PAGES.some(page => pathname === page || pathname?.startsWith(page + '/'));
  
  // إذا كانت صفحة Auth، لا نعرض Sidebar
  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </>
    );
  }

  // باقي الصفحات مع Sidebar
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 md:mr-20 lg:mr-64 flex flex-col min-h-screen">
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
        <Footer />
      </main>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
