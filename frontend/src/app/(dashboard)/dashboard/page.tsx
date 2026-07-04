'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth';
import apiClient from '@/lib/api/client';
import { DashboardSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Building,
  Wallet,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiClient.get<DashboardSummary>('/dashboard/api/summary/'),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    {
      title: 'مبيعات اليوم',
      value: `${summary?.sales.today.total || 0} ج.م`,
      change: `${summary?.sales.month_change || 0}%`,
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'عدد الفواتير اليوم',
      value: summary?.sales.today.count || 0,
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'العملاء النشطون',
      value: summary?.customers.total || 0,
      change: `VIP: ${summary?.customers.vip || 0}`,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'المنتجات منخفضة المخزون',
      value: summary?.inventory.low_stock || 0,
      change: 'تحتاج إعادة طلب',
      icon: Package,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950',
    },
  ];

  const financeStats = [
    {
      title: 'إجمالي المبيعات (شهر)',
      value: `${summary?.finance.month.sales || 0} ج.م`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'إجمالي المصروفات (شهر)',
      value: `${summary?.finance.month.expenses || 0} ج.م`,
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: 'صافي الربح (شهر)',
      value: `${summary?.finance.month.profit || 0} ج.م`,
      icon: Wallet,
      color: 'text-blue-500',
    },
    {
      title: 'الذمم المدينة',
      value: `${summary?.finance.receivables || 0} ج.م`,
      icon: Clock,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6 rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            مرحباً {user?.first_name || user?.username} 👋
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          آخر تحديث: {new Date(summary?.last_updated || '').toLocaleString('ar-EG')}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financeStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المبيعات اليومية (آخر 30 يوم)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary?.charts.daily_sales || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG')}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value} ج.م`, 'المبيعات']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('ar-EG')}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المبيعات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary?.charts.sales_by_category || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category__name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} ج.م`, 'المبيعات']} />
                  <Bar dataKey="total" fill="#00C49F">
                    {(summary?.charts.sales_by_category || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              الفواتير المتأخرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.overdue.invoices.length === 0 ? (
              <p className="text-muted-foreground">لا توجد فواتير متأخرة ✅</p>
            ) : (
              <div className="space-y-3">
                {summary?.overdue.invoices.slice(0, 5).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invoice.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        متأخرة {invoice.days_overdue} يوم
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">
                        {invoice.remaining} ج.م
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.invoice_number}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>منتجات منخفضة المخزون</span>
                <span className="font-bold text-red-500">
                  {summary?.inventory.low_stock || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>منتجات نفذت من المخزون</span>
                <span className="font-bold text-red-500">
                  {summary?.inventory.out_of_stock || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>إجمالي المنتجات</span>
                <span className="font-bold">
                  {summary?.inventory.total_products || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>قيمة المخزون</span>
                <span className="font-bold text-green-500">
                  {summary?.inventory.total_value || 0} ج.م
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
              <Skeleton className="h-4 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}