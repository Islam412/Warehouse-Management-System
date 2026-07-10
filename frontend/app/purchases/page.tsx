'use client';

import { useState } from 'react';
import { usePurchases, useDeletePurchase } from '@/hooks/usePurchases';
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
import { Search, Eye, Loader2, RefreshCw, Printer, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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

export default function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<any>(null);

  const { data: purchasesData, isLoading, error, refetch } = usePurchases({ search });
  const deletePurchase = useDeletePurchase();

  const purchases = Array.isArray(purchasesData) ? purchasesData : 
                     purchasesData?.results ? purchasesData.results : [];

  const handleDelete = async () => {
    if (!purchaseToDelete) return;
    await deletePurchase.mutateAsync(purchaseToDelete.id);
    setDeleteDialogOpen(false);
    setPurchaseToDelete(null);
    refetch();
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل أوامر الشراء</h3>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المشتريات</h1>
          <p className="text-gray-500 text-sm">إدارة أوامر الشراء والموردين</p>
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
                purchases.map((purchase: any, index: number) => (
                  <motion.tr
                    key={purchase.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b"
                  >
                    <TableCell className="font-medium">{purchase.order_number}</TableCell>
                    <TableCell>{purchase.supplier_name}</TableCell>
                    <TableCell>{new Date(purchase.order_date).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell className="font-bold">{parseFloat(purchase.total).toFixed(2)} ج.م</TableCell>
                    <TableCell>
                      <Badge className={statusColors[purchase.status] || 'bg-gray-500'}>
                        {statusLabels[purchase.status] || purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => {
                            setPurchaseToDelete(purchase);
                            setDeleteDialogOpen(true);
                          }}
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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