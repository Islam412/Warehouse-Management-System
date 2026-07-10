// frontend/app/inventory/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Tag, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Printer,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Ruler,
  Palette,
  Weight,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// دالة مساعدة لتحويل الأرقام
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

// دالة لتنسيق التاريخ
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'غير متوفر';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'غير متوفر';
  }
};

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات المنتج والمخزون
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('معرف المنتج غير موجود');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('يرجى تسجيل الدخول أولاً');
          setIsLoading(false);
          router.push('/login');
          return;
        }

        // جلب بيانات المنتج
        const productResponse = await fetch(`http://localhost:8000/api/v1/products/api/products/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!productResponse.ok) {
          if (productResponse.status === 404) {
            setError('المنتج غير موجود');
          } else if (productResponse.status === 401) {
            setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
            router.push('/login');
          } else {
            setError(`حدث خطأ: ${productResponse.status}`);
          }
          setIsLoading(false);
          return;
        }

        const productData = await productResponse.json();
        console.log('📊 Product data loaded:', productData);
        setProduct(productData);

        // جلب بيانات المخزون للمنتج
        const stockResponse = await fetch(`http://localhost:8000/api/v1/inventory/api/stocks/?product=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          const stocks = Array.isArray(stockData) ? stockData : 
                         stockData?.results ? stockData.results : [];
          if (stocks.length > 0) {
            setStock(stocks[0]);
          }
        }

      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('حدث خطأ في الاتصال بالخادم');
        toast.error('حدث خطأ في تحميل بيانات المنتج');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // دالة إعادة المحاولة
  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500">جاري تحميل بيانات المنتج...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          <h3 className="text-lg font-semibold text-red-600">حدث خطأ</h3>
          <p className="text-gray-500">{error}</p>
          <p className="text-sm text-gray-400">المعرف: {id || 'غير معروف'}</p>
          <div className="flex gap-2">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </Button>
            <Button onClick={() => router.push('/inventory')}>
              الذهاب إلى المخزون
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Package className="w-16 h-16 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600">لا توجد بيانات</h3>
          <p className="text-gray-500">لم يتم العثور على بيانات لهذا المنتج</p>
          <Button onClick={() => router.push('/inventory')}>
            العودة إلى المخزون
          </Button>
        </div>
      </div>
    );
  }

  const quantity = stock?.quantity || 0;
  const minQuantity = stock?.min_quantity || 0;
  const maxQuantity = stock?.max_quantity || 0;
  const isOut = quantity === 0;
  const isLow = quantity <= minQuantity && !isOut;
  const status = isOut ? 'نفد' : isLow ? 'منخفض' : 'متوفر';
  const statusColor = isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600';
  const statusBg = isOut ? 'bg-red-100 dark:bg-red-950/30 border-red-300' : 
                    isLow ? 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300' : 
                    'bg-green-100 dark:bg-green-950/30 border-green-300';

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {product.name || 'منتج غير معروف'}
              {product.is_featured && <Badge className="bg-amber-500">⭐ مميز</Badge>}
            </h1>
            {product.name_ar && (
              <p className="text-sm text-gray-500">{product.name_ar}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isOut ? 'destructive' : 'default'} className="text-sm px-3 py-1">
            {status}
          </Badge>
          <Badge variant={product.is_active ? 'default' : 'destructive'} className="text-sm px-3 py-1">
            {product.is_active ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>
      </div>

      {/* 📊 حالة المخزون */}
      <div className={`p-4 rounded-lg border ${statusBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">حالة المخزون</p>
            <p className={`text-3xl font-bold ${statusColor}`}>{status}</p>
            <p className="text-sm text-muted-foreground">الكمية: {quantity} | الحد الأدنى: {minQuantity}</p>
          </div>
          <div className="text-right">
            {isOut ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : isLow ? (
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            ) : (
              <CheckCircle className="w-12 h-12 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* بطاقات المعلومات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الأساسية */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Package className="w-5 h-5" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SKU */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Tag className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">SKU</p>
                  <p className="font-medium">{product.sku || 'غير متوفر'}</p>
                </div>
              </div>

              {/* الباركود */}
              {product.barcode && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">الباركود</p>
                    <p className="font-medium">{product.barcode}</p>
                  </div>
                </div>
              )}

              {/* الفئة */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Package className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">الفئة</p>
                  <p className="font-medium">{product.category_name || 'غير محدد'}</p>
                </div>
              </div>

              {/* العلامة التجارية */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Tag className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">العلامة التجارية</p>
                  <p className="font-medium">{product.brand_name || 'غير محدد'}</p>
                </div>
              </div>

              {/* وحدة القياس */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Ruler className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">وحدة القياس</p>
                  <p className="font-medium">{product.unit_name || 'غير محدد'}</p>
                </div>
              </div>

              {/* المقاس */}
              {product.size && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Ruler className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">المقاس</p>
                    <p className="font-medium">{product.size}</p>
                  </div>
                </div>
              )}

              {/* اللون */}
              {product.color && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Palette className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">اللون</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: product.color.toLowerCase() }} />
                      <span className="font-medium">{product.color}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* الوزن */}
              {product.weight && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Weight className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">الوزن</p>
                    <p className="font-medium">{product.weight} كجم</p>
                  </div>
                </div>
              )}
            </div>

            {/* الوصف */}
            {product.description && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">الوصف</p>
                <p className="text-sm mt-1">{product.description}</p>
              </div>
            )}

            {/* تاريخ الإنشاء والتحديث */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>تاريخ الإنشاء: {formatDate(product.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>آخر تحديث: {formatDate(product.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المعلومات المالية والمخزنية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <DollarSign className="w-5 h-5" />
              المعلومات المالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* سعر الشراء */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-500">سعر الشراء</p>
              <p className="text-2xl font-bold text-blue-600">{product.purchase_price} ج.م</p>
            </div>

            {/* سعر البيع */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-500">سعر البيع</p>
              <p className="text-2xl font-bold text-green-600">{product.selling_price} ج.م</p>
            </div>

            {/* هامش الربح */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-500">هامش الربح</p>
              <p className={`text-2xl font-bold ${product.profit_margin > 30 ? 'text-green-600' : product.profit_margin > 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                {product.profit_margin?.toFixed(1) || 0}%
              </p>
            </div>

            {/* سعر الجملة */}
            {product.wholesale_price && (
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-gray-500">سعر الجملة</p>
                <p className="text-2xl font-bold text-purple-600">{product.wholesale_price} ج.م</p>
              </div>
            )}

            {/* قيمة المخزون */}
            <div className="p-4 rounded-lg border bg-indigo-50 dark:bg-indigo-950/20">
              <p className="text-sm text-gray-500">قيمة المخزون</p>
              <p className="text-2xl font-bold text-indigo-600">
                {(quantity * product.purchase_price).toFixed(2)} ج.م
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معلومات إضافية عن المخزون */}
      {stock && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Warehouse className="w-5 h-5" />
              تفاصيل المخزون
            </CardTitle>
            <CardDescription>معلومات تفصيلية عن المخزون</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-sm text-gray-500">الكمية الحالية</p>
                <p className="text-2xl font-bold">{quantity}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-sm text-gray-500">الحد الأدنى</p>
                <p className="text-2xl font-bold">{minQuantity}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-sm text-gray-500">الحد الأقصى</p>
                <p className="text-2xl font-bold">{maxQuantity || 'غير محدد'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-sm text-gray-500">الكمية المحجوزة</p>
                <p className="text-2xl font-bold">{stock.reserved_quantity || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/products?edit=${product.id}`}>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            تعديل المنتج
          </Button>
        </Link>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          طباعة التقرير
        </Button>
        <Link href={`/sales?product=${product.id}`}>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            عرض المبيعات
          </Button>
        </Link>
      </div>

      {/* تذييل */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t">
        <p>معرف المنتج: {product.id}</p>
        <p>تم إنشاء هذا التقرير بواسطة نظام DUKA</p>
      </div>
    </div>
  );
}