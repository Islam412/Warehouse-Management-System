'use client';

import { useState } from 'react';
import { useSuppliers, useDeleteSupplier } from '@/hooks/useSuppliers';
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
import { SupplierForm } from '@/components/forms/SupplierForm';
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw, Printer, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const { data: suppliersData, isLoading, error, refetch } = useSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  const suppliers = Array.isArray(suppliersData) ? suppliersData : 
                     suppliersData?.results ? suppliersData.results : [];

  const sortedSuppliers = [...suppliers].sort((a, b) => (b.balance || 0) - (a.balance || 0));
  const topSuppliers = sortedSuppliers.slice(0, 5);

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

  const handlePrint = () => window.print();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">الموردين</h1>
          <p className="text-gray-500 text-sm">إدارة جميع الموردين في المتجر</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowComparison(!showComparison)} className="gap-2">
            <TrendingUp className="w-4 h-4" />
            {showComparison ? 'إخفاء الترتيب' : 'ترتيب الموردين'}
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

      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              ترتيب الموردين حسب الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSuppliers.length === 0 ? (
                <p className="text-gray-500 text-sm">لا توجد بيانات</p>
              ) : (
                topSuppliers.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span>{i+1}. {s.name}</span>
                    <span className="font-bold text-blue-600">{s.balance || 0} ج.م</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد موردين
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier: any, index: number) => (
                  <motion.tr
                    key={supplier.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b"
                  >
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell className={supplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {supplier.balance} ج.م
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.is_active ? 'default' : 'destructive'}>
                        {supplier.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => openEditDialog(supplier)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(supplier)}>
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
