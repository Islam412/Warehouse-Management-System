'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardSummary, useSalesChart, useComparison } from '@/hooks/useDashboard';
import { useProducts } from '@/hooks/useProducts';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: summary, isLoading, error } = useDashboardSummary();
  const { data: chartData, isLoading: chartLoading } = useSalesChart('month');
  const { data: comparison } = useComparison();

  if (isLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل البيانات</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
      </div>
    );
  }

  // بيانات الرسم البياني
  const salesData = chartData?.labels?.map((label: string, index: number) => ({
    date: label,
    sales: chartData.sales[index] || 0,
  })) || [];

  // بيانات المخزون للتوزيع
  const stockData = [
    { name: 'متوفر', value: summary?.inventory?.total_products - summary?.inventory?.low_stock - summary?.inventory?.out_of_stock || 0 },
    { name: 'منخفض', value: summary?.inventory?.low_stock || 0 },
    { name: 'نفد', value: summary?.inventory?.out_of_stock || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            لوحة التحكم
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            نظرة عامة على أداء متجرك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي المبيعات"
          value={summary?.sales?.month?.total || 0}
          icon={ShoppingCart}
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          change={summary?.sales?.month_change}
          currency
        />
        <StatsCard
          title="عدد العملاء"
          value={summary?.customers?.total || 0}
          icon={Users}
          color="from-emerald-500 to-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatsCard
          title="المنتجات"
          value={summary?.inventory?.total_products || 0}
          icon={Package}
          color="from-purple-500 to-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatsCard
          title="مخزون منخفض"
          value={summary?.inventory?.low_stock || 0}
          icon={AlertTriangle}
          color="from-rose-500 to-rose-600"
          bgColor="bg-rose-50 dark:bg-rose-900/20"
        />
      </div>

      {/* بطاقات إضافية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="صافي الربح"
          value={summary?.finance?.month?.profit || 0}
          icon={DollarSign}
          color="from-amber-500 to-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          currency
        />
        <StatsCard
          title="الفواتير المتأخرة"
          value={summary?.overdue?.count || 0}
          icon={AlertTriangle}
          color="from-red-500 to-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
        />
        <StatsCard
          title="قيمة المخزون"
          value={summary?.inventory?.total_value || 0}
          icon={TrendingUp}
          color="from-teal-500 to-teal-600"
          bgColor="bg-teal-50 dark:bg-teal-900/20"
          currency
        />
        <StatsCard
          title="الموردين"
          value={summary?.suppliers?.total || 0}
          icon={Package}
          color="from-indigo-500 to-indigo-600"
          bgColor="bg-indigo-50 dark:bg-indigo-900/20"
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسم البياني للمبيعات */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">المبيعات اليومية</h3>
          <div className="h-[300px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">لا توجد بيانات</div>
            )}
          </div>
        </div>

        {/* توزيع المخزون */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">توزيع المخزون</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
