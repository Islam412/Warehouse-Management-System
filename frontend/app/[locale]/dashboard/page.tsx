'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { useDashboardSummary, useSalesChart } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { StockAlerts } from '@/components/dashboard/StockAlerts';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // التحقق من المصادقة
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // جلب بيانات Dashboard
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const {
    data: chartData,
    isLoading: chartLoading,
    refetch: refetchChart,
  } = useSalesChart(period);

  if (summaryError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            حدث خطأ في تحميل البيانات
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            يرجى التحقق من الاتصال بالخادم والمحاولة مرة أخرى
          </p>
          <Button onClick={() => refetchSummary()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // تحويل البيانات إلى نشاطات حديثة
  const recentActivities = [
    ...(summary?.overdue?.invoices?.slice(0, 3).map((inv: any) => ({
      id: inv.id,
      type: 'sale' as const,
      title: `فاتورة متأخرة: ${inv.invoice_number}`,
      description: `العميل: ${inv.customer}`,
      amount: inv.remaining,
      time: inv.due_date,
      status: 'pending' as const,
    })) || []),
    ...(summary?.returns?.month?.count > 0 ? [{
      id: 'return-1',
      type: 'return' as const,
      title: 'مرتجعات هذا الشهر',
      description: `${summary.returns.month.count} مرتجع بقيمة ${summary.returns.month.amount} ج.م`,
      amount: summary.returns.month.amount,
      time: new Date().toISOString(),
      status: 'completed' as const,
    }] : []),
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* الرأس */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSummary();
              refetchChart();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي المبيعات"
          value={summary?.sales?.month?.total || 0}
          icon={ShoppingCart}
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          change={summary?.sales?.month_change}
          currency
          loading={summaryLoading}
        />
        <StatsCard
          title="المشتريات"
          value={summary?.purchases?.month?.total || 0}
          icon={Package}
          color="from-emerald-500 to-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          change={summary?.purchases?.month_change}
          currency
          loading={summaryLoading}
        />
        <StatsCard
          title="العملاء"
          value={summary?.customers?.total || 0}
          icon={Users}
          color="from-purple-500 to-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          loading={summaryLoading}
        />
        <StatsCard
          title="صافي الربح"
          value={summary?.finance?.month?.profit || 0}
          icon={DollarSign}
          color="from-amber-500 to-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          currency
          loading={summaryLoading}
        />
      </div>

      {/* بطاقات إضافية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="الفواتير المتأخرة"
          value={summary?.overdue?.count || 0}
          icon={AlertTriangle}
          color="from-rose-500 to-rose-600"
          bgColor="bg-rose-50 dark:bg-rose-900/20"
          loading={summaryLoading}
        />
        <StatsCard
          title="المنتجات منخفضة المخزون"
          value={summary?.inventory?.low_stock || 0}
          icon={Package}
          color="from-orange-500 to-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
          loading={summaryLoading}
        />
        <StatsCard
          title="قيمة المخزون"
          value={summary?.inventory?.total_value || 0}
          icon={TrendingUp}
          color="from-teal-500 to-teal-600"
          bgColor="bg-teal-50 dark:bg-teal-900/20"
          currency
          loading={summaryLoading}
        />
        <StatsCard
          title="المرتجعات"
          value={summary?.returns?.month?.count || 0}
          icon={TrendingDown}
          color="from-red-500 to-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
          loading={summaryLoading}
        />
      </div>

      {/* الرسم البياني والتنبيهات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4 lg:col-span-5">
          <SalesChart
            data={chartData?.labels?.map((label: string, index: number) => ({
              date: label,
              sales: chartData.sales[index] || 0,
            })) || []}
            period={period}
            onPeriodChange={setPeriod}
            loading={chartLoading}
          />
        </div>
        <div className="md:col-span-3 lg:col-span-2">
          <StockAlerts
            lowStock={summary?.inventory?.low_stock ? [{
              product_id: '1',
              product_name: 'منتج منخفض',
              product_sku: 'SKU-001',
              quantity: 3,
              min_quantity: 10,
            }] : []}
            totalProducts={summary?.inventory?.total_products || 0}
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* أفضل المنتجات والنشاطات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <TopProducts
            products={summary?.products?.top || []}
            loading={summaryLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity
            activities={recentActivities}
            loading={summaryLoading}
          />
        </div>
      </div>
    </div>
  );
}
