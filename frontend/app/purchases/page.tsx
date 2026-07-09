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
import { Plus, Search, Eye, Loader2, RefreshCw, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // بيانات تجريبية
  const purchases = [
    { id: 1, order_number: 'PO-001', supplier: 'مورد إسلام الأول', total: 5000, status: 'received', date: '2026-07-08' },
    { id: 2, order_number: 'PO-002', supplier: 'شركة النيل للتجارة', total: 3000, status: 'ordered', date: '2026-07-07' },
    { id: 3, order_number: 'PO-003', supplier: 'مورد إسلام الثاني', total: 7000, status: 'draft', date: '2026-07-06' },
  ];

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
          <h1 className="text-2xl md:text-3xl font-bold">المشتريات</h1>
          <p className="text-gray-500 text-sm">إدارة أوامر الشراء والموردين</p>
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            أمر شراء جديد
          </Button>
        </div>
      </div>

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
                purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="border-b">
                    <TableCell className="font-medium">{purchase.order_number}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell className="font-bold">{purchase.total} ج.م</TableCell>
                    <TableCell>
                      <Badge className={statusColors[purchase.status] || 'bg-gray-500'}>
                        {statusLabels[purchase.status] || purchase.status}
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
