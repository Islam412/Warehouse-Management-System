'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Package, Tag, DollarSign, Ruler, Palette, Weight } from 'lucide-react';
import Image from 'next/image';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل المنتج</h3>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        العودة
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الصور */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-2">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.images[0].image_url}
                    alt={product.images[0].alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((img: any) => (
                    <div key={img.id} className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* المعلومات */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                {product.name_ar && (
                  <p className="text-sm text-gray-500">{product.name_ar}</p>
                )}
              </div>
              <Badge variant={product.is_active ? 'default' : 'destructive'}>
                {product.is_active ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* التفاصيل الأساسية */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">SKU</p>
                <p className="font-medium">{product.sku}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">الفئة</p>
                <p className="font-medium">{product.category_name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">العلامة التجارية</p>
                <p className="font-medium">{product.brand_name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">وحدة القياس</p>
                <p className="font-medium">{product.unit_name}</p>
              </div>
              {product.barcode && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">الباركود</p>
                  <p className="font-medium">{product.barcode}</p>
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">الحالة</p>
                <Badge variant={product.has_stock ? 'default' : 'destructive'}>
                  {product.has_stock ? 'متوفر' : 'غير متوفر'}
                </Badge>
              </div>
            </div>

            {/* الأسعار */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  سعر الشراء
                </p>
                <p className="text-lg font-bold text-blue-600">{product.purchase_price} ج.م</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  سعر البيع
                </p>
                <p className="text-lg font-bold text-green-600">{product.selling_price} ج.م</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  هامش الربح
                </p>
                <p className="text-lg font-bold text-amber-600">{product.profit_margin?.toFixed(1) || 0}%</p>
              </div>
            </div>

            {/* الخصائص الإضافية */}
            {(product.size || product.color || product.weight) && (
              <div className="grid grid-cols-3 gap-4">
                {product.size && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-500 flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      المقاس
                    </p>
                    <p className="font-medium">{product.size}</p>
                  </div>
                )}
                {product.color && (
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="text-xs text-pink-500 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      اللون
                    </p>
                    <p className="font-medium">{product.color}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-500 flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      الوزن
                    </p>
                    <p className="font-medium">{product.weight} كجم</p>
                  </div>
                )}
              </div>
            )}

            {/* الوصف */}
            {product.description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">الوصف</p>
                <p className="text-sm mt-1">{product.description}</p>
              </div>
            )}

            {/* مميزات إضافية */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <Badge className="bg-amber-500">⭐ مميز</Badge>
              )}
              {product.has_stock && (
                <Badge className="bg-green-500">📦 متوفر</Badge>
              )}
              {product.is_active && (
                <Badge className="bg-blue-500">✅ نشط</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}