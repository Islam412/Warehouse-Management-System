// frontend/app/inventory/page.tsx
'use client';

import { useState } from 'react';
import { useStocks, useLowStock, useWarehouses } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Loader2, RefreshCw, Printer, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const { data: stocksData, isLoading, error, refetch } = useStocks({ search });
  const { data: lowStockData } = useLowStock();

  const stocks = Array.isArray(stocksData) ? stocksData : 
                 stocksData?.results ? stocksData.results : [];

  const lowStock = Array.isArray(lowStockData) ? lowStockData : [];

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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل المخزون</h3>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  const totalProducts = stocks.length;
  const lowStockCount = lowStock.length;
  const outOfStock = stocks.filter(s => s.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المخزون</h1>
          <p className="text-gray-500 text-sm">إدارة المخزون والمنتجات</p>
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
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">إجمالي المنتجات</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">مخزون منخفض</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">متوفر</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{totalProducts - outOfStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">نفد</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">{outOfStock}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{stocks.length} منتج</span>
      </div>

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
                stocks.map((stock: any, index: number) => {
                  const isLow = stock.quantity <= stock.min_quantity;
                  const isOut = stock.quantity === 0;
                  
                  return (
                    <motion.tr
                      key={stock.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">{stock.product_name}</TableCell>
                      <TableCell>{stock.product_sku}</TableCell>
                      <TableCell>{stock.warehouse_name}</TableCell>
                      <TableCell className={isLow ? 'text-red-600 font-bold' : ''}>
                        {stock.quantity}
                      </TableCell>
                      <TableCell>{stock.min_quantity}</TableCell>
                      <TableCell>
                        {isOut ? (
                          <Badge variant="destructive">نفد</Badge>
                        ) : isLow ? (
                          <Badge className="bg-yellow-500">منخفض</Badge>
                        ) : (
                          <Badge variant="default">متوفر</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
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