import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { headers } from "next/headers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "DUKA | نظام إدارة المتاجر المتكامل",
  description: "نظام متكامل لإدارة المتاجر والفواتير والمخزون والعملاء",
};

// الصفحات التي لا تظهر فيها Sidebar
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // لا يمكن استخدام usePathname في Server Component
  // سنستخدم Client Component بدلاً من ذلك
  
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`}>
        <Providers>
          <TooltipProvider delayDuration={0}>
            <LayoutContent>{children}</LayoutContent>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}

// Client Component للتحكم في Sidebar
'use client';

import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
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
