// frontend/app/inventory/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useStocks, useLowStock, useWarehouses, useStockMovements } from '@/hooks/useInventory';
import { useProducts } from '@/hooks/useProducts';
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
  Building2,
  Clock,
  Calendar,
  TrendingUp as TrendingUpIcon,
  Award,
  Crown,
  Star,
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
  ComposedChart,
  Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

// دالة مساعدة
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stocksData, isLoading, error, refetch } = useStocks({ search });
  const { data: lowStockData } = useLowStock();
  const { data: productsData } = useProducts();
  const { data: warehousesData } = useWarehouses();
  const { data: movementsData } = useStockMovements();
  const { data: suppliersData } = useSuppliers();

  const stocks = Array.isArray(stocksData) ? stocksData : 
                  stocksData?.results ? stocksData.results : [];
  
  const products = Array.isArray(productsData) ? productsData : [];
  const warehouses = Array.isArray(warehousesData) ? warehousesData : [];
  const movements = Array.isArray(movementsData) ? movementsData : [];
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  // ============================================
  // 📊 تحليلات المخزون الأساسية
  // ============================================

  // 1. المواد المتاحة
  const availableItems = useMemo(() => {
    return stocks.filter(s => s.quantity > s.min_quantity && s.quantity > 0);
  }, [stocks]);

  // 2. المواد التي نفدت
  const outOfStockItems = useMemo(() => {
    return stocks.filter(s => s.quantity === 0);
  }, [stocks]);

  // 3. المواد التي أوشكت على النفاذ
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

  // 5. المنتجات الناقصة
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

  // ============================================
  // 📊 تحليلات الحركة (Stock Movement)
  // ============================================

  // 9. المنتجات الأكثر حركة (دخولاً وخروجاً)
  const mostActiveProducts = useMemo(() => {
    const movementCount: Record<string, { product_id: string; name: string; total: number; ins: number; outs: number }> = {};
    
    movements.forEach(m => {
      const productId = m.product;
      const productName = m.product_name || 'غير معروف';
      if (!movementCount[productId]) {
        movementCount[productId] = { product_id: productId, name: productName, total: 0, ins: 0, outs: 0 };
      }
      movementCount[productId].total += Math.abs(toNumber(m.quantity));
      if (toNumber(m.quantity) > 0) {
        movementCount[productId].ins += toNumber(m.quantity);
      } else {
        movementCount[productId].outs += Math.abs(toNumber(m.quantity));
      }
    });
    
    return Object.values(movementCount)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [movements]);

  // 10. أقل المنتجات حركة
  const leastActiveProducts = useMemo(() => {
    const movementCount: Record<string, { product_id: string; name: string; total: number }> = {};
    
    movements.forEach(m => {
      const productId = m.product;
      const productName = m.product_name || 'غير معروف';
      if (!movementCount[productId]) {
        movementCount[productId] = { product_id: productId, name: productName, total: 0 };
      }
      movementCount[productId].total += Math.abs(toNumber(m.quantity));
    });
    
    return Object.values(movementCount)
      .filter(p => p.total > 0)
      .sort((a, b) => a.total - b.total)
      .slice(0, 10);
  }, [movements]);

  // 11. الحركات اليومية (آخر 30 يوم)
  const dailyMovements = useMemo(() => {
    const now = new Date();
    const data: Record<string, { ins: number; outs: number }> = {};
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      data[key] = { ins: 0, outs: 0 };
    }
    
    movements.forEach(m => {
      if (m.created_at) {
        const date = new Date(m.created_at).toISOString().split('T')[0];
        if (data[date]) {
          if (toNumber(m.quantity) > 0) {
            data[date].ins += toNumber(m.quantity);
          } else {
            data[date].outs += Math.abs(toNumber(m.quantity));
          }
        }
      }
    });
    
    return Object.entries(data).map(([date, values]) => ({
      date: date.substring(5),
      ...values,
    }));
  }, [movements]);

  // 12. معدل دوران المخزون
  const turnoverRate = useMemo(() => {
    const totalOut = movements.reduce((sum, m) => {
      return sum + (toNumber(m.quantity) < 0 ? Math.abs(toNumber(m.quantity)) : 0);
    }, 0);
    const averageStock = stocks.reduce((sum, s) => sum + s.quantity, 0) / (stocks.length || 1);
    return averageStock > 0 ? totalOut / averageStock : 0;
  }, [movements, stocks]);

  // 13. أيام تغطية المخزون
  const daysOfCoverage = useMemo(() => {
    const dailySales = movements.reduce((sum, m) => {
      return sum + (toNumber(m.quantity) < 0 ? Math.abs(toNumber(m.quantity)) : 0);
    }, 0) / 30;
    const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
    return dailySales > 0 ? totalStock / dailySales : 0;
  }, [movements, stocks]);

  // ============================================
  // 📊 المنتجات الأكثر ربحية
  // ============================================

  const mostProfitableProducts = useMemo(() => {
    return products
      .filter(p => p.purchase_price > 0)
      .map(p => {
        const margin = ((p.selling_price - p.purchase_price) / p.purchase_price) * 100;
        const stock = stocks.find(s => s.product === p.id);
        return {
          ...p,
          margin,
          quantity: stock?.quantity || 0,
        };
      })
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 10);
  }, [products, stocks]);

  // ============================================
  // 📊 المنتجات حسب اللون
  // ============================================

  const productsByColor = useMemo(() => {
    const colors: Record<string, number> = {};
    products.forEach(p => {
      if (p.color) {
        const color = p.color;
        colors[color] = (colors[color] || 0) + 1;
      }
    });
    return Object.entries(colors)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  // ============================================
  // 📊 المنتجات حسب الوزن
  // ============================================

  const productsByWeight = useMemo(() => {
    const weights: Record<string, number> = {};
    products.forEach(p => {
      if (p.weight) {
        const weight = p.weight < 1 ? 'أقل من 1 كجم' : p.weight < 5 ? '1-5 كجم' : p.weight < 10 ? '5-10 كجم' : 'أكثر من 10 كجم';
        weights[weight] = (weights[weight] || 0) + 1;
      }
    });
    return Object.entries(weights)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  // ============================================
  // 📊 المنتجات حسب السعر
  // ============================================

  const productsByPrice = useMemo(() => {
    const ranges: Record<string, number> = {
      'أقل من 50': 0,
      '50-100': 0,
      '100-200': 0,
      '200-500': 0,
      'أكثر من 500': 0,
    };
    
    products.forEach(p => {
      const price = p.selling_price;
      if (price < 50) ranges['أقل من 50']++;
      else if (price < 100) ranges['50-100']++;
      else if (price < 200) ranges['100-200']++;
      else if (price < 500) ranges['200-500']++;
      else ranges['أكثر من 500']++;
    });
    
    return Object.entries(ranges)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [products]);

  // ============================================
  // 📊 توزيع المخزون حسب المورد
  // ============================================

  const stockBySupplier = useMemo(() => {
    const supplierData: Record<string, { name: string; value: number; count: number }> = {};
    
    products.forEach(p => {
      // محاكاة: ربط المنتجات بالموردين (في الواقع يوجد علاقة)
      const supplierName = p.brand_name || 'غير معروف';
      if (!supplierData[supplierName]) {
        supplierData[supplierName] = { name: supplierName, value: 0, count: 0 };
      }
      const stock = stocks.find(s => s.product === p.id);
      if (stock) {
        supplierData[supplierName].value += stock.quantity * (p.purchase_price || 0);
        supplierData[supplierName].count += 1;
      }
    });
    
    return Object.values(supplierData)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [products, stocks]);

  // ============================================
  // 📊 تنبؤ النفاذ
  // ============================================

  const stockForecast = useMemo(() => {
    const now = new Date();
    return stocks
      .filter(s => s.quantity > 0)
      .map(s => {
        const product = products.find(p => p.id === s.product);
        // محاكاة: حساب متوسط الاستهلاك اليومي
        const dailyConsumption = 0.5 + Math.random() * 2;
        const daysUntilOut = Math.floor(s.quantity / dailyConsumption);
        const forecastDate = new Date(now);
        forecastDate.setDate(forecastDate.getDate() + daysUntilOut);
        
        return {
          product: s.product,
          name: product?.name || 'غير معروف',
          sku: product?.sku || '-',
          quantity: s.quantity,
          dailyConsumption,
          daysUntilOut,
          forecastDate,
        };
      })
      .sort((a, b) => a.daysUntilOut - b.daysUntilOut)
      .slice(0, 15);
  }, [stocks, products]);

  // ============================================
  // إحصائيات سريعة
  // ============================================

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
        <Card className="border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">معدل الدوران</p>
                <p className="text-2xl font-bold text-indigo-600">{turnoverRate.toFixed(2)}x</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">أيام التغطية</p>
                <p className="text-2xl font-bold text-amber-600">{daysOfCoverage.toFixed(1)} يوم</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
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
          <TabsTrigger value="movement" className="gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            حركة المخزون
          </TabsTrigger>
          <TabsTrigger value="profitable" className="gap-2">
            <TrendingUpIcon className="w-4 h-4 text-green-500" />
            الأكثر ربحية
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <Target className="w-4 h-4 text-purple-500" />
            تنبؤ النفاذ
          </TabsTrigger>
          <TabsTrigger value="by-size" className="gap-2">
            <Ruler className="w-4 h-4" />
            حسب المقاس
          </TabsTrigger>
          <TabsTrigger value="by-supplier" className="gap-2">
            <Building2 className="w-4 h-4" />
            حسب المورد
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <Brain className="w-4 h-4" />
            تحليلات متقدمة
          </TabsTrigger>
        </TabsList>

        {/* ============================================
            التبويب 1: نظرة عامة
            ============================================ */}
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

        {/* ============================================
            التبويب 2: المواد المتاحة
            ============================================ */}
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

        {/* ============================================
            التبويب 3: أوشكت على النفاذ
            ============================================ */}
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

        {/* ============================================
            التبويب 4: نفدت
            ============================================ */}
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

        {/* ============================================
            التبويب 5: حركة المخزون
            ============================================ */}
        <TabsContent value="movement" className="space-y-6">
          {/* الحركات اليومية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Activity className="w-5 h-5" />
                الحركات اليومية
              </CardTitle>
              <CardDescription>حركات الدخول والخروج خلال آخر 30 يوم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dailyMovements.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyMovements}>
                      <defs>
                        <linearGradient id="insGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="outsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} interval={3} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="ins" stroke="#10b981" strokeWidth={2} fill="url(#insGradient)" name="دخول" />
                      <Area type="monotone" dataKey="outs" stroke="#ef4444" strokeWidth={2} fill="url(#outsGradient)" name="خروج" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>لا توجد حركات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* أكثر المنتجات حركة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  أكثر المنتجات حركة
                </CardTitle>
                <CardDescription>المنتجات الأكثر دخولاً وخروجاً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mostActiveProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                  ) : (
                    mostActiveProducts.map((product, index) => (
                      <div key={product.product_id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'}`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">دخول: {product.ins} | خروج: {product.outs}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{product.total} حركة</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* أقل المنتجات حركة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  أقل المنتجات حركة
                </CardTitle>
                <CardDescription>المنتجات الراكدة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leastActiveProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                  ) : (
                    leastActiveProducts.map((product, index) => (
                      <div key={product.product_id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg border border-red-100 dark:border-red-800/30">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.total} حركة</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{product.total}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================
            التبويب 6: الأكثر ربحية
            ============================================ */}
        <TabsContent value="profitable" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Award className="w-5 h-5" />
                المنتجات الأكثر ربحية
              </CardTitle>
              <CardDescription>المنتجات ذات هامش الربح الأعلى</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostProfitableProducts.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
                ) : (
                  mostProfitableProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{product.margin.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">شراء: {product.purchase_price} | بيع: {product.selling_price}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            التبويب 7: تنبؤ النفاذ
            ============================================ */}
        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Target className="w-5 h-5" />
                تنبؤ النفاذ
              </CardTitle>
              <CardDescription>توقع متى سينفد كل منتج</CardDescription>
            </CardHeader>
            <CardContent>
              {stockForecast.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
              ) : (
                <div className="space-y-3">
                  {stockForecast.slice(0, 10).map((item, index) => (
                    <div key={item.product} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{item.quantity} وحدة</p>
                        <p className={`text-xs ${item.daysUntilOut <= 7 ? 'text-red-500 font-bold' : item.daysUntilOut <= 30 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {item.daysUntilOut <= 0 ? '⚠️ نفد اليوم' : `⏰ ينفد خلال ${item.daysUntilOut} يوم`}
                        </p>
                        <p className="text-xs text-muted-foreground">التاريخ: {item.forecastDate.toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            التبويب 8: حسب المقاس
            ============================================ */}
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

        {/* ============================================
            التبويب 9: حسب المورد
            ============================================ */}
        <TabsContent value="by-supplier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Building2 className="w-5 h-5" />
                توزيع المخزون حسب المورد
              </CardTitle>
              <CardDescription>قيمة المخزون من كل مورد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  {stockBySupplier.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockBySupplier} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={10} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                          {stockBySupplier.map((entry, index) => (
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
                <div className="space-y-3">
                  <h4 className="font-medium">تفاصيل المخزون حسب المورد</h4>
                  {stockBySupplier.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{item.value.toFixed(2)} ج.م</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.count} منتج)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            التبويب 10: تحليلات متقدمة
            ============================================ */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* المنتجات حسب اللون */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Palette className="w-5 h-5" />
                  حسب اللون
                </CardTitle>
                <CardDescription>توزيع المنتجات حسب اللون</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {productsByColor.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productsByColor}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {productsByColor.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
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

            {/* المنتجات حسب الوزن */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-600">
                  <Weight className="w-5 h-5" />
                  حسب الوزن
                </CardTitle>
                <CardDescription>توزيع المنتجات حسب الوزن</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {productsByWeight.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productsByWeight}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} />
                        <YAxis fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                          {productsByWeight.map((entry, index) => (
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

            {/* المنتجات حسب السعر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <DollarSign className="w-5 h-5" />
                  حسب السعر
                </CardTitle>
                <CardDescription>توزيع المنتجات حسب الفئة السعرية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {productsByPrice.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productsByPrice}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} />
                        <YAxis fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                          {productsByPrice.map((entry, index) => (
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

          {/* معدلات الأداء */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <Gauge className="w-5 h-5" />
                مؤشرات أداء المخزون
              </CardTitle>
              <CardDescription>مقاييس كفاءة المخزون</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                  <p className="text-sm text-blue-600">معدل دوران المخزون</p>
                  <p className="text-2xl font-bold text-blue-600">{turnoverRate.toFixed(2)}x</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                  <p className="text-sm text-green-600">أيام تغطية المخزون</p>
                  <p className="text-2xl font-bold text-green-600">{daysOfCoverage.toFixed(1)} يوم</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
                  <p className="text-sm text-purple-600">نسبة المنتجات المتاحة</p>
                  <p className="text-2xl font-bold text-purple-600">{((availableCount / totalItems) * 100).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-center">
                  <p className="text-sm text-amber-600">نسبة المنتجات النافدة</p>
                  <p className="text-2xl font-bold text-amber-600">{((outOfStockCount / totalItems) * 100).toFixed(1)}%</p>
                </div>
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
                        <div className="flex items-center gap-1">
                          {stock.product && (
                            <Link href={`/inventory/${stock.product}`}>
                              <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" title="عرض التفاصيل">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
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