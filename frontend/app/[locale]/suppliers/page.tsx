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
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: suppliersData, isLoading, error, refetch } = useSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  const suppliers = Array.isArray(suppliersData) ? suppliersData : 
                     suppliersData?.results ? suppliersData.results : 
                     suppliersData?.data ? (Array.isArray(suppliersData.data) ? suppliersData.data : []) :
                     [];

  // دالة لتحديث حالة المورد
  const handleToggleActive = async (supplier: any) => {
    setUpdatingId(supplier.id);
    const newValue = !supplier.is_active;
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/suppliers/api/suppliers/${supplier.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ is_active: newValue }),
      });

      if (response.ok) {
        toast.success(`تم ${newValue ? 'تفعيل' : 'إلغاء تفعيل'} المورد بنجاح`);
        refetch();
      } else {
        const errorData = await response.json();
        toast.error(errorData?.detail || 'حدث خطأ في تحديث حالة المورد');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setUpdatingId(null);
    }
  };

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
    console.log('✏️ Opening edit for supplier:', supplier);
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
    <div className="p-6 space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الموردين</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            إدارة جميع الموردين في المتجر
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>إضافة مورد جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات المورد الجديد
                </DialogDescription>
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

      {/* البحث */}
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

      {/* جدول الموردين */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>
            عرض جميع الموردين في المتجر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>نشط</TableHead>
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
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="font-medium">{supplier.name || 'غير معروف'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell className={supplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {supplier.balance || 0} ج.م
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={supplier.is_active !== false}
                        onCheckedChange={() => handleToggleActive(supplier)}
                        disabled={updatingId === supplier.id}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-500 hover:text-blue-600"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => openDeleteDialog(supplier)}
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

      {/* Alert Dialog للتأكيد على الحذف */}
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

      {/* Dialog للتعديل */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSupplierToEdit(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تعديل المورد</DialogTitle>
            <DialogDescription>
              تعديل معلومات المورد
            </DialogDescription>
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
