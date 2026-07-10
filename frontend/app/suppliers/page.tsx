// frontend/app/suppliers/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useSuppliers, useDeleteSupplier } from '@/hooks/useSuppliers';
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
import { SupplierForm } from '@/components/forms/SupplierForm';
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
  TrendingUp,
  TrendingDown,
  Award,
  Crown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Brain,
  Layers,
  Flame,
  Building2,
  Package,
  Sparkles,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ArrowUp,
  ArrowDown,
  MapPin,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: suppliersData, isLoading, error, refetch } = useSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  const suppliers = Array.isArray(suppliersData) ? suppliersData : 
                     suppliersData?.results ? suppliersData.results : [];

  // ============================================
  // 📊 تحليلات الموردين المتقدمة
  // ============================================

  // ============================================
  // 1. إحصائيات عامة
  // ============================================
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.is_active).length;
  const totalPurchases = suppliers.reduce((sum, s) => sum + parseFloat(s.total_purchases || 0), 0);
  const avgPurchases = totalSuppliers > 0 ? totalPurchases / totalSuppliers : 0;

  // ============================================
  // 2. الموردين الأكثر طلباً (أعلى مشتريات)
  // ============================================
  const mostDemanded = useMemo(() => {
    return [...suppliers]
      .filter(s => s.is_active)
      .sort((a, b) => parseFloat(b.total_purchases || 0) - parseFloat(a.total_purchases || 0))
      .slice(0, 10);
  }, [suppliers]);

  // ============================================
  // 3. الموردين الأقل طلباً
  // ============================================
  const leastDemanded = useMemo(() => {
    return [...suppliers]
      .filter(s => s.is_active)
      .sort((a, b) => parseFloat(a.total_purchases || 0) - parseFloat(b.total_purchases || 0))
      .slice(0, 10);
  }, [suppliers]);

  // ============================================
  // 4. الموردين المحظورين
  // ============================================
  const blockedSuppliers = suppliers.filter(s => !s.is_active);

  // ============================================
  // 5. الموردين الأكثر ربحية (هامش ربح افتراضي)
  // ============================================
  const mostProfitable = useMemo(() => {
    // محاكاة: الموردين الذين لديهم أعلى رصيد
    return [...suppliers]
      .filter(s => s.is_active)
      .sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0))
      .slice(0, 10);
  }, [suppliers]);

  // ============================================
  // 6. توزيع الموردين حسب المدينة
  // ============================================
  const cityDistribution = useMemo(() => {
    const cities: Record<string, number> = {};
    suppliers.forEach(s => {
      if (s.address) {
        const city = s.address.split(',')[0]?.trim() || 'غير محدد';
        cities[city] = (cities[city] || 0) + 1;
      } else {
        cities['غير محدد'] = (cities['غير محدد'] || 0) + 1;
      }
    });
    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [suppliers]);

  // ============================================
  // 7. حصة السوق (Market Share)
  // ============================================
  const marketShare = useMemo(() => {
    return suppliers
      .filter(s => s.is_active)
      .map(s => ({
        name: s.name,
        value: parseFloat(s.total_purchases || 0),
        percentage: totalPurchases > 0 ? (parseFloat(s.total_purchases || 0) / totalPurchases) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [suppliers, totalPurchases]);

  // ============================================
  // 8. مقارنة الموردين (محاكاة)
  // ============================================
  const supplierComparison = useMemo(() => {
    const topSuppliers = suppliers.filter(s => s.is_active).slice(0, 8);
    return topSuppliers.map((s, index) => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
      demand: Math.min(100, 30 + Math.random() * 70), // محاكاة الطلب
      price: Math.min(100, 20 + Math.random() * 80), // محاكاة السعر
      quality: Math.min(100, 40 + Math.random() * 60), // محاكاة الجودة
      delivery: Math.min(100, 30 + Math.random() * 70), // محاكاة سرعة التوصيل
      service: Math.min(100, 50 + Math.random() * 50), // محاكاة الخدمة
    }));
  }, [suppliers]);

  // ============================================
  // 9. مقارنة المنتجات من كذا شركة (محاكاة)
  // ============================================
  const productComparison = useMemo(() => {
    const products = ['منتج A', 'منتج B', 'منتج C', 'منتج D', 'منتج E'];
    const topSuppliers = suppliers.filter(s => s.is_active).slice(0, 5);
    
    return products.map(product => {
      const supplierData = topSuppliers.map(s => ({
        supplier: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
        price: 50 + Math.random() * 200,
        quality: 40 + Math.random() * 60,
        demand: 30 + Math.random() * 70,
        rating: 3 + Math.random() * 2,
      }));
      return {
        product,
        suppliers: supplierData,
      };
    });
  }, [suppliers]);

  // ============================================
  // دوال المعالجة
  // ============================================

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    await deleteSupplier.mutateAsync(supplierToDelete.id);
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
    refetch();
  };

  const openDeleteDialog = (supplier: any) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (supplier: any) => {
    setSupplierToEdit(supplier);
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل الموردين</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold">الموردين</h1>
          <p className="text-gray-500 text-sm">إدارة جميع الموردين وتحليل السوق</p>
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
                إضافة مورد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة مورد جديد</DialogTitle>
                <DialogDescription>أدخل معلومات المورد الجديد</DialogDescription>
              </DialogHeader>
              <SupplierForm 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الموردين</p>
                <p className="text-2xl font-bold">{totalSuppliers}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نشطين</p>
                <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">محظورين</p>
                <p className="text-2xl font-bold text-red-600">{blockedSuppliers.length}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-purple-600">{totalPurchases.toFixed(2)} ج.م</p>
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
          <TabsTrigger value="most-demand" className="gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            الأكثر طلباً
          </TabsTrigger>
          <TabsTrigger value="least-demand" className="gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            الأقل طلباً
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Layers className="w-4 h-4" />
            مقارنة الموردين
          </TabsTrigger>
          <TabsTrigger value="market-share" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            حصة السوق
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            مقارنة المنتجات
          </TabsTrigger>
        </TabsList>

        {/* التبويب 1: نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع الموردين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع الموردين
                </CardTitle>
                <CardDescription>نسبة الموردين النشطين والمحظورين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'نشطين', value: activeSuppliers },
                          { name: 'محظورين', value: blockedSuppliers.length },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* توزيع حسب المدينة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <MapPin className="w-5 h-5" />
                  توزيع الموردين حسب المدينة
                </CardTitle>
                <CardDescription>أكثر المدن التي يتواجد فيها الموردين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {cityDistribution.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={10} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={60} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* التبويب 2: الأكثر طلباً */}
        <TabsContent value="most-demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Award className="w-5 h-5" />
                الموردين الأكثر طلباً في السوق
              </CardTitle>
              <CardDescription>الموردين الذين لديهم أكبر حجم مشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostDemanded.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  mostDemanded.map((supplier, index) => {
                    const purchases = parseFloat(supplier.total_purchases || 0);
                    const maxPurchase = mostDemanded[0]?.total_purchases || 1;
                    const percentage = (purchases / maxPurchase) * 100;
                    
                    return (
                      <div key={supplier.id} className="space-y-1">
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
                              <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{purchases.toFixed(2)} ج.م</p>
                            <p className="text-xs text-muted-foreground">{(percentage).toFixed(1)}% من الإجمالي</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-1000"
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

        {/* التبويب 3: الأقل طلباً */}
        <TabsContent value="least-demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingDown className="w-5 h-5" />
                الموردين الأقل طلباً في السوق
              </CardTitle>
              <CardDescription>الموردين الذين لديهم أقل حجم مشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leastDemanded.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  leastDemanded.map((supplier, index) => {
                    const purchases = parseFloat(supplier.total_purchases || 0);
                    return (
                      <div key={supplier.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border border-red-100 dark:border-red-800/30">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{purchases.toFixed(2)} ج.م</p>
                          <p className="text-xs text-muted-foreground">منخفض الطلب</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 4: مقارنة الموردين */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Brain className="w-5 h-5" />
                مقارنة الموردين
              </CardTitle>
              <CardDescription>مقارنة الموردين في 5 مجالات: الطلب، السعر، الجودة، التوصيل، الخدمة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={supplierComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" fontSize={10} />
                    <PolarRadiusAxis fontSize={10} domain={[0, 100]} />
                    {supplierComparison.map((s, index) => (
                      <Radar
                        key={index}
                        name={s.name}
                        dataKey="demand"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.1}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* جدول مقارنة الموردين */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <Layers className="w-5 h-5" />
                جدول مقارنة الموردين
              </CardTitle>
              <CardDescription>تقييم الموردين حسب المعايير المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2 font-medium">المورد</th>
                      <th className="text-center p-2 font-medium text-blue-600">الطلب</th>
                      <th className="text-center p-2 font-medium text-orange-600">السعر</th>
                      <th className="text-center p-2 font-medium text-green-600">الجودة</th>
                      <th className="text-center p-2 font-medium text-purple-600">التوصيل</th>
                      <th className="text-center p-2 font-medium text-amber-600">الخدمة</th>
                      <th className="text-center p-2 font-medium">التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierComparison.map((s, index) => {
                      const avg = (s.demand + s.price + s.quality + s.delivery + s.service) / 5;
                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{s.name}</td>
                          <td className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.demand}%` }} />
                              </div>
                              <span className="text-xs">{Math.round(s.demand)}%</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${s.price}%` }} />
                              </div>
                              <span className="text-xs">{Math.round(s.price)}%</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.quality}%` }} />
                              </div>
                              <span className="text-xs">{Math.round(s.quality)}%</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${s.delivery}%` }} />
                              </div>
                              <span className="text-xs">{Math.round(s.delivery)}%</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.service}%` }} />
                              </div>
                              <span className="text-xs">{Math.round(s.service)}%</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <Badge className={avg >= 70 ? 'bg-green-500' : avg >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                              {avg >= 70 ? 'ممتاز' : avg >= 50 ? 'جيد' : 'ضعيف'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 5: حصة السوق */}
        <TabsContent value="market-share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <PieChartIcon className="w-5 h-5" />
                حصة السوق للموردين
              </CardTitle>
              <CardDescription>نسبة كل مورد من إجمالي المشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketShare}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {marketShare.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">تفاصيل حصة السوق</h4>
                  {marketShare.slice(0, 5).map((s, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{s.percentage.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.value.toFixed(2)} ج.م</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 6: مقارنة المنتجات */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Package className="w-5 h-5" />
                مقارنة المنتجات من كذا شركة
              </CardTitle>
              <CardDescription>مقارنة المنتجات من حيث السعر، الجودة، الطلب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {productComparison.map((item, idx) => (
                  <div key={idx} className="border-b pb-6 last:border-b-0">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-500" />
                      {item.product}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {item.suppliers.map((s, sIdx) => (
                        <div key={sIdx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <p className="font-medium text-center mb-3">{s.supplier}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">السعر</span>
                              <span className="font-bold text-orange-600">{s.price.toFixed(2)} ج.م</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">الجودة</span>
                              <div className="flex items-center gap-1">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.quality}%` }} />
                                </div>
                                <span className="text-xs">{Math.round(s.quality)}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">الطلب</span>
                              <div className="flex items-center gap-1">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.demand}%` }} />
                                </div>
                                <span className="text-xs">{Math.round(s.demand)}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">التقييم</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < Math.round(s.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
            placeholder="بحث عن مورد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{suppliers.length} مورد</span>
      </div>

      {/* 📋 قائمة الموردين */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>عرض جميع الموردين في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>المشتريات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد موردين
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier: any, index: number) => {
                  const balance = parseFloat(supplier.balance || 0);
                  const purchases = parseFloat(supplier.total_purchases || 0);
                  const isBlocked = !supplier.is_active;

                  return (
                    <motion.tr
                      key={supplier.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {supplier.name}
                          {purchases > 10000 && <Crown className="w-4 h-4 text-yellow-500" />}
                          {isBlocked && <Ban className="w-4 h-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell className={balance < 0 ? 'text-red-600' : balance > 0 ? 'text-green-600' : ''}>
                        {balance.toFixed(2)} ج.م
                      </TableCell>
                      <TableCell className="text-blue-600 font-bold">{purchases.toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        {isBlocked ? (
                          <Badge variant="destructive">محظور</Badge>
                        ) : (
                          <Badge variant="default">نشط</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/suppliers/${supplier.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-amber-500" onClick={() => openEditDialog(supplier)} title="تعديل">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(supplier)} title="حذف">
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
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المورد؟</AlertDialogTitle>
            <AlertDialogDescription>
              {supplierToDelete && (
                <>
                  <p><strong>المورد:</strong> {supplierToDelete.name}</p>
                  <p><strong>الهاتف:</strong> {supplierToDelete.phone}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف المورد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog التعديل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المورد</DialogTitle>
            <DialogDescription>تعديل معلومات المورد</DialogDescription>
          </DialogHeader>
          {supplierToEdit && (
            <SupplierForm 
              key={editKey}
              initialData={supplierToEdit}
              isEditing={true}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSupplierToEdit(null);
                refetch();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}