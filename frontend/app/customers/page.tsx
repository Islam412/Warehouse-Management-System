// frontend/app/customers/page.tsx
'use client';

import { useState } from 'react';
import { useCustomers, useDeleteCustomer, useVIPCustomers, useTopSpenders } from '@/hooks/useCustomers';
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
import { CustomerForm } from '@/components/forms/CustomerForm';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Printer,
  Users,
  Star,
  Ban,
  CreditCard,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Award,
  Crown,
  Shield,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon
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
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);

  const { data: customersData, isLoading, error, refetch } = useCustomers({ search });
  const { data: vipData } = useVIPCustomers();
  const { data: topSpenders } = useTopSpenders();
  const deleteCustomer = useDeleteCustomer();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  // ============================================
  // 📊 تحليلات العملاء
  // ============================================

  // 1. العملاء المميزين (VIP)
  const vipCustomers = customers.filter(c => c.is_vip && c.is_active);
  
  // 2. العملاء العاديين
  const regularCustomers = customers.filter(c => !c.is_vip && c.is_active);
  
  // 3. العملاء المحظورين (غير نشطين)
  const blockedCustomers = customers.filter(c => !c.is_active);
  
  // 4. العملاء الذين عليهم أقساط (رصيد مديونية)
  const customersWithDebt = customers.filter(c => parseFloat(c.balance || 0) < 0);
  
  // 5. العملاء الأكثر تفاعل (أعلى مشتريات)
  const topInteractive = [...customers]
    .filter(c => c.is_active)
    .sort((a, b) => parseFloat(b.total_purchases || 0) - parseFloat(a.total_purchases || 0))
    .slice(0, 5);
  
  // 6. العملاء الأقل تفاعل
  const leastInteractive = [...customers]
    .filter(c => c.is_active)
    .sort((a, b) => parseFloat(a.total_purchases || 0) - parseFloat(b.total_purchases || 0))
    .slice(0, 5);

  // 7. إحصائيات عامة
  const totalCustomers = customers.length;
  const totalVIP = vipCustomers.length;
  const totalRegular = regularCustomers.length;
  const totalBlocked = blockedCustomers.length;
  const totalWithDebt = customersWithDebt.length;
  const totalDebt = customersWithDebt.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);

  // 8. بيانات الرسم البياني لتوزيع العملاء
  const distributionData = [
    { name: 'مميزين (VIP)', value: totalVIP },
    { name: 'عاديين', value: totalRegular },
    { name: 'محظورين', value: totalBlocked },
  ];

  // 9. بيانات الرسم البياني للأقساط
  const debtData = customersWithDebt.slice(0, 10).map(c => ({
    name: c.name,
    debt: Math.abs(parseFloat(c.balance || 0)),
  }));

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
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">العملاء</h1>
          <p className="text-gray-500 text-sm">إدارة جميع العملاء في المتجر</p>
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

      {/* 📊 بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مميزين (VIP)</p>
                <p className="text-2xl font-bold text-amber-600">{totalVIP}</p>
              </div>
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">محظورين</p>
                <p className="text-2xl font-bold text-red-600">{totalBlocked}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">عليهم أقساط</p>
                <p className="text-2xl font-bold text-orange-600">{totalWithDebt}</p>
                <p className="text-xs text-orange-500">إجمالي: {Math.abs(totalDebt).toFixed(2)} ج.م</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توزيع العملاء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <PieChartIcon className="w-5 h-5" />
              توزيع العملاء
            </CardTitle>
            <CardDescription>نسبة العملاء المميزين والعاديين والمحظورين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* العملاء الأكثر ديوناً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <DollarSign className="w-5 h-5" />
              العملاء الأكثر ديوناً
            </CardTitle>
            <CardDescription>أعلى 10 عملاء من حيث المديونية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {debtData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>لا توجد ديون</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={debtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="debt" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🏆 العملاء الأكثر والأقل تفاعل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأكثر تفاعل */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              العملاء الأكثر تفاعل
            </CardTitle>
            <CardDescription>أعلى 5 عملاء من حيث المشتريات</CardDescription>
          </CardHeader>
          <CardContent>
            {topInteractive.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {topInteractive.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {parseFloat(customer.total_purchases || 0).toFixed(2)} ج.م
                      </p>
                      <p className="text-xs text-gray-500">{customer.total_invoices || 0} فاتورة</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* الأقل تفاعل */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              العملاء الأقل تفاعل
            </CardTitle>
            <CardDescription>أقل 5 عملاء من حيث المشتريات</CardDescription>
          </CardHeader>
          <CardContent>
            {leastInteractive.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {leastInteractive.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-orange-400' : 
                        index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {parseFloat(customer.total_purchases || 0).toFixed(2)} ج.م
                      </p>
                      <p className="text-xs text-gray-500">{customer.total_invoices || 0} فاتورة</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🔍 البحث */}
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

      {/* 📋 قائمة العملاء */}
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
                customers.map((customer: any, index: number) => {
                  const balance = parseFloat(customer.balance || 0);
                  const isBlocked = !customer.is_active;
                  const isVIP = customer.is_vip;
                  const hasDebt = balance < 0;

                  return (
                    <motion.tr
                      key={customer.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {customer.name}
                          {isVIP && <Star className="w-4 h-4 text-amber-500" />}
                          {isBlocked && <Ban className="w-4 h-4 text-red-500" />}
                          {hasDebt && !isBlocked && <AlertCircle className="w-4 h-4 text-orange-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell className={balance < 0 ? 'text-red-600 font-bold' : balance > 0 ? 'text-green-600' : ''}>
                        {balance.toFixed(2)} ج.م
                      </TableCell>
                      <TableCell>
                        {isVIP ? (
                          <Badge className="bg-amber-500">مميز VIP</Badge>
                        ) : (
                          <Badge variant="secondary">عادي</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isBlocked ? (
                          <Badge variant="destructive">محظور</Badge>
                        ) : (
                          <Badge variant="default">نشط</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/customer/${customer.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-amber-500" onClick={() => openEditDialog(customer)} title="تعديل">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(customer)} title="حذف">
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

      {/* Dialog الحذف */}
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

      {/* Dialog التعديل */}
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