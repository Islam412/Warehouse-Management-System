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
import { Badge } from '@/components/ui/badge';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw, Printer, Star, Users, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const { data: customersData, isLoading, error, refetch } = useCustomers({ search });
  const deleteCustomer = useDeleteCustomer();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  const vipCustomers = customers.filter(c => c.is_vip);
  const regularCustomers = customers.filter(c => !c.is_vip && c.is_active);
  const inactiveCustomers = customers.filter(c => !c.is_active);

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
    setCustomerToEdit(customer);
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل العملاء</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">العملاء</h1>
          <p className="text-gray-500 text-sm">إدارة جميع العملاء في المتجر</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowComparison(!showComparison)} className="gap-2">
            <Users className="w-4 h-4" />
            {showComparison ? 'إخفاء الإحصائيات' : 'إحصائيات العملاء'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>أدخل معلومات العميل الجديد</DialogDescription>
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
      </div>

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
        <span className="text-sm text-gray-500">{customers.length} عميل</span>
      </div>

      {showComparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                <Star className="w-4 h-4" />
                العملاء المميزين (VIP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{vipCustomers.length}</p>
              <div className="space-y-1 mt-2">
                {vipCustomers.slice(0, 5).map(c => (
                  <div key={c.id} className="text-sm flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-amber-500">⭐</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <Users className="w-4 h-4" />
                العملاء النشطين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{regularCustomers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <UserX className="w-4 h-4" />
                العملاء غير النشطين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{inactiveCustomers.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>عرض جميع العملاء في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
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
                    className="border-b"
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className={customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {customer.balance} ج.م
                    </TableCell>
                    <TableCell>
                      {customer.is_vip ? (
                        <Badge className="bg-amber-500">مميز VIP</Badge>
                      ) : (
                        <Badge variant="secondary">عادي</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.is_active ? 'default' : 'destructive'}>
                        {customer.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => openEditDialog(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(customer)}>
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
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف العميل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل العميل</DialogTitle>
            <DialogDescription>تعديل معلومات العميل</DialogDescription>
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
