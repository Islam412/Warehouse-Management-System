'use client';

import { useState } from 'react';
import { useInvoices, useDeleteInvoice } from '@/hooks/useSales';
import Link from 'next/link';
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
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { Plus, Search, Eye, Trash2, Loader2, RefreshCw, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  paid: 'bg-green-500',
  partially_paid: 'bg-yellow-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  confirmed: 'مؤكدة',
  paid: 'مدفوعة',
  partially_paid: 'مدفوعة جزئياً',
  cancelled: 'ملغية',
};

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);

  const { data: invoicesData, isLoading, error, refetch } = useInvoices({ search });
  const deleteInvoice = useDeleteInvoice();

  const invoices = Array.isArray(invoicesData) ? invoicesData : 
                     invoicesData?.results ? invoicesData.results : [];

  // حساب الإحصائيات مع تحويل الأرقام
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum: number, inv: any) => {
    const total = typeof inv.total === 'number' ? inv.total : parseFloat(inv.total) || 0;
    return sum + total;
  }, 0);
  
  const totalPaid = invoices.reduce((sum: number, inv: any) => {
    const paid = typeof inv.paid_amount === 'number' ? inv.paid_amount : parseFloat(inv.paid_amount) || 0;
    return sum + paid;
  }, 0);
  
  const totalRemaining = totalAmount - totalPaid;

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    await deleteInvoice.mutateAsync(invoiceToDelete.id);
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
    refetch();
  };

  const openDeleteDialog = (invoice: any) => {
    setInvoiceToDelete(invoice);
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل الفواتير</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المبيعات</h1>
          <p className="text-gray-500 text-sm">إدارة الفواتير والمبيعات</p>
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
                فاتورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                <DialogDescription>أدخل بيانات الفاتورة والمنتجات</DialogDescription>
              </DialogHeader>
              <InvoiceForm 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetch();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">إجمالي الفواتير</p>
            <p className="text-2xl font-bold">{totalInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">إجمالي المبيعات</p>
            <p className="text-2xl font-bold text-green-600">{totalAmount.toFixed(2)} ج.م</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">المدفوع</p>
            <p className="text-2xl font-bold text-blue-600">{totalPaid.toFixed(2)} ج.م</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">المتبقي</p>
            <p className="text-2xl font-bold text-red-600">{totalRemaining.toFixed(2)} ج.م</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث عن فاتورة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{invoices.length} فاتورة</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>عرض جميع الفواتير في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    لا توجد فواتير
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: any, index: number) => {
                  const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total) || 0;
                  const paid = typeof invoice.paid_amount === 'number' ? invoice.paid_amount : parseFloat(invoice.paid_amount) || 0;
                  const remaining = total - paid;
                  
                  return (
                    <motion.tr
                      key={invoice.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{invoice.customer_name || invoice.customer?.name || '-'}</TableCell>
                      <TableCell>{invoice.date ? new Date(invoice.date).toLocaleDateString('ar-EG') : '-'}</TableCell>
                      <TableCell className="font-bold">{total.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-green-600">{paid.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-red-600">{remaining.toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status] || 'bg-gray-500'}>
                          {statusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/invoice/${invoice.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="text-blue-500" title="طباعة">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button variant="ghost" size="icon" className="text-green-500" title="عرض">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => openDeleteDialog(invoice)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceToDelete && (
                <>
                  <p><strong>الفاتورة:</strong> {invoiceToDelete.invoice_number}</p>
                  <p><strong>العميل:</strong> {invoiceToDelete.customer_name}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف الفاتورة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
