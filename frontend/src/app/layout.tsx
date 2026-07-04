import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'نظام إدارة المتجر - Duka',
  description: 'نظام إدارة متجر متكامل مع Next.js و Django',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}