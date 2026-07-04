'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useCategories, useBrands, useUnits } from '@/hooks/useProducts';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // جلب البيانات
  const { data: products, isLoading, error } = useProducts({ search });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: units } = useUnits();

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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">المنتجات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            إدارة جميع المنتجات في المتجر
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة منتج
        </Button>
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
      </div>

      {/* جدول المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>
            عرض جميع المنتجات في المتجر
          </CardDescription>
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
              {!products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any, index: number) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{product.sku}</TableCell>
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
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
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
    </div>
  );
}
