'use client';

import { useState } from 'react';
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
import { Search, Eye, Loader2, RefreshCw, Printer, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stocks = [
    { id: 1, product: 'قلب حنفية إسلام', sku: 'ISLAM-001', quantity: 124, min_quantity: 10, warehouse: 'مخزن إسلام حمدى' },
    { id: 2, product: 'خلاط مطبخ حمدى', sku: 'HAMDY-001', quantity: 91, min_quantity: 5, warehouse: 'مخزن إسلام حمدى' },
    { id: 3, product: 'قلب حنفية استانلس', sku: 'SKU-001', quantity: 3, min_quantity: 10, warehouse: 'المخزن الرئيسي' },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.info('تم تحديث البيانات');
    }, 1000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المخزون</h1>
          <p className="text-gray-500 text-sm">إدارة المخزون والمنتجات</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">إجمالي المنتجات</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stocks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">مخزون منخفض</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">متوفر</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">نفد</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">0</p>
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
                stocks.map((stock) => (
                  <TableRow key={stock.id} className="border-b">
                    <TableCell className="font-medium">{stock.product}</TableCell>
                    <TableCell>{stock.sku}</TableCell>
                    <TableCell>{stock.warehouse}</TableCell>
                    <TableCell className={stock.quantity < stock.min_quantity ? 'text-red-600 font-bold' : ''}>
                      {stock.quantity}
                    </TableCell>
                    <TableCell>{stock.min_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={stock.quantity < stock.min_quantity ? 'destructive' : 'default'}>
                        {stock.quantity < stock.min_quantity ? 'منخفض' : 'متوفر'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
