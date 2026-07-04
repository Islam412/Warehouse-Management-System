import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "DUKA | نظام إدارة المتاجر المتكامل",
  description: "نظام متكامل لإدارة المتاجر والفواتير والمخزون والعملاء",
  keywords: "متجر, نظام إدارة, مبيعات, مشتريات, مخزون, فواتير",
  authors: [{ name: "DUKA Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`}>
        <Providers>
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
