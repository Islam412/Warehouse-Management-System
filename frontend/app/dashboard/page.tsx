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
  Trash2,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { getAccessToken } from '@/lib/auth';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

interface DashboardStats {
  sales: {
    today: { count: number; total: number };
    week: { count: number; total: number };
    month: { count: number; total: number };
    year: { count: number; total: number };
    month_change: number;
  };
  purchases: {
    today: { count: number; total: number };
    month: { count: number; total: number };
    month_change: number;
  };
  finance: {
    month: { expenses: number; income: number; sales: number; profit: number };
    year: { expenses: number; income: number; sales: number; profit: number };
    receivables: number;
    payables: number;
  };
  inventory: {
    total_products: number;
    low_stock: number;
    out_of_stock: number;
    total_value: number;
  };
  customers: {
    total: number;
    vip: number;
  };
  suppliers: {
    total: number;
  };
  products: {
    top: Array<{
      product_id: string;
      product_name: string;
      product_sku: string;
      total_quantity: number;
      total_revenue: number;
      avg_price: number;
    }>;
  };
  returns: {
    month: { count: number; amount: number };
    damage: { count: number; quantity: number };
  };
  overdue: {
    count: number;
    total: number;
  };
  profit_loss: {
    total_revenue: number;
    cost_of_goods: number;
    gross_profit: number;
    profit_margin: number;
  };
  charts: {
    daily_sales: Array<{ date: string; sales: number }>;
    sales_by_category: Array<{ category: string; total: number }>;
    sales_by_brand: Array<{ brand: string; total: number }>;
  };
  last_updated: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      
      // 1. جلب الملخص العام من API
      const response = await fetch('http://localhost:8000/api/v1/dashboard/api/summary/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard data from API:', data);
        setStats(data);

        // استخراج بيانات المبيعات اليومية للرسم البياني
        if (data.charts?.daily_sales) {
          const formattedSales = data.charts.daily_sales.map((item: any) => ({
            date: item.date,
            sales: item.sales,
            profit: item.sales * 0.4, // تقدير الربح 40% من المبيعات
          }));
          setSalesChartData(formattedSales);
        } else {
          // بيانات افتراضية إذا لم تكن موجودة
          setSalesChartData(generateMockSalesData());
        }

        // استخراج بيانات الفئات
        if (data.charts?.sales_by_category) {
          setCategoryData(data.charts.sales_by_category);
        } else {
          setCategoryData(generateMockCategoryData());
        }
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('حدث خطأ في تحميل البيانات');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // بيانات افتراضية احتياطية
  const generateMockSalesData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 5000) + 500,
        profit: Math.floor(Math.random() * 2000) + 200,
      });
    }
    return data;
  };

  const generateMockCategoryData = () => {
    return [
      { name: 'صنابير', value: 400 },
      { name: 'خلاطات', value: 300 },
      { name: 'مواسير', value: 200 },
      { name: 'محابس', value: 150 },
      { name: 'أخرى', value: 100 },
    ];
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-EG')} ج.م`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // دالة لإعادة التحميل
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{error}</h3>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // استخدام البيانات من API أو البيانات الافتراضية
  const displaySalesData = salesChartData.length > 0 ? salesChartData : generateMockSalesData();
  const displayCategoryData = categoryData.length > 0 ? categoryData : generateMockCategoryData();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">لوحة التحكم</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            نظرة عامة على أداء متجرك
            {stats?.last_updated && (
              <span className="text-xs text-gray-400 mr-2">
                (آخر تحديث: {new Date(stats.last_updated).toLocaleString('ar-EG')})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Stats Cards - من API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {formatCurrency(stats?.sales?.month?.total || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          {stats?.sales?.month_change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs ${stats.sales.month_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.sales.month_change >= 0 ? '↑' : '↓'} {Math.abs(stats.sales.month_change)}%
              </span>
              <span className="text-xs text-gray-400">من الشهر الماضي</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">صافي الربح</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(stats?.finance?.month?.profit || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">العملاء</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {stats?.customers?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {stats?.customers?.vip !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-amber-600">VIP: {stats.customers.vip}</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">المنتجات</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {stats?.inventory?.total_products || 0}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          {stats?.inventory?.low_stock !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                منخفض: {stats.inventory.low_stock}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Extra Stats - من API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">منتجات تالفة</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {stats?.returns?.damage?.quantity || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">مرتجعات</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats?.returns?.month?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Truck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">الموردين</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {stats?.suppliers?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">فواتير متأخرة</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {stats?.overdue?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts - من API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المبيعات اليومية</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displaySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" className="text-xs text-gray-500" />
                <YAxis className="text-xs text-gray-500" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} name="المبيعات" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" name="الربح" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            المبيعات حسب الفئة
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={displayCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {displayCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section - من API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">أفضل المنتجات</h3>
          <div className="space-y-3">
            {stats?.products?.top && stats.products.top.length > 0 ? (
              stats.products.top.slice(0, 5).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[120px]">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-gray-500">{product.total_quantity} وحدة</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(product.total_revenue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المنتجات الأقل مبيعاً</h3>
          <div className="space-y-3">
            {stats?.products?.top && stats.products.top.length > 0 ? (
              stats.products.top.slice(-5).reverse().map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[120px]">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-gray-500">{product.total_quantity || 0} وحدة</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(product.total_revenue || 0)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">ملخص مالي</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</span>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(stats?.finance?.month?.sales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">إجمالي المصروفات</span>
              <span className="text-sm font-bold text-red-600">
                {formatCurrency(stats?.finance?.month?.expenses || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">صافي الربح</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(stats?.finance?.month?.profit || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">هامش الربح</span>
              <span className="text-sm font-bold text-green-600">
                {stats?.profit_loss?.profit_margin !== undefined ? formatPercentage(stats.profit_loss.profit_margin) : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
        آخر تحديث: {stats?.last_updated ? new Date(stats.last_updated).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG')}
      </div>
    </div>
  );
}
