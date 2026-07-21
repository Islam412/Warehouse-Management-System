// frontend/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardSummary, useSalesChart, useComparison } from '@/hooks/useDashboard';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Loader2,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: summary, isLoading, error } = useDashboardSummary();
  const { data: chartData, isLoading: chartLoading } = useSalesChart('month');
  const { data: comparison } = useComparison();

  if (!mounted) return null;

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
        <Button onClick={() => window.location.reload()} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  const salesData = chartData?.labels?.map((label: string, index: number) => ({
    date: label,
    sales: chartData.sales[index] || 0,
  })) || [];

  const stockData = [
    { name: 'متوفر', value: summary?.inventory?.total_products - summary?.inventory?.low_stock - summary?.inventory?.out_of_stock || 0 },
    { name: 'منخفض', value: summary?.inventory?.low_stock || 0 },
    { name: 'نفد', value: summary?.inventory?.out_of_stock || 0 },
  ];

  const topProducts = summary?.products?.top || [];
  const categoryComparison = comparison?.categories || [];
  const brandComparison = comparison?.brands || [];

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm">نظرة عامة شاملة على أداء متجرك</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
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
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          change={summary?.sales?.month_change}
          currency
        />
        <StatsCard
          title="عدد العملاء"
          value={summary?.customers?.total || 0}
          icon={Users}
          color="from-emerald-500 to-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard
          title="المنتجات"
          value={summary?.inventory?.total_products || 0}
          icon={Package}
          color="from-purple-500 to-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
        <StatsCard
          title="مخزون منخفض"
          value={summary?.inventory?.low_stock || 0}
          icon={AlertTriangle}
          color="from-rose-500 to-rose-600"
          bgColor="bg-rose-50 dark:bg-rose-950/30"
        />
      </div>

      {/* بطاقات مالية إضافية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="صافي الربح"
          value={summary?.finance?.month?.profit || 0}
          icon={DollarSign}
          color="from-amber-500 to-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
          currency
        />
        <StatsCard
          title="الفواتير المتأخرة"
          value={summary?.overdue?.count || 0}
          icon={AlertTriangle}
          color="from-red-500 to-red-600"
          bgColor="bg-red-50 dark:bg-red-950/30"
        />
        <StatsCard
          title="قيمة المخزون"
          value={summary?.inventory?.total_value || 0}
          icon={TrendingUp}
          color="from-teal-500 to-teal-600"
          bgColor="bg-teal-50 dark:bg-teal-950/30"
          currency
        />
        <StatsCard
          title="الموردين"
          value={summary?.suppliers?.total || 0}
          icon={Package}
          color="from-indigo-500 to-indigo-600"
          bgColor="bg-indigo-50 dark:bg-indigo-950/30"
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسم البياني للمبيعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              المبيعات اليومية
            </CardTitle>
            <CardDescription>تطور المبيعات خلال الشهر</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">لا توجد بيانات</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* توزيع المخزون */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              توزيع المخزون
            </CardTitle>
            <CardDescription>حالة المنتجات في المخزون</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => {
                      // ✅ التحقق من أن percent ليس undefined
                      const safePercent = percent ?? 0;
                      return `${name} ${(safePercent * 100).toFixed(0)}%`;
                    }}
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أفضل المنتجات والمقارنات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل المنتجات مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              أفضل المنتجات مبيعاً
            </CardTitle>
            <CardDescription>المنتجات الأكثر طلباً هذا الشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد مبيعات هذا الشهر</p>
              ) : (
                topProducts.slice(0, 5).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.product_sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{product.total_revenue.toFixed(0)} ج.م</p>
                      <p className="text-xs text-muted-foreground">{product.total_quantity} وحدة</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* مقارنة الفئات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <BarChart3 className="w-5 h-5" />
              مقارنة الفئات
            </CardTitle>
            <CardDescription>المبيعات حسب الفئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryComparison.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
              ) : (
                categoryComparison.slice(0, 5).map((cat: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.name}</span>
                      <span className="font-bold">{cat.total_sales?.toFixed(0) || 0} ج.م</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((cat.total_sales / (categoryComparison[0]?.total_sales || 1)) * 100, 100)}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الفواتير المتأخرة */}
      {summary?.overdue?.invoices && summary.overdue.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              الفواتير المتأخرة
            </CardTitle>
            <CardDescription>فواتير لم يتم دفعها في الوقت المحدد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.overdue.invoices.slice(0, 5).map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <p className="text-sm font-medium">{invoice.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{invoice.remaining.toFixed(2)} ج.م</p>
                    <p className="text-xs text-red-500">متأخرة {invoice.days_overdue} يوم</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}