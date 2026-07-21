// frontend/app/customers/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
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
import { CustomerForm } from '@/components/forms/CustomerForm';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Printer,
  Users,
  Star,
  Ban,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Crown,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Calendar,
  UserMinus,
  Activity,
  Target,
  Brain,
  Layers,
  Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

// ============================================
// ✅ Types
// ============================================
interface Customer {
  id: string;
  name: string;
  name_ar?: string;
  phone: string;
  email?: string;
  address?: string;
  balance: string | number;
  credit_limit?: string | number;
  is_active: boolean;
  is_vip: boolean;
  total_purchases?: string | number;
  total_invoices?: number;
  outstanding_balance?: string | number;
  total_paid?: string | number;
  notes?: string;
  tax_number?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
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

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: customersData, isLoading, error, refetch } = useCustomers({ search });
  const deleteCustomer = useDeleteCustomer();

  // ✅ تأكد من أن customers هي مصفوفة
  const customers: Customer[] = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  // ============================================
  // 📊 تحليلات العملاء (محسوبة محلياً)
  // ============================================

  // العملاء المميزين (VIP)
  const vipCustomers = customers.filter((c: Customer) => c.is_vip && c.is_active);
  
  // العملاء العاديين
  const regularCustomers = customers.filter((c: Customer) => !c.is_vip && c.is_active);
  
  // العملاء المحظورين
  const blockedCustomers = customers.filter((c: Customer) => !c.is_active);
  
  // العملاء الذين عليهم أقساط
  const customersWithDebt = customers.filter((c: Customer) => toNumber(c.balance) < 0);
  
  // العملاء الذين لديهم رصيد إيجابي
  const customersWithCredit = customers.filter((c: Customer) => toNumber(c.balance) > 0);

  // العملاء الأكثر تفاعل
  const topInteractive = useMemo(() => {
    return [...customers]
      .filter((c: Customer) => c.is_active)
      .sort((a: Customer, b: Customer) => toNumber(b.total_purchases) - toNumber(a.total_purchases))
      .slice(0, 10);
  }, [customers]);

  // العملاء الأقل تفاعل
  const leastInteractive = useMemo(() => {
    return [...customers]
      .filter((c: Customer) => c.is_active)
      .sort((a: Customer, b: Customer) => toNumber(a.total_purchases) - toNumber(b.total_purchases))
      .slice(0, 10);
  }, [customers]);

  // العملاء غير النشطين (لم يشتروا منذ فترة)
  const inactiveCustomers = useMemo(() => {
    return customers
      .filter((c: Customer) => c.is_active)
      .filter((c: Customer) => {
        if (!c.updated_at) return false;
        const lastUpdate = new Date(c.updated_at);
        const daysDiff = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 30;
      })
      .slice(0, 10);
  }, [customers]);

  // العملاء الأكثر ولاءً (أكبر عدد فواتير)
  const loyalCustomers = useMemo(() => {
    return [...customers]
      .filter((c: Customer) => c.is_active)
      .sort((a: Customer, b: Customer) => (b.total_invoices || 0) - (a.total_invoices || 0))
      .slice(0, 10);
  }, [customers]);

  // ============================================
  // 📊 إحصائيات
  // ============================================
  
  const totalCustomers = customers.length;
  const totalVIP = vipCustomers.length;
  const totalRegular = regularCustomers.length;
  const totalBlocked = blockedCustomers.length;
  const totalWithDebt = customersWithDebt.length;
  const totalWithCredit = customersWithCredit.length;
  const totalDebt = customersWithDebt.reduce((sum, c) => sum + toNumber(c.balance), 0);
  const avgSpending = customers.length > 0 
    ? customers.reduce((sum, c) => sum + toNumber(c.total_purchases), 0) / customers.length 
    : 0;

  // ✅ بيانات الرسم البياني
  const pieData = [
    { name: 'مميزين (VIP)', value: totalVIP },
    { name: 'عاديين', value: totalRegular },
    { name: 'محظورين', value: totalBlocked },
  ];

  const debtData = customersWithDebt.slice(0, 10).map((c: Customer) => ({
    name: c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name,
    debt: Math.abs(toNumber(c.balance)),
  }));

  // بيانات مقارنة VIP
  const vipComparison = useMemo(() => {
    const vip = customers.filter((c: Customer) => c.is_vip && c.is_active);
    const regular = customers.filter((c: Customer) => !c.is_vip && c.is_active);
    
    const avgVipPurchase = vip.length > 0 
      ? vip.reduce((sum, c) => sum + toNumber(c.total_purchases), 0) / vip.length 
      : 0;
    const avgRegularPurchase = regular.length > 0 
      ? regular.reduce((sum, c) => sum + toNumber(c.total_purchases), 0) / regular.length 
      : 0;
    
    const avgVipBalance = vip.length > 0 
      ? vip.reduce((sum, c) => sum + toNumber(c.balance), 0) / vip.length 
      : 0;
    const avgRegularBalance = regular.length > 0 
      ? regular.reduce((sum, c) => sum + toNumber(c.balance), 0) / regular.length 
      : 0;

    return {
      vipCount: vip.length,
      regularCount: regular.length,
      avgVipPurchase,
      avgRegularPurchase,
      avgVipBalance,
      avgRegularBalance,
      vipTotalPurchases: vip.reduce((sum, c) => sum + toNumber(c.total_purchases), 0),
      regularTotalPurchases: regular.reduce((sum, c) => sum + toNumber(c.total_purchases), 0),
    };
  }, [customers]);

  const radarData = [
    { subject: 'متوسط المشتريات', VIP: vipComparison.avgVipPurchase || 0, Regular: vipComparison.avgRegularPurchase || 0 },
    { subject: 'متوسط الرصيد', VIP: Math.abs(vipComparison.avgVipBalance || 0), Regular: Math.abs(vipComparison.avgRegularBalance || 0) },
    { subject: 'عدد العملاء', VIP: vipComparison.vipCount || 0, Regular: vipComparison.regularCount || 0 },
    { subject: 'إجمالي المشتريات', VIP: vipComparison.vipTotalPurchases || 0, Regular: vipComparison.regularTotalPurchases || 0 },
  ];

  // مستوى الإنفاق
  const spendingLevels = useMemo(() => {
    const levels: Record<string, number> = {
      'منخفض (0-500)': 0,
      'متوسط (501-2000)': 0,
      'مرتفع (2001-5000)': 0,
      'ممتاز (>5000)': 0,
    };
    
    customers.forEach((c: Customer) => {
      const total = toNumber(c.total_purchases);
      if (total <= 500) levels['منخفض (0-500)']++;
      else if (total <= 2000) levels['متوسط (501-2000)']++;
      else if (total <= 5000) levels['مرتفع (2001-5000)']++;
      else levels['ممتاز (>5000)']++;
    });
    
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [customers]);

  // توزيع حسب المدينة
  const cityDistribution = useMemo(() => {
    const cities: Record<string, number> = {};
    customers.forEach((c: Customer) => {
      if (c.address) {
        const city = c.address.split(',')[0]?.trim() || 'غير محدد';
        cities[city] = (cities[city] || 0) + 1;
      } else {
        cities['غير محدد'] = (cities['غير محدد'] || 0) + 1;
      }
    });
    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [customers]);

  // التسجيل حسب الشهر
  const registrationData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data: Record<string, number> = {};
    
    // آخر 6 أشهر
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      data[key] = 0;
    }
    
    customers.forEach((c: Customer) => {
      if (c.created_at) {
        const date = new Date(c.created_at);
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (data[key] !== undefined) {
          data[key]++;
        }
      }
    });
    
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [customers]);

  // ============================================
  // دوال المعالجة
  // ============================================

  const handleDelete = async () => {
    if (!customerToDelete) return;
    await deleteCustomer.mutateAsync(customerToDelete.id);
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
    refetch();
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setCustomerToEdit(customer);
    setEditKey(prev => prev + 1);
    setIsEditDialogOpen(true);
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل العملاء</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold">العملاء</h1>
          <p className="text-gray-500 text-sm">إدارة جميع العملاء في المتجر</p>
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
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>أدخل معلومات العميل الجديد</DialogDescription>
              </DialogHeader>
              <CustomerForm 
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
                <p className="text-sm text-gray-500">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مميزين (VIP)</p>
                <p className="text-2xl font-bold text-amber-600">{totalVIP}</p>
              </div>
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">محظورين</p>
                <p className="text-2xl font-bold text-red-600">{totalBlocked}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">عليهم أقساط</p>
                <p className="text-2xl font-bold text-orange-600">{totalWithDebt}</p>
                <p className="text-xs text-orange-500">إجمالي: {Math.abs(totalDebt).toFixed(2)} ج.م</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">لديهم رصيد</p>
                <p className="text-2xl font-bold text-green-600">{totalWithCredit}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">متوسط الإنفاق</p>
                <p className="text-2xl font-bold text-purple-600">{avgSpending.toFixed(2)} ج.م</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
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
          <TabsTrigger value="top" className="gap-2">
            <Flame className="w-4 h-4" />
            الأكثر تفاعل
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-2">
            <UserMinus className="w-4 h-4" />
            غير نشطين
          </TabsTrigger>
          <TabsTrigger value="loyal" className="gap-2">
            <Star className="w-4 h-4" />
            الأكثر ولاءً
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Layers className="w-4 h-4" />
            مقارنة VIP
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <MapPin className="w-4 h-4" />
            التوزيع
          </TabsTrigger>
        </TabsList>

        {/* التبويب 1: نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع العملاء
                </CardTitle>
                <CardDescription>نسبة العملاء المميزين والعاديين والمحظورين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => {
                          // ✅ التحقق من أن percent ليس undefined
                          const safePercent = percent ?? 0;
                          return `${name} ${(safePercent * 100).toFixed(0)}%`;
                        }}
                      >
                        {pieData.map((entry, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <DollarSign className="w-5 h-5" />
                  العملاء الأكثر ديوناً
                </CardTitle>
                <CardDescription>أعلى 10 عملاء من حيث المديونية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {debtData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد ديون</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={debtData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} />
                        <YAxis fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="debt" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Target className="w-5 h-5" />
                توزيع العملاء حسب مستوى الإنفاق
              </CardTitle>
              <CardDescription>تصنيف العملاء حسب إجمالي المشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingLevels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} />
                    <YAxis fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {spendingLevels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 2: الأكثر تفاعل */}
        <TabsContent value="top" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Flame className="w-5 h-5" />
                العملاء الأكثر تفاعل
              </CardTitle>
              <CardDescription>العملاء الأكثر نشاطاً في المشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topInteractive.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  topInteractive.slice(0, 10).map((customer: Customer, index: number) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
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
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {toNumber(customer.total_purchases).toFixed(2)} ج.م
                        </p>
                        <p className="text-xs text-muted-foreground">{customer.total_invoices || 0} فاتورة</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 3: غير نشطين */}
        <TabsContent value="inactive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <UserMinus className="w-5 h-5" />
                العملاء غير النشطين
              </CardTitle>
              <CardDescription>عملاء لم يقوموا بأي عملية شراء منذ فترة طويلة</CardDescription>
            </CardHeader>
            <CardContent>
              {inactiveCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>جميع العملاء نشطون!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inactiveCustomers.map((customer: Customer, index: number) => {
                    const daysInactive = customer.updated_at 
                      ? Math.floor((new Date().getTime() - new Date(customer.updated_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{daysInactive} يوم</p>
                          <p className="text-xs text-muted-foreground">بدون نشاط</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 4: الأكثر ولاءً */}
        <TabsContent value="loyal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Star className="w-5 h-5" />
                العملاء الأكثر ولاءً
              </CardTitle>
              <CardDescription>العملاء الذين لديهم أكبر عدد من الفواتير</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyalCustomers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  loyalCustomers.slice(0, 10).map((customer: Customer, index: number) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
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
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-600">{customer.total_invoices || 0} فاتورة</p>
                        <p className="text-xs text-muted-foreground">{toNumber(customer.total_purchases).toFixed(2)} ج.م</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 5: مقارنة VIP */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Crown className="w-5 h-5" />
                  مقارنة VIP vs عاديين
                </CardTitle>
                <CardDescription>تحليل مقارن بين العملاء المميزين والعاديين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <p className="text-xs text-amber-600">المميزين (VIP)</p>
                      </div>
                      <p className="text-xl font-bold text-amber-700">{totalVIP}</p>
                      <p className="text-xs text-gray-500">متوسط الشراء: {vipComparison.avgVipPurchase.toFixed(2)} ج.م</p>
                      <p className="text-xs text-gray-500">متوسط الرصيد: {vipComparison.avgVipBalance.toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-blue-600">العاديين</p>
                      </div>
                      <p className="text-xl font-bold text-blue-700">{totalRegular}</p>
                      <p className="text-xs text-gray-500">متوسط الشراء: {vipComparison.avgRegularPurchase.toFixed(2)} ج.م</p>
                      <p className="text-xs text-gray-500">متوسط الرصيد: {vipComparison.avgRegularBalance.toFixed(2)} ج.م</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600">إجمالي مشتريات VIP</p>
                      <p className="text-lg font-bold text-green-700">{vipComparison.vipTotalPurchases.toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600">إجمالي مشتريات العاديين</p>
                      <p className="text-lg font-bold text-purple-700">{vipComparison.regularTotalPurchases.toFixed(2)} ج.م</p>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600">نسبة VIP إلى إجمالي العملاء النشطين</p>
                    <p className="text-lg font-bold text-indigo-700">
                      {totalVIP > 0 && totalRegular > 0
                        ? ((totalVIP / (totalVIP + totalRegular)) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${totalVIP > 0 && totalRegular > 0
                            ? (totalVIP / (totalVIP + totalRegular)) * 100
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600">
                  <Brain className="w-5 h-5" />
                  تحليل الأداء (VIP vs عاديين)
                </CardTitle>
                <CardDescription>مقارنة أداء المميزين مقابل العاديين في 4 محاور</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" fontSize={10} />
                      <PolarRadiusAxis fontSize={10} />
                      <Radar name="VIP" dataKey="VIP" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                      <Radar name="Regular" dataKey="Regular" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <Layers className="w-5 h-5" />
                جدول المقارنة التفصيلي
              </CardTitle>
              <CardDescription>مقارنة تفصيلية بين العملاء المميزين والعاديين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2 font-medium">المعيار</th>
                      <th className="text-center p-2 font-medium text-amber-600">VIP</th>
                      <th className="text-center p-2 font-medium text-blue-600">عاديين</th>
                      <th className="text-center p-2 font-medium">الفارق</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">عدد العملاء</td>
                      <td className="text-center p-2 font-bold text-amber-600">{totalVIP}</td>
                      <td className="text-center p-2 font-bold text-blue-600">{totalRegular}</td>
                      <td className="text-center p-2">
                        <span className={totalVIP > totalRegular ? 'text-green-600' : 'text-red-600'}>
                          {totalVIP - totalRegular}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">متوسط المشتريات</td>
                      <td className="text-center p-2 font-bold text-amber-600">{vipComparison.avgVipPurchase.toFixed(2)} ج.م</td>
                      <td className="text-center p-2 font-bold text-blue-600">{vipComparison.avgRegularPurchase.toFixed(2)} ج.م</td>
                      <td className="text-center p-2">
                        <span className={vipComparison.avgVipPurchase > vipComparison.avgRegularPurchase ? 'text-green-600' : 'text-red-600'}>
                          {(vipComparison.avgVipPurchase - vipComparison.avgRegularPurchase).toFixed(2)} ج.م
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">متوسط الرصيد</td>
                      <td className="text-center p-2 font-bold text-amber-600">{vipComparison.avgVipBalance.toFixed(2)} ج.م</td>
                      <td className="text-center p-2 font-bold text-blue-600">{vipComparison.avgRegularBalance.toFixed(2)} ج.م</td>
                      <td className="text-center p-2">
                        <span className={vipComparison.avgVipBalance > vipComparison.avgRegularBalance ? 'text-green-600' : 'text-red-600'}>
                          {(vipComparison.avgVipBalance - vipComparison.avgRegularBalance).toFixed(2)} ج.م
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">إجمالي المشتريات</td>
                      <td className="text-center p-2 font-bold text-amber-600">{vipComparison.vipTotalPurchases.toFixed(2)} ج.م</td>
                      <td className="text-center p-2 font-bold text-blue-600">{vipComparison.regularTotalPurchases.toFixed(2)} ج.م</td>
                      <td className="text-center p-2">
                        <span className={vipComparison.vipTotalPurchases > vipComparison.regularTotalPurchases ? 'text-green-600' : 'text-red-600'}>
                          {(vipComparison.vipTotalPurchases - vipComparison.regularTotalPurchases).toFixed(2)} ج.م
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 6: التوزيع */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <MapPin className="w-5 h-5" />
                  توزيع العملاء حسب المدينة
                </CardTitle>
                <CardDescription>أكثر المدن التي يتواجد فيها العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {cityDistribution.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={11} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Calendar className="w-5 h-5" />
                  العملاء الجدد حسب الشهر
                </CardTitle>
                <CardDescription>عدد العملاء المسجلين في آخر 6 أشهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {registrationData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={registrationData}>
                        <defs>
                          <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} />
                        <YAxis fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#registrationGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 🔍 البحث */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث عن عميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{customers.length} عميل</span>
      </div>

      {/* 📋 قائمة العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>عرض جميع العملاء في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد عملاء
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer: Customer, index: number) => {
                  const balance = toNumber(customer.balance);
                  const isBlocked = !customer.is_active;
                  const isVIP = customer.is_vip;
                  const hasDebt = balance < 0;

                  return (
                    <motion.tr
                      key={customer.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {customer.name}
                          {isVIP && <Star className="w-4 h-4 text-amber-500" />}
                          {isBlocked && <Ban className="w-4 h-4 text-red-500" />}
                          {hasDebt && !isBlocked && <AlertCircle className="w-4 h-4 text-orange-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell className={balance < 0 ? 'text-red-600 font-bold' : balance > 0 ? 'text-green-600' : ''}>
                        {balance.toFixed(2)} ج.م
                      </TableCell>
                      <TableCell>
                        {isVIP ? (
                          <Badge className="bg-amber-500">مميز VIP</Badge>
                        ) : (
                          <Badge variant="secondary">عادي</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isBlocked ? (
                          <Badge variant="destructive">محظور</Badge>
                        ) : (
                          <Badge variant="default">نشط</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/customers/${customer.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-amber-500" onClick={() => openEditDialog(customer)} title="تعديل">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(customer)} title="حذف">
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
            <AlertDialogTitle>هل أنت متأكد من حذف هذا العميل؟</AlertDialogTitle>
            <AlertDialogDescription>
              {customerToDelete && (
                <>
                  <p><strong>العميل:</strong> {customerToDelete.name}</p>
                  <p><strong>الهاتف:</strong> {customerToDelete.phone}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف العميل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog التعديل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل العميل</DialogTitle>
            <DialogDescription>تعديل معلومات العميل</DialogDescription>
          </DialogHeader>
          {customerToEdit && (
            <CustomerForm 
              key={editKey}
              initialData={customerToEdit}
              isEditing={true}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setCustomerToEdit(null);
                refetch();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}