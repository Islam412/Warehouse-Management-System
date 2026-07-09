import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // إعدادات الصور - الطريقة الصحيحة
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  
  // إزالة i18n من هنا - سنستخدم middleware بدلاً من ذلك
  // i18n تم إزالته لأنه غير مدعوم في App Router
};

export default nextConfig;
