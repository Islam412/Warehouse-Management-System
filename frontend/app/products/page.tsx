'use client';

import { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
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
import { ProductForm } from '@/components/forms/ProductForm';
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const { data: productsData, isLoading, error, refetch } = useProducts({ search });
  const deleteProduct = useDeleteProduct();

  const products = Array.isArray(productsData) ? productsData : 
                     productsData?.results ? productsData.results : [];

  // ترتيب المنتجات حسب الأكثر مبيعاً
  const sortedProducts = [...products].sort((a, b) => (b.total_quantity || 0) - (a.total_quantity || 0));
  const topProducts = sortedProducts.slice(0, 5);
  const bottomProducts = sortedProducts.slice(-5).reverse();

  const handleDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct.mutateAsync(productToDelete.id);
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    refetch();
  };

  const openDeleteDialog = (product: any) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setProductToEdit(product);
    setEditKey(prev => prev + 1);
    setIsEditDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
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
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل المنتجات</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold">المنتجات</h1>
          <p className="text-gray-500 text-sm">إدارة جميع المنتجات في المتجر</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowComparison(!showComparison)} className="gap-2">
            {showComparison ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {showComparison ? 'إخفاء المقارنة' : 'مقارنة المنتجات'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <DialogDescription>أدخل معلومات المنتج الجديد</DialogDescription>
              </DialogHeader>
              <ProductForm 
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
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{products.length} منتج</span>
      </div>

      {/* مقارنة المنتجات */}
      {showComparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                الأكثر مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 text-sm">لا توجد بيانات</p>
                ) : (
                  topProducts.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{i+1}. {p.name}</span>
                      <span className="font-bold text-green-600">{p.total_quantity || 0} وحدة</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <TrendingDown className="w-4 h-4" />
                الأقل مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bottomProducts.length === 0 ? (
                  <p className="text-gray-500 text-sm">لا توجد بيانات</p>
                ) : (
                  bottomProducts.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{i+1}. {p.name}</span>
                      <span className="font-bold text-red-600">{p.total_quantity || 0} وحدة</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* جدول المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>عرض جميع المنتجات في المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>العلامة</TableHead>
                <TableHead>سعر البيع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any, index: number) => (
                  <motion.tr
                    key={product.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b"
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.brand_name}</TableCell>
                    <TableCell>{product.selling_price} ج.م</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'destructive'}>
                        {product.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => openEditDialog(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(product)}>
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

      {/* Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete && (
                <>
                  <p><strong>المنتج:</strong> {productToDelete.name}</p>
                  <p><strong>SKU:</strong> {productToDelete.sku}</p>
                  <p className="mt-2 text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              نعم، احذف المنتج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
            <DialogDescription>تعديل معلومات المنتج</DialogDescription>
          </DialogHeader>
          {productToEdit && (
            <ProductForm 
              key={editKey}
              initialData={productToEdit}
              isEditing={true}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setProductToEdit(null);
                refetch();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
