'use client';

import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
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
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState(0);

  const { data: customersData, isLoading, error, refetch } = useCustomers({ search });
  const deleteCustomer = useDeleteCustomer();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : 
                     customersData?.data ? (Array.isArray(customersData.data) ? customersData.data : []) :
                     [];

  // دالة لتحديث حالة العميل (نشط/غير نشط) - من الجدول مباشرة
  const handleToggleActive = async (customer: any) => {
    setUpdatingId(customer.id);
    const newValue = !customer.is_active;
    console.log(`Toggling active for ${customer.name} to:`, newValue);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/customers/api/customers/${customer.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ is_active: newValue }),
      });

      if (response.ok) {
        toast.success(`تم ${newValue ? 'تفعيل' : 'إلغاء تفعيل'} العميل بنجاح`);
        refetch();
      } else {
        const errorData = await response.json();
        toast.error(errorData?.detail || 'حدث خطأ في تحديث حالة العميل');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setUpdatingId(null);
    }
  };

  // دالة لتحديث حالة VIP - من الجدول مباشرة
  const handleToggleVIP = async (customer: any) => {
    setUpdatingId(customer.id);
    const newValue = !customer.is_vip;
    console.log(`Toggling VIP for ${customer.name} to:`, newValue);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/customers/api/customers/${customer.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ is_vip: newValue }),
      });

      if (response.ok) {
        toast.success(`تم ${newValue ? 'تفعيل' : 'إلغاء'} حالة VIP للعميل بنجاح`);
        refetch();
      } else {
        const errorData = await response.json();
        toast.error(errorData?.detail || 'حدث خطأ في تحديث حالة VIP');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    await deleteCustomer.mutateAsync(customerToDelete.id);
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
    refetch();
  };

  const openDeleteDialog = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (customer: any) => {
    console.log('Opening edit for customer:', customer);
    console.log('is_active:', customer.is_active);
    console.log('is_vip:', customer.is_vip);
    setCustomerToEdit(customer);
    setEditKey(prev => prev + 1);
    setIsEditDialogOpen(true);
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل العملاء</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={() => refetch()} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">العملاء</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            إدارة جميع العملاء في المتجر
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة عميل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>
                أدخل معلومات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            <CustomerForm 
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetch();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* البحث */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث عن عميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {/* جدول العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>
            عرض جميع العملاء في المتجر
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
                <TableHead>VIP</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد عملاء
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer: any, index: number) => (
                  <motion.tr
                    key={customer.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="font-medium">{customer.name || 'غير معروف'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className={customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {customer.balance || 0} ج.م
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={customer.is_active !== false}
                        onCheckedChange={() => handleToggleActive(customer)}
                        disabled={updatingId === customer.id}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={customer.is_vip || false}
                        onCheckedChange={() => handleToggleVIP(customer)}
                        disabled={updatingId === customer.id}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-500 hover:text-blue-600"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => openDeleteDialog(customer)}
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
            <AlertDialogTitle>هل أنت متأكد من حذف هذا العميل؟</AlertDialogTitle>
            <AlertDialogDescription>
              {customerToDelete && (
                <>
                  <p><strong>العميل:</strong> {customerToDelete.name}</p>
                  <p><strong>الهاتف:</strong> {customerToDelete.phone}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              نعم، احذف العميل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog للتعديل */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setCustomerToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تعديل العميل</DialogTitle>
            <DialogDescription>
              تعديل معلومات العميل
            </DialogDescription>
          </DialogHeader>
          {customerToEdit && (
            <CustomerForm 
              key={editKey}
              initialData={customerToEdit}
              isEditing={true}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setCustomerToEdit(null);
                refetch();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
