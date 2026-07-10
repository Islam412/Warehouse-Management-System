// frontend/app/inventory/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useStocks, useLowStock, useWarehouses } from '@/hooks/useInventory';
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
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
  Printer,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Brain,
  Layers,
  Flame,
  Zap,
  Sparkles,
  Gauge,
  Ruler,
  Palette,
  Weight,
  Grid3x3,
  List,
  Filter,
  ArrowUp,
  ArrowDown,
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

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stocksData, isLoading, error, refetch } = useStocks({ search });
  const { data: lowStockData } = useLowStock();
  const { data: productsData } = useProducts();
  const { data: warehousesData } = useWarehouses();

  const stocks = Array.isArray(stocksData) ? stocksData : 
                  stocksData?.results ? stocksData.results : [];
  
  const products = Array.isArray(productsData) ? productsData : [];
  const warehouses = Array.isArray(warehousesData) ? warehousesData : [];

  // ============================================
  // 📊 تحليلات المخزون
  // ============================================

  // 1. المواد المتاحة (كمية > الحد الأدنى)
  const availableItems = useMemo(() => {
    return stocks.filter(s => s.quantity > s.min_quantity && s.quantity > 0);
  }, [stocks]);

  // 2. المواد التي نفدت (كمية = 0)
  const outOfStockItems = useMemo(() => {
    return stocks.filter(s => s.quantity === 0);
  }, [stocks]);

  // 3. المواد التي أوشكت على النفاذ (كمية <= الحد الأدنى و > 0)
  const nearOutOfStockItems = useMemo(() => {
    return stocks.filter(s => s.quantity <= s.min_quantity && s.quantity > 0);
  }, [stocks]);

  // 4. المنتجات حسب الحجم/المقاس
  const productsBySize = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    products.forEach(p => {
      const size = p.size || 'غير محدد';
      if (!grouped[size]) {
        grouped[size] = [];
      }
      grouped[size].push(p);
    });
    
    return Object.entries(grouped)
      .map(([size, items]) => ({
        size,
        count: items.length,
        products: items,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // 5. المنتجات الناقصة (مطلوبة ولكن غير موجودة في المخزون)
  const missingProducts = useMemo(() => {
    const stockProductIds = new Set(stocks.map(s => s.product));
    return products.filter(p => !stockProductIds.has(p.id) && p.is_active);
  }, [products, stocks]);

  // 6. قيمة المخزون الإجمالية
  const totalStockValue = useMemo(() => {
    return stocks.reduce((sum, s) => {
      const product = products.find(p => p.id === s.product);
      return sum + (s.quantity * (product?.purchase_price || 0));
    }, 0);
  }, [stocks, products]);

  // 7. توزيع المخزون حسب الفئة
  const stockByCategory = useMemo(() => {
    const categoryData: Record<string, { quantity: number; value: number }> = {};
    
    stocks.forEach(s => {
      const product = products.find(p => p.id === s.product);
      if (product) {
        const category = product.category_name || 'غير مصنف';
        if (!categoryData[category]) {
          categoryData[category] = { quantity: 0, value: 0 };
        }
        categoryData[category].quantity += s.quantity;
        categoryData[category].value += s.quantity * (product.purchase_price || 0);
      }
    });
    
    return Object.entries(categoryData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [stocks, products]);

  // 8. توزيع المخزون حسب العلامة التجارية
  const stockByBrand = useMemo(() => {
    const brandData: Record<string, { quantity: number; value: number }> = {};
    
    stocks.forEach(s => {
      const product = products.find(p => p.id === s.product);
      if (product) {
        const brand = product.brand_name || 'غير مصنف';
        if (!brandData[brand]) {
          brandData[brand] = { quantity: 0, value: 0 };
        }
        brandData[brand].quantity += s.quantity;
        brandData[brand].value += s.quantity * (product.purchase_price || 0);
      }
    });
    
    return Object.entries(brandData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [stocks, products]);

  // 9. نسبة المخزون المستخدم
  const utilizationRate = useMemo(() => {
    const total = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const used = stocks.reduce((sum, s) => sum + (s.quantity - s.available_quantity), 0);
    return total > 0 ? (used / total) * 100 : 0;
  }, [stocks]);

  // ============================================
  // 10. المنتجات المتشابهة (نفس النوع بأحجام مختلفة)
  // ============================================
  const similarProducts = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    products.forEach(p => {
      // استخراج الاسم الأساسي بدون الحجم
      const baseName = p.name
        .replace(/\d+.*$/, '') // إزالة الأرقام
        .replace(/[\/\-].*$/, '') // إزالة المقاسات
        .trim();
      
      if (baseName.length > 2) {
        if (!grouped[baseName]) {
          grouped[baseName] = [];
        }
        grouped[baseName].push(p);
      }
    });
    
    return Object.entries(grouped)
      .filter(([_, items]) => items.length > 1) // فقط المجموعات التي لها أكثر من منتج
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => (a.size || '').localeCompare(b.size || '')),
      }));
  }, [products]);

  // 11. إحصائيات سريعة
  const totalItems = stocks.length;
  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
  const availableCount = availableItems.length;
  const outOfStockCount = outOfStockItems.length;
  const nearOutOfStockCount = nearOutOfStockItems.length;

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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل المخزون</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={() => refetch()} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المخزون</h1>
          <p className="text-gray-500 text-sm">إدارة المخزون وتحليل المنتجات</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* 📊 بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">متاحة</p>
                <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">أوشكت على النفاذ</p>
                <p className="text-2xl font-bold text-yellow-600">{nearOutOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نفدت</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">قيمة المخزون</p>
                <p className="text-2xl font-bold text-purple-600">{totalStockValue.toFixed(2)} ج.م</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المنتجات الناقصة</p>
                <p className="text-2xl font-bold text-amber-600">{missingProducts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
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
          <TabsTrigger value="available" className="gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            المتاحة
          </TabsTrigger>
          <TabsTrigger value="near-out" className="gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            أوشكت على النفاذ
          </TabsTrigger>
          <TabsTrigger value="out-of-stock" className="gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            نفدت
          </TabsTrigger>
          <TabsTrigger value="by-size" className="gap-2">
            <Ruler className="w-4 h-4" />
            حسب المقاس
          </TabsTrigger>
          <TabsTrigger value="missing" className="gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            الناقصة
          </TabsTrigger>
          <TabsTrigger value="similar" className="gap-2">
            <Layers className="w-4 h-4" />
            المنتجات المتشابهة
          </TabsTrigger>
        </TabsList>

        {/* التبويب 1: نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع المخزون حسب الفئة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع المخزون حسب الفئة
                </CardTitle>
                <CardDescription>قيمة المخزون حسب الفئة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {stockByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stockByCategory.map((entry, index) => (
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

            {/* توزيع المخزون حسب العلامة التجارية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                  توزيع المخزون حسب العلامة
                </CardTitle>
                <CardDescription>قيمة المخزون حسب العلامة التجارية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {stockByBrand.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockByBrand.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={10} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                          {stockByBrand.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد بيانات</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* حالة المخزون */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <Activity className="w-5 h-5" />
                حالة المخزون
              </CardTitle>
              <CardDescription>توزيع المنتجات حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">متاحة</p>
                      <p className="text-2xl font-bold text-green-600">{availableCount}</p>
                      <p className="text-xs text-gray-500">{((availableCount / totalItems) * 100).toFixed(1)}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">أوشكت على النفاذ</p>
                      <p className="text-2xl font-bold text-yellow-600">{nearOutOfStockCount}</p>
                      <p className="text-xs text-gray-500">{((nearOutOfStockCount / totalItems) * 100).toFixed(1)}%</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">نفدت</p>
                      <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                      <p className="text-xs text-gray-500">{((outOfStockCount / totalItems) * 100).toFixed(1)}%</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 2: المواد المتاحة */}
        <TabsContent value="available" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                المواد المتاحة
              </CardTitle>
              <CardDescription>المنتجات الموجودة في المخزون بكميات كافية</CardDescription>
            </CardHeader>
            <CardContent>
              {availableItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد منتجات متاحة</p>
              ) : (
                <div className="space-y-3">
                  {availableItems.map((stock) => {
                    const product = products.find(p => p.id === stock.product);
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border border-green-100 dark:border-green-800/30">
                        <div>
                          <p className="font-medium">{product?.name || 'غير معروف'}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product?.sku || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{stock.quantity}</p>
                          <p className="text-xs text-muted-foreground">الحد الأدنى: {stock.min_quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 3: أوشكت على النفاذ */}
        <TabsContent value="near-out" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                المواد التي أوشكت على النفاذ
              </CardTitle>
              <CardDescription>المنتجات التي وصلت للحد الأدنى أو أقل</CardDescription>
            </CardHeader>
            <CardContent>
              {nearOutOfStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>جميع المنتجات في المخزون الكافي</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearOutOfStockItems.map((stock) => {
                    const product = products.find(p => p.id === stock.product);
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div>
                          <p className="font-medium">{product?.name || 'غير معروف'}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product?.sku || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-600">{stock.quantity}</p>
                          <p className="text-xs text-red-500">⚠️ أقل من الحد الأدنى: {stock.min_quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 4: نفدت */}
        <TabsContent value="out-of-stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                المواد التي نفدت
              </CardTitle>
              <CardDescription>المنتجات التي وصلت كميتها إلى صفر</CardDescription>
            </CardHeader>
            <CardContent>
              {outOfStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>لا توجد منتجات نفدت</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outOfStockItems.map((stock) => {
                    const product = products.find(p => p.id === stock.product);
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div>
                          <p className="font-medium">{product?.name || 'غير معروف'}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product?.sku || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">0</p>
                          <p className="text-xs text-red-500">❌ نفدت الكمية</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 5: حسب المقاس */}
        <TabsContent value="by-size" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Ruler className="w-5 h-5" />
                المنتجات حسب المقاس
              </CardTitle>
              <CardDescription>توزيع المنتجات حسب المقاس/الحجم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productsBySize.map((group) => (
                  <div key={group.size} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg">{group.size}</h4>
                      <Badge>{group.count} منتج</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {group.products.map((product) => {
                        const stock = stocks.find(s => s.product === product.id);
                        return (
                          <div key={product.id} className="p-2 bg-muted/50 rounded-lg flex justify-between items-center">
                            <span className="text-sm">{product.name}</span>
                            <span className={`font-bold ${!stock || stock.quantity === 0 ? 'text-red-500' : stock.quantity <= stock.min_quantity ? 'text-yellow-500' : 'text-green-500'}`}>
                              {stock?.quantity || 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 6: المنتجات الناقصة */}
        <TabsContent value="missing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                المنتجات الناقصة
              </CardTitle>
              <CardDescription>المنتجات المطلوبة ولكن غير موجودة في المخزون</CardDescription>
            </CardHeader>
            <CardContent>
              {missingProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>جميع المنتجات موجودة في المخزون</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missingProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-amber-500">غير متوفر</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التبويب 7: المنتجات المتشابهة */}
        <TabsContent value="similar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Layers className="w-5 h-5" />
                المنتجات المتشابهة
              </CardTitle>
              <CardDescription>منتجات من نفس النوع بأحجام مختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              {similarProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد منتجات متشابهة</p>
              ) : (
                <div className="space-y-6">
                  {similarProducts.map((group) => (
                    <div key={group.name} className="border rounded-lg p-4">
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-500" />
                        {group.name}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {group.items.map((product) => {
                          const stock = stocks.find(s => s.product === product.id);
                          return (
                            <div key={product.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">المقاس: {product.size || 'غير محدد'}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-bold ${!stock || stock.quantity === 0 ? 'text-red-500' : stock.quantity <= stock.min_quantity ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {stock?.quantity || 0}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{product.selling_price} ج.م</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
            placeholder="بحث عن منتج في المخزون..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{stocks.length} منتج في المخزون</span>
      </div>

      {/* 📋 قائمة المخزون */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المخزون</CardTitle>
          <CardDescription>عرض جميع المنتجات في المخزون</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>المخزن</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الحد الأدنى</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد منتجات في المخزون
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock) => {
                  const product = products.find(p => p.id === stock.product);
                  const isOut = stock.quantity === 0;
                  const isLow = stock.quantity <= stock.min_quantity && !isOut;
                  const status = isOut ? 'نفد' : isLow ? 'منخفض' : 'متوفر';
                  const statusColor = isOut ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500';

                  return (
                    <TableRow key={stock.id} className="border-b">
                      <TableCell className="font-medium">{product?.name || 'غير معروف'}</TableCell>
                      <TableCell>{product?.sku || '-'}</TableCell>
                      <TableCell>{stock.warehouse_name || '-'}</TableCell>
                      <TableCell className={isOut ? 'text-red-600 font-bold' : isLow ? 'text-yellow-600 font-bold' : 'text-green-600'}>
                        {stock.quantity}
                      </TableCell>
                      <TableCell>{stock.min_quantity}</TableCell>
                      <TableCell>
                        <Badge className={statusColor}>{status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}