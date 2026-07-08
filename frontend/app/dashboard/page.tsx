'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      <p className="text-gray-500 mt-2">مرحباً بك في نظام DUKA</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500">إجمالي المبيعات</h3>
          <p className="text-2xl font-bold mt-2 text-blue-600">0 ج.م</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500">عدد العملاء</h3>
          <p className="text-2xl font-bold mt-2 text-green-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500">المنتجات</h3>
          <p className="text-2xl font-bold mt-2 text-purple-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500">الموردين</h3>
          <p className="text-2xl font-bold mt-2 text-orange-600">0</p>
        </div>
      </div>
    </div>
  );
}
