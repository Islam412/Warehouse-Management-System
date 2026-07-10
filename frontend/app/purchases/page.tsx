// frontend/app/purchases/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { usePurchases, useDeletePurchase } from '@/hooks/usePurchases';
import { useSuppliers } from '@/hooks/useSuppliers';
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
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Crown,
  Star,
  Building2,
  Truck,
  FileText,
  Zap,
  Sparkles,
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
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  ordered: 'bg-blue-500',
  received: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  ordered: 'تم الطلب',
  received: 'تم الاستلام',
  cancelled: 'ملغي',
};

// دالة مساعدة
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export default function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: purchasesData, isLoading, error, refetch } = usePurchases({ search });
  const { data: suppliersData } = useSuppliers();
  const deletePurchase = useDeletePurchase();

  const purchases = Array.isArray(purchasesData) ? purchasesData : 
                    purchasesData?.results ? purchasesData.results : [];
  
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  // ============================================
  // 📊 تحليلات المشتريات
  // ============================================

  // 1. إحصائيات عامة
  const totalOrders = purchases.length;
  const totalAmount = purchases.reduce((sum, p) => sum + toNumber(p.total), 0);
  const receivedOrders = purchases.filter(p => p.status === 'received').length;
  const pendingOrders = purchases.filter(p => p.status === 'ordered' || p.status === 'draft').length;

  // 2. توزيع الحالات
  const statusDistribution = useMemo(() => {
    const statuses = ['draft', 'ordered', 'received', 'cancelled'];
    return statuses.map(status => ({
      name: statusLabels[status] || status,
      value: purchases.filter(p => p.status === status).length,
      status,
    }));
  }, [purchases]);

  // 3. أفضل الموردين
  const topSuppliers = useMemo(() => {
    const supplierData: Record<string, { name: string; total: number; count: number }> = {};
    
    purchases.forEach(p => {
      const supplierId = p.supplier;
      const supplierName = p.supplier_name || 'غير معروف';
      if (!supplierData[supplierId]) {
        supplierData[supplierId] = { name: supplierName, total: 0, count: 0 };
      }
      supplierData[supplierId].total += toNumber(p.total);
      supplierData[supplierId].count += 1;
    });
    
    return Object.values(supplierData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [purchases]);

  // 4. المشتريات حسب الشهر
  const monthlyPurchases = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      data[key] = 0;
    }
    
    purchases.forEach(p => {
      if (p.order_date) {
        const date = new Date(p.order_date);
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (data[key] !== undefined) {
          data[key] += toNumber(p.total);
        }
      }
    });
    
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [purchases]);

  // 5. المشتريات حسب اليوم (آخر 30 يوم)
  const dailyPurchases = useMemo(() => {
    const now = new Date();
    const data: Record<string, number> = {};
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      data[key] = 0;
    }
    
    purchases.forEach(p => {
      if (p.order_date) {
        const date = new Date(p.order_date).toISOString().split('T')[0];
        if (data[date] !== undefined) {
          data[date] += toNumber(p.total);
        }
      }
    });
    
    return Object.entries(data).map(([date, value]) => ({
      date: date.substring(5),
      purchases: value,
    }));
  }, [purchases]);

  // 6. الطلبات المستلمة متأخرة
  const overdueOrders = useMemo(() => {
    const now = new Date();
    return purchases.filter(p => {
      if (!p.expected_date) return false;
      const expectedDate = new Date(p.expected_date);
      return expectedDate < now && p.status !== 'received' && p.status !== 'cancelled';
    });
  }, [purchases]);

  const handleDelete = async () => {
    if (!purchaseToDelete) return;
    await deletePurchase.mutateAsync(purchaseToDelete.id);
    setDeleteDialogOpen(false);
    setPurchaseToDelete(null);
    refetch();
  };

  const openDeleteDialog = (purchase: any) => {
    setPurchaseToDelete(purchase);
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل المشتريات</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold">المشتريات</h1>
          <p className="text-gray-500 text-sm">إدارة أوامر الشراء وتحليل المشتريات</p>
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
                أمر شراء جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء أمر شراء جديد</DialogTitle>
                <DialogDescription>أدخل بيانات أمر الشراء</DialogDescription>
              </DialogHeader>
              {/* يمكن إضافة نموذج إنشاء أمر شراء هنا */}
              <p className="text-center text-gray-500 py-8">نموذج إنشاء أمر شراء قيد التطوير</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 📊 بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الأوامر</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تم الاستلام</p>
                <p className="text-2xl font-bold text-green-600">{receivedOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-purple-600">{totalAmount.toFixed(2)} ج.م</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
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
            اتجاه المشتريات
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Building2 className="w-4 h-4" />
            أفضل الموردين
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            حالة الطلبات
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            متأخرة
          </TabsTrigger>
        </TabsList>

        {/* التبويب 1: نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* المشتريات اليومية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Activity className="w-5 h-5" />
                  المشتريات اليومية
                </CardTitle>
                <CardDescription>آخر 30 يوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {dailyPurchases.length > 0 && dailyPurchases.some(d => d.purchases > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyPurchases}>
                        <defs>
                          <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} tickLine={false} interval={4} />
                        <YAxis fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="purchases" stroke="#8b5cf6" strokeWidth={2} fill="url(#purchasesGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات مشتريات</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* المشتريات الشهرية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Calendar className="w-5 h-5" />
                  المشتريات الشهرية
                </CardTitle>
                <CardDescription>آخر 12 شهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {monthlyPurchases.length > 0 && monthlyPurchases.some(m => m.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyPurchases}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={9} tickLine={false} interval={1} />
                        <YAxis fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                          {monthlyPurchases.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات مشتريات</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* توزيع الحالات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <PieChartIcon className="w-5 h-5" />
                توزيع الطلبات حسب الحالة
              </CardTitle>
              <CardDescription>حالة جميع أوامر الشراء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[200px]">
                  {statusDistribution.some(s => s.value > 0) ? (
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 2: اتجاه المشتريات */}
        <TabsContent value="trend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <TrendingUp className="w-5 h-5" />
                اتجاه المشتريات
              </CardTitle>
              <CardDescription>تطور المشتريات خلال آخر 30 يوم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dailyPurchases.length > 0 && dailyPurchases.some(d => d.purchases > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPurchases}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} interval={3} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="purchases" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>لا توجد بيانات مشتريات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 3: أفضل الموردين */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Award className="w-5 h-5" />
                أفضل الموردين
              </CardTitle>
              <CardDescription>الموردين الأكثر تعاملاً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSuppliers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  topSuppliers.map((supplier, index) => {
                    const maxTotal = topSuppliers[0]?.total || 1;
                    const percentage = (supplier.total / maxTotal) * 100;
                    
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
                              <p className="text-sm font-medium">{supplier.name}</p>
                              <p className="text-xs text-muted-foreground">{supplier.count} طلبية</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{supplier.total.toFixed(2)} ج.م</p>
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

        {/* التبويب 4: حالة الطلبات */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع الطلبات حسب الحالة
                </CardTitle>
                <CardDescription>حالة جميع أوامر الشراء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {statusDistribution.some(s => s.value > 0) ? (
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5" />
                  تفاصيل الحالات
                </CardTitle>
                <CardDescription>عدد الطلبات حسب الحالة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusDistribution.map((item, index) => {
                    const statusOrders = purchases.filter(p => p.status === item.status);
                    const total = statusOrders.reduce((sum, p) => sum + toNumber(p.total), 0);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.value} طلبية</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{total.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* التبويب 5: الطلبات المتأخرة */}
        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Clock className="w-5 h-5" />
                الطلبات المتأخرة
              </CardTitle>
              <CardDescription>الطلبات التي تجاوزت تاريخ الاستلام المتوقع</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>لا توجد طلبات متأخرة!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overdueOrders.map((order) => {
                    const daysOverdue = Math.floor(
                      (new Date().getTime() - new Date(order.expected_date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{order.order_number}</p>
                            <Badge className="bg-red-500">متأخرة</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{order.supplier_name}</p>
                          <p className="text-xs text-red-500">متأخرة {daysOverdue} يوم</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">
                            {toNumber(order.total).toFixed(2)} ج.م
                          </p>
                          <p className="text-xs text-muted-foreground">
                            تاريخ الاستلام: {new Date(order.expected_date).toLocaleDateString('ar-EG')}
                          </p>
                          <Button variant="ghost" size="sm" className="text-blue-500">
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
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
            placeholder="بحث عن أمر شراء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{purchases.length} أمر شراء</span>
      </div>

      {/* 📋 قائمة أوامر الشراء */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة أوامر الشراء</CardTitle>
          <CardDescription>عرض جميع أوامر الشراء في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الأمر</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد أوامر شراء
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase: any, index: number) => {
                  const total = toNumber(purchase.total);
                  
                  return (
                    <motion.tr
                      key={purchase.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">{purchase.order_number || '-'}</TableCell>
                      <TableCell>{purchase.supplier_name || purchase.supplier?.name || '-'}</TableCell>
                      <TableCell>{purchase.order_date ? new Date(purchase.order_date).toLocaleDateString('ar-EG') : '-'}</TableCell>
                      <TableCell className="font-bold text-purple-600">{total.toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        <Badge className={statusColors[purchase.status] || 'bg-gray-500'}>
                          {statusLabels[purchase.status] || purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/purchases/${purchase.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => openDeleteDialog(purchase)}
                            title="حذف"
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
            <AlertDialogTitle>هل أنت متأكد من حذف أمر الشراء؟</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseToDelete && (
                <>
                  <p><strong>الأمر:</strong> {purchaseToDelete.order_number}</p>
                  <p><strong>المورد:</strong> {purchaseToDelete.supplier_name}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف الأمر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}