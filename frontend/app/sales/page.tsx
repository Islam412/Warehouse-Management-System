'use client';

import { useState, useMemo } from 'react';
import { useInvoices, useDeleteInvoice } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Brain,
  Layers,
  Flame,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Crown,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Sparkles,
  Gift,
  Truck,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  paid: 'bg-green-500',
  partially_paid: 'bg-yellow-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  confirmed: 'مؤكدة',
  paid: 'مدفوعة',
  partially_paid: 'مدفوعة جزئياً',
  cancelled: 'ملغية',
};

// ============================================
// ✅ Types
// ============================================
interface InvoiceItem {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount: number;
  tax: number;
  category_name?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  due_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'draft' | 'confirmed' | 'paid' | 'partially_paid' | 'cancelled';
  status_display: string;
  is_overdue: boolean;
  notes?: string;
  items: InvoiceItem[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// ✅ Helper Functions
// ============================================
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: invoicesData, isLoading, error, refetch } = useInvoices({ search });
  const { data: customersData } = useCustomers();
  const { data: productsData } = useProducts();
  const deleteInvoice = useDeleteInvoice();

  // ✅ تأكد من أن البيانات مصفوفات
  const invoices: Invoice[] = Array.isArray(invoicesData) ? invoicesData : 
                    invoicesData?.results ? invoicesData.results : [];
  
  const customers = Array.isArray(customersData) ? customersData : [];

  // ============================================
  // 📊 تحليلات المبيعات
  // ============================================

  // 1. إحصائيات عامة
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum: number, inv: Invoice) => sum + toNumber(inv.total), 0);
  const totalPaid = invoices.reduce((sum: number, inv: Invoice) => sum + toNumber(inv.paid_amount), 0);
  const totalRemaining = totalAmount - totalPaid;

  // 2. الفواتير حسب الحالة
  const statusDistribution = useMemo(() => {
    const statuses = ['draft', 'confirmed', 'paid', 'partially_paid', 'cancelled'];
    return statuses.map((status: string) => ({
      name: statusLabels[status] || status,
      value: invoices.filter((inv: Invoice) => inv.status === status).length,
      status,
    }));
  }, [invoices]);

  // 3. المبيعات اليومية (آخر 30 يوم)
  const dailySales = useMemo(() => {
    const now = new Date();
    const data: Record<string, number> = {};
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      data[key] = 0;
    }
    
    invoices.forEach((inv: Invoice) => {
      if (inv.date) {
        const date = new Date(inv.date).toISOString().split('T')[0];
        if (data[date] !== undefined) {
          data[date] += toNumber(inv.total);
        }
      }
    });
    
    return Object.entries(data).map(([date, value]) => ({
      date: date.substring(5), // MM-DD
      sales: value,
    }));
  }, [invoices]);

  // 4. أفضل العملاء
  const topCustomers = useMemo(() => {
    const customerSales: Record<string, { name: string; total: number; count: number }> = {};
    
    invoices.forEach((inv: Invoice) => {
      const customerId = inv.customer;
      const customerName = inv.customer_name || 'غير معروف';
      if (!customerSales[customerId]) {
        customerSales[customerId] = { name: customerName, total: 0, count: 0 };
      }
      customerSales[customerId].total += toNumber(inv.total);
      customerSales[customerId].count += 1;
    });
    
    return Object.values(customerSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [invoices]);

  // 5. أفضل المنتجات مبيعاً
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; total: number }> = {};
    
    invoices.forEach((inv: Invoice) => {
      if (inv.items) {
        inv.items.forEach((item: InvoiceItem) => {
          const productId = item.product;
          const productName = item.product_name || 'غير معروف';
          if (!productSales[productId]) {
            productSales[productId] = { name: productName, quantity: 0, total: 0 };
          }
          productSales[productId].quantity += toNumber(item.quantity);
          productSales[productId].total += toNumber(item.total);
        });
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [invoices]);

  // 6. أقل المنتجات مبيعاً
  const leastProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; total: number }> = {};
    
    invoices.forEach((inv: Invoice) => {
      if (inv.items) {
        inv.items.forEach((item: InvoiceItem) => {
          const productId = item.product;
          const productName = item.product_name || 'غير معروف';
          if (!productSales[productId]) {
            productSales[productId] = { name: productName, quantity: 0, total: 0 };
          }
          productSales[productId].quantity += toNumber(item.quantity);
          productSales[productId].total += toNumber(item.total);
        });
      }
    });
    
    return Object.values(productSales)
      .filter((p) => p.quantity > 0)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10);
  }, [invoices]);

  // 7. المبيعات حسب الشهر
  const monthlySales = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      data[key] = 0;
    }
    
    invoices.forEach((inv: Invoice) => {
      if (inv.date) {
        const date = new Date(inv.date);
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (data[key] !== undefined) {
          data[key] += toNumber(inv.total);
        }
      }
    });
    
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  // 8. المبيعات حسب الفئة
  const salesByCategory = useMemo(() => {
    const categorySales: Record<string, number> = {};
    
    invoices.forEach((inv: Invoice) => {
      if (inv.items) {
        inv.items.forEach((item: InvoiceItem) => {
          const category = item.category_name || 'غير مصنف';
          categorySales[category] = (categorySales[category] || 0) + toNumber(item.total);
        });
      }
    });
    
    return Object.entries(categorySales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [invoices]);

  // 9. نسبة النمو الشهري
  const growthRate = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let currentMonthTotal = 0;
    let lastMonthTotal = 0;
    
    invoices.forEach((inv: Invoice) => {
      if (inv.date) {
        const date = new Date(inv.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          currentMonthTotal += toNumber(inv.total);
        } else if (date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear) {
          lastMonthTotal += toNumber(inv.total);
        } else if (date.getMonth() === 11 && currentMonth === 0 && date.getFullYear() === currentYear - 1) {
          lastMonthTotal += toNumber(inv.total);
        }
      }
    });
    
    if (lastMonthTotal === 0) return 0;
    return ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }, [invoices]);

  // 10. الفواتير المتأخرة
  const overdueInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter((inv: Invoice) => {
      if (!inv.due_date) return false;
      const dueDate = new Date(inv.due_date);
      return dueDate < now && inv.status !== 'paid' && inv.status !== 'cancelled';
    });
  }, [invoices]);

  // 11. متوسط قيمة الفاتورة
  const avgInvoiceValue = totalInvoices > 0 ? totalAmount / totalInvoices : 0;

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    await deleteInvoice.mutateAsync(invoiceToDelete.id);
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
    refetch();
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
    toast.info('تم تحديث البيانات');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل الفواتير</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المبيعات</h1>
          <p className="text-gray-500 text-sm">إدارة الفواتير وتحليل المبيعات</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                فاتورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                <DialogDescription>أدخل بيانات الفاتورة والمنتجات</DialogDescription>
              </DialogHeader>
              <InvoiceForm 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetch();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 📊 بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الفواتير</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-green-600">{totalAmount.toFixed(2)} ج.م</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المدفوع</p>
                <p className="text-2xl font-bold text-blue-600">{totalPaid.toFixed(2)} ج.م</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المتبقي</p>
                <p className="text-2xl font-bold text-red-600">{totalRemaining.toFixed(2)} ج.م</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">متوسط الفاتورة</p>
                <p className="text-2xl font-bold text-amber-600">{avgInvoiceValue.toFixed(2)} ج.م</p>
              </div>
              <Activity className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={`border-${growthRate >= 0 ? 'green' : 'red'}-500/30 bg-${growthRate >= 0 ? 'green' : 'red'}-50 dark:bg-${growthRate >= 0 ? 'green' : 'red'}-950/20`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نسبة النمو</p>
                <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </p>
              </div>
              {growthRate >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="trend" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            اتجاه المبيعات
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="w-4 h-4" />
            أفضل العملاء
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            حالة الفواتير
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            متأخرة
          </TabsTrigger>
        </TabsList>

        {/* التبويب 1: نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* المبيعات اليومية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Activity className="w-5 h-5" />
                  المبيعات اليومية
                </CardTitle>
                <CardDescription>آخر 30 يوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySales}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} interval={4} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* المبيعات الشهرية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Calendar className="w-5 h-5" />
                  المبيعات الشهرية
                </CardTitle>
                <CardDescription>آخر 12 شهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={9} tickLine={false} interval={1} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {monthlySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* حالة الفواتير */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <PieChartIcon className="w-5 h-5" />
                توزيع الفواتير حسب الحالة
              </CardTitle>
              <CardDescription>حالة جميع الفواتير</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const safePercent = percent ?? 0;
                          return `${name} ${(safePercent * 100).toFixed(0)}%`;
                        }}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.value}</span>
                        <span className="text-xs text-muted-foreground">
                          ({totalInvoices > 0 ? ((item.value / totalInvoices) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 2: اتجاه المبيعات */}
        <TabsContent value="trend" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* المبيعات اليومية - مكبرة */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                  اتجاه المبيعات اليومية
                </CardTitle>
                <CardDescription>تطور المبيعات خلال آخر 30 يوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} interval={3} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* المبيعات حسب الفئة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <Package className="w-5 h-5" />
                المبيعات حسب الفئة
              </CardTitle>
              <CardDescription>توزيع المبيعات على الفئات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 3: أفضل العملاء */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Award className="w-5 h-5" />
                أفضل العملاء
              </CardTitle>
              <CardDescription>العملاء الأكثر إنفاقاً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  topCustomers.map((customer, index) => {
                    const maxTotal = topCustomers[0]?.total || 1;
                    const percentage = (customer.total / maxTotal) * 100;
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.count} فاتورة</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{customer.total.toFixed(2)} ج.م</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 4: المنتجات */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* أفضل المنتجات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  أفضل المنتجات مبيعاً
                </CardTitle>
                <CardDescription>المنتجات الأكثر طلباً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                  ) : (
                    topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.quantity} وحدة</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{product.total.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* أقل المنتجات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  أقل المنتجات مبيعاً
                </CardTitle>
                <CardDescription>المنتجات الأقل طلباً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leastProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                  ) : (
                    leastProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors border border-red-100 dark:border-red-800/30">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.quantity} وحدة</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{product.total.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* التبويب 5: حالة الفواتير */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع الحالات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع الفواتير حسب الحالة
                </CardTitle>
                <CardDescription>حالة جميع الفواتير</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const safePercent = percent ?? 0;
                          return `${name} ${(safePercent * 100).toFixed(0)}%`;
                        }}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* جدول تفصيلي */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5" />
                  تفاصيل الحالات
                </CardTitle>
                <CardDescription>عدد وقيمة الفواتير حسب الحالة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusDistribution.map((item, index) => {
                    const statusInvoices = invoices.filter((inv: Invoice) => inv.status === item.status);
                    const total = statusInvoices.reduce((sum: number, inv: Invoice) => sum + toNumber(inv.total), 0);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.value} فواتير</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{total.toFixed(2)} ج.م</p>
                          <p className="text-xs text-muted-foreground">
                            {totalInvoices > 0 ? ((item.value / totalInvoices) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* التبويب 6: الفواتير المتأخرة */}
        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Clock className="w-5 h-5" />
                الفواتير المتأخرة
              </CardTitle>
              <CardDescription>الفواتير التي تجاوزت تاريخ الاستحقاق</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>لا توجد فواتير متأخرة!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overdueInvoices.map((invoice: Invoice) => {
                    const daysOverdue = Math.floor(
                      (new Date().getTime() - new Date(invoice.due_date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{invoice.invoice_number}</p>
                            <Badge className="bg-red-500">متأخرة</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                          <p className="text-xs text-red-500">متأخرة {daysOverdue} يوم</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">
                            {toNumber(invoice.remaining_amount).toFixed(2)} ج.م
                          </p>
                          <p className="text-xs text-muted-foreground">
                            تاريخ الاستحقاق: {new Date(invoice.due_date).toLocaleDateString('ar-EG')}
                          </p>
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-500">
                              <Eye className="w-4 h-4 ml-1" />
                              عرض
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 🔍 البحث */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث عن فاتورة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{invoices.length} فاتورة</span>
      </div>

      {/* 📋 قائمة الفواتير */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>عرض جميع الفواتير في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    لا توجد فواتير
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: Invoice, index: number) => {
                  const total = toNumber(invoice.total);
                  const paid = toNumber(invoice.paid_amount);
                  const remaining = total - paid;
                  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';
                  
                  // ✅ استخدام customer_name مباشرة
                  const customerName = invoice.customer_name || 'غير معروف';
                  
                  return (
                    <motion.tr
                      key={invoice.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {invoice.invoice_number || '-'}
                          {isOverdue && <Clock className="w-4 h-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>{invoice.date ? new Date(invoice.date).toLocaleDateString('ar-EG') : '-'}</TableCell>
                      <TableCell className="font-bold">{total.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-green-600">{paid.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-red-600">{remaining.toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status] || 'bg-gray-500'}>
                          {statusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/invoice/${invoice.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600" title="طباعة الفاتورة">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" title="عرض الفاتورة">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => openDeleteDialog(invoice)}
                            title="حذف الفاتورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceToDelete && (
                <>
                  <p><strong>الفاتورة:</strong> {invoiceToDelete.invoice_number}</p>
                  <p><strong>العميل:</strong> {invoiceToDelete.customer_name}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف الفاتورة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}