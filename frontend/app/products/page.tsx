// frontend/app/products/page.tsx
'use client';

import { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
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
import { ProductForm } from '@/components/forms/ProductForm';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Printer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ============================================
// ✅ Types
// ============================================
interface Product {
  id: string;
  name: string;
  name_ar?: string;
  sku: string;
  category: string;
  category_name?: string;
  brand: string;
  brand_name?: string;
  unit: string;
  unit_name?: string;
  purchase_price: number;
  selling_price: number;
  wholesale_price?: number;
  is_active: boolean;
  is_featured: boolean;
  has_stock: boolean;
  description?: string;
  size?: string;
  color?: string;
  weight?: number;
  profit_margin?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// ✅ Helper Functions
// ============================================
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);

  const { data: productsData, isLoading, error, refetch } = useProducts({ search });
  const deleteProduct = useDeleteProduct();

  // ✅ تأكد من أن products هي مصفوفة
  const products: Product[] = Array.isArray(productsData) ? productsData : 
                     productsData?.results ? productsData.results : [];

  // ============================================
  // 📊 تحليل المنتجات
  // ============================================
  
  // 1. المنتجات الأكثر مبيعاً (حسب السعر الأعلى)
  const mostSold = [...products]
    .sort((a: Product, b: Product) => (b.selling_price || 0) - (a.selling_price || 0))
    .slice(0, 5);
  
  // 2. المنتجات الأقل مبيعاً (حسب السعر الأقل)
  const leastSold = [...products]
    .sort((a: Product, b: Product) => (a.selling_price || 0) - (b.selling_price || 0))
    .slice(0, 5);
  
  // 3. المنتجات الأكثر ربحية (هامش ربح أعلى)
  const mostProfitable = [...products]
    .filter((p: Product) => p.purchase_price > 0)
    .sort((a: Product, b: Product) => {
      const marginA = ((a.selling_price - a.purchase_price) / a.purchase_price) * 100;
      const marginB = ((b.selling_price - b.purchase_price) / b.purchase_price) * 100;
      return marginB - marginA;
    })
    .slice(0, 5);
  
  // 4. المنتجات منخفضة المخزون
  const lowStockProducts = products.filter((p: Product) => p.has_stock === false || p.is_active === false).slice(0, 5);
  
  // 5. إحصائيات عامة
  const totalProducts = products.length;
  const activeProducts = products.filter((p: Product) => p.is_active).length;
  const featuredProducts = products.filter((p: Product) => p.is_featured).length;
  const outOfStock = products.filter((p: Product) => !p.has_stock).length;

  const handleDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct.mutateAsync(productToDelete.id);
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    refetch();
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setProductToEdit(product);
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

      {/* 📊 بطاقات التحليل والإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نشطة</p>
                <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مميزة</p>
                <p className="text-2xl font-bold text-amber-600">{featuredProducts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">غير متوفرة</p>
                <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 تحليل المنتجات - الأكثر والأقل مبيعاً */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأكثر مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              المنتجات الأكثر مبيعاً
            </CardTitle>
            <CardDescription>المنتجات الأعلى سعراً</CardDescription>
          </CardHeader>
          <CardContent>
            {mostSold.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد منتجات</p>
            ) : (
              <div className="space-y-3">
                {mostSold.map((product: Product, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{product.selling_price} ج.م</p>
                      <p className="text-xs text-gray-500">هامش: {((product.selling_price - product.purchase_price) / product.purchase_price * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* الأقل مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              المنتجات الأقل مبيعاً
            </CardTitle>
            <CardDescription>المنتجات الأقل سعراً</CardDescription>
          </CardHeader>
          <CardContent>
            {leastSold.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد منتجات</p>
            ) : (
              <div className="space-y-3">
                {leastSold.map((product: Product, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-orange-400' : 
                        index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{product.selling_price} ج.م</p>
                      <p className="text-xs text-gray-500">هامش: {((product.selling_price - product.purchase_price) / product.purchase_price * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 📊 المنتجات الأكثر ربحية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <BarChart3 className="w-5 h-5" />
            المنتجات الأكثر ربحية
          </CardTitle>
          <CardDescription>المنتجات ذات هامش الربح الأعلى</CardDescription>
        </CardHeader>
        <CardContent>
          {mostProfitable.length === 0 ? (
            <p className="text-center text-gray-500 py-4">لا توجد منتجات</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mostProfitable.map((product: Product, index: number) => {
                const margin = ((product.selling_price - product.purchase_price) / product.purchase_price * 100);
                return (
                  <div key={product.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        index === 0 ? 'bg-purple-600' : 
                        index === 1 ? 'bg-indigo-500' : 
                        index === 2 ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className={`text-sm font-bold ${margin > 50 ? 'text-green-600' : margin > 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {margin.toFixed(1)}% ربح
                      </span>
                    </div>
                    <p className="font-medium mt-2">{product.name}</p>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>شراء: {product.purchase_price} ج.م</span>
                      <span>بيع: {product.selling_price} ج.م</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔍 البحث */}
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

      {/* 📋 قائمة المنتجات */}
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
                products.map((product: Product, index: number) => (
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
                      <div className="flex items-center gap-1">
                        <Link href={`/products/${product.id}`}>
                          <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-amber-500" onClick={() => openEditDialog(product)} title="تعديل">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => openDeleteDialog(product)} title="حذف">
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

      {/* Dialog الحذف */}
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

      {/* Dialog التعديل */}
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