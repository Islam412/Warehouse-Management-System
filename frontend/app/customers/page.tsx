// frontend/app/customers/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer, useVIPCustomers, useTopSpenders } from '@/hooks/useCustomers';
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
  UserCheck,
  UserX,
  Award,
  Crown,
  Shield,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Calendar,
  Clock,
  UserPlus,
  UserMinus,
  Activity,
  Zap,
  Target,
  Brain,
  FileText,
  Layers,
  Grid3x3,
  List,
  Sparkles,
  Flame
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: customersData, isLoading, error, refetch } = useCustomers({ search });
  const { data: vipData } = useVIPCustomers();
  const { data: topSpenders } = useTopSpenders();
  const deleteCustomer = useDeleteCustomer();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  // ============================================
  // 📊 تحليلات العملاء المتقدمة
  // ============================================

  // 1. العملاء المميزين (VIP)
  const vipCustomers = customers.filter(c => c.is_vip && c.is_active);
  
  // 2. العملاء العاديين
  const regularCustomers = customers.filter(c => !c.is_vip && c.is_active);
  
  // 3. العملاء المحظورين
  const blockedCustomers = customers.filter(c => !c.is_active);
  
  // 4. العملاء الذين عليهم أقساط (رصيد سالب)
  const customersWithDebt = customers.filter(c => parseFloat(c.balance || 0) < 0);
  
  // 5. العملاء الذين لديهم رصيد إيجابي
  const customersWithCredit = customers.filter(c => parseFloat(c.balance || 0) > 0);

  // ============================================
  // 📍 توزيع العملاء حسب المدينة
  // ============================================
  const cityDistribution = useMemo(() => {
    const cities: Record<string, number> = {};
    customers.forEach(c => {
      if (c.address) {
        // استخراج المدينة من العنوان
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

  // ============================================
  // 📅 العملاء حسب تاريخ التسجيل
  // ============================================
  const registrationData = useMemo(() => {
    const now = new Date();
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data: Record<string, number> = {};
    
    // آخر 6 أشهر
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      data[key] = 0;
    }
    
    customers.forEach(c => {
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
  // 🏆 العملاء الأكثر تفاعل (آخر 30 يوم)
  // ============================================
  const topInteractiveLast30 = useMemo(() => {
    return [...customers]
      .filter(c => c.is_active)
      .sort((a, b) => parseFloat(b.total_purchases || 0) - parseFloat(a.total_purchases || 0))
      .slice(0, 10);
  }, [customers]);

  // ============================================
  // ⏰ العملاء غير النشطين (لم يشتروا منذ فترة)
  // ============================================
  const inactiveCustomers = useMemo(() => {
    const now = new Date();
    return customers
      .filter(c => c.is_active)
      .filter(c => {
        if (!c.updated_at) return true;
        const lastUpdate = new Date(c.updated_at);
        const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 30; // أكثر من 30 يوم بدون نشاط
      })
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10);
  }, [customers]);

  // ============================================
  // 📊 مقارنة VIP vs عاديين
  // ============================================
  const vipComparison = useMemo(() => {
    const vip = customers.filter(c => c.is_vip && c.is_active);
    const regular = customers.filter(c => !c.is_vip && c.is_active);
    
    const avgVipPurchase = vip.length > 0 
      ? vip.reduce((sum, c) => sum + parseFloat(c.total_purchases || 0), 0) / vip.length 
      : 0;
    const avgRegularPurchase = regular.length > 0 
      ? regular.reduce((sum, c) => sum + parseFloat(c.total_purchases || 0), 0) / regular.length 
      : 0;
    
    const avgVipBalance = vip.length > 0 
      ? vip.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0) / vip.length 
      : 0;
    const avgRegularBalance = regular.length > 0 
      ? regular.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0) / regular.length 
      : 0;

    return {
      vipCount: vip.length,
      regularCount: regular.length,
      avgVipPurchase,
      avgRegularPurchase,
      avgVipBalance,
      avgRegularBalance,
      vipTotalPurchases: vip.reduce((sum, c) => sum + parseFloat(c.total_purchases || 0), 0),
      regularTotalPurchases: regular.reduce((sum, c) => sum + parseFloat(c.total_purchases || 0), 0),
    };
  }, [customers]);

  // ============================================
  // 📈 توزيع العملاء حسب مستوى الإنفاق
  // ============================================
  const spendingLevels = useMemo(() => {
    const levels = {
      'منخفض (0-500)': 0,
      'متوسط (501-2000)': 0,
      'مرتفع (2001-5000)': 0,
      'ممتاز (>5000)': 0,
    };
    
    customers.forEach(c => {
      const total = parseFloat(c.total_purchases || 0);
      if (total <= 500) levels['منخفض (0-500)']++;
      else if (total <= 2000) levels['متوسط (501-2000)']++;
      else if (total <= 5000) levels['مرتفع (2001-5000)']++;
      else levels['ممتاز (>5000)']++;
    });
    
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [customers]);

  // ============================================
  // 🔥 العملاء الأكثر ولاءً (عدد الفواتير)
  // ============================================
  const loyalCustomers = useMemo(() => {
    return [...customers]
      .filter(c => c.is_active)
      .sort((a, b) => (b.total_invoices || 0) - (a.total_invoices || 0))
      .slice(0, 10);
  }, [customers]);

  // ============================================
  // 📊 إحصائيات عامة محسنة
  // ============================================
  const totalCustomers = customers.length;
  const totalVIP = vipCustomers.length;
  const totalRegular = regularCustomers.length;
  const totalBlocked = blockedCustomers.length;
  const totalWithDebt = customersWithDebt.length;
  const totalWithCredit = customersWithCredit.length;
  const totalDebt = customersWithDebt.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);
  const avgSpending = customers.length > 0 
    ? customers.reduce((sum, c) => sum + parseFloat(c.total_purchases || 0), 0) / customers.length 
    : 0;
  const avgBalance = customers.length > 0 
    ? customers.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0) / customers.length 
    : 0;

  // بيانات الرسم البياني لتوزيع العملاء
  const distributionData = [
    { name: 'مميزين (VIP)', value: totalVIP },
    { name: 'عاديين', value: totalRegular },
    { name: 'محظورين', value: totalBlocked },
  ];

  // بيانات الرسم البياني للأقساط
  const debtData = customersWithDebt.slice(0, 10).map(c => ({
    name: c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name,
    debt: Math.abs(parseFloat(c.balance || 0)),
  }));

  // بيانات مقارنة VIP vs عاديين للرادار
  const radarData = [
    { subject: 'متوسط المشتريات', VIP: vipComparison.avgVipPurchase, Regular: vipComparison.avgRegularPurchase },
    { subject: 'متوسط الرصيد', VIP: Math.abs(vipComparison.avgVipBalance), Regular: Math.abs(vipComparison.avgRegularBalance) },
    { subject: 'عدد العملاء', VIP: vipComparison.vipCount, Regular: vipComparison.regularCount },
    { subject: 'إجمالي المشتريات', VIP: vipComparison.vipTotalPurchases, Regular: vipComparison.regularTotalPurchases },
  ];

  const handleDelete = async () => {
    if (!customerToDelete) return;
    await deleteCustomer.mutateAsync(customerToDelete.id);
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
    refetch();
  };

  const openDeleteDialog = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (customer: any) => {
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

      {/* 📊 بطاقات الإحصائيات المحسنة */}
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

      {/* 📊 التبويبات للتحليلات المتقدمة */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            توزيع العملاء
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Layers className="w-4 h-4" />
            مقارنة VIP
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
        </TabsList>

        {/* التبويب 1: نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع العملاء */}
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
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {distributionData.map((entry, index) => (
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

            {/* العملاء الأكثر ديوناً */}
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

          {/* مستوى الإنفاق */}
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

        {/* التبويب 2: توزيع العملاء */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع حسب المدينة */}
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

            {/* التسجيل حسب الشهر */}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* التبويب 3: مقارنة VIP */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* بطاقات مقارنة */}
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
                      <p className="text-xs text-amber-600">المميزين (VIP)</p>
                      <p className="text-xl font-bold text-amber-700">{vipComparison.vipCount}</p>
                      <p className="text-xs text-gray-500">متوسط الشراء: {vipComparison.avgVipPurchase.toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600">العاديين</p>
                      <p className="text-xl font-bold text-blue-700">{vipComparison.regularCount}</p>
                      <p className="text-xs text-gray-500">متوسط الشراء: {vipComparison.avgRegularPurchase.toFixed(2)} ج.م</p>
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
                </div>
              </CardContent>
            </Card>

            {/* رسم بياني رادار */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600">
                  <Brain className="w-5 h-5" />
                  تحليل الأداء (VIP vs عاديين)
                </CardTitle>
                <CardDescription>مقارنة أداء المميزين مقابل العاديين</CardDescription>
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
        </TabsContent>

        {/* التبويب 4: الأكثر تفاعل */}
        <TabsContent value="top" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Flame className="w-5 h-5" />
                العملاء الأكثر تفاعل (آخر 30 يوم)
              </CardTitle>
              <CardDescription>العملاء الأكثر نشاطاً في الفترة الأخيرة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topInteractiveLast30.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  topInteractiveLast30.map((customer, index) => (
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
                          {parseFloat(customer.total_purchases || 0).toFixed(2)} ج.م
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

        {/* التبويب 5: غير نشطين */}
        <TabsContent value="inactive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <UserMinus className="w-5 h-5" />
                العملاء غير النشطين
              </CardTitle>
              <CardDescription>عملاء لم يقوموا بأي عملية شراء منذ أكثر من 30 يوم</CardDescription>
            </CardHeader>
            <CardContent>
              {inactiveCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>جميع العملاء نشطون!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inactiveCustomers.map((customer, index) => {
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

        {/* التبويب 6: الأكثر ولاءً */}
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
                  loyalCustomers.map((customer, index) => (
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
                        <p className="text-xs text-muted-foreground">{parseFloat(customer.total_purchases || 0).toFixed(2)} ج.م</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
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
                customers.map((customer: any, index: number) => {
                  const balance = parseFloat(customer.balance || 0);
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
                          <Link href={`/customer/${customer.id}`}>
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