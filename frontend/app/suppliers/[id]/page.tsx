// frontend/app/suppliers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar,
  ShoppingBag,
  FileText,
  TrendingUp,
  Ban,
  AlertCircle,
  CheckCircle,
  Edit,
  Printer,
  Package,
  RefreshCw,
  Building2,
  Truck,
  Star,
  Crown,
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

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [supplier, setSupplier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات المورد مباشرة
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) {
        setError('معرف المورد غير موجود');
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

        const response = await fetch(`http://localhost:8000/api/v1/suppliers/api/suppliers/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('المورد غير موجود');
          } else if (response.status === 401) {
            setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
            router.push('/login');
          } else {
            setError(`حدث خطأ: ${response.status}`);
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('📊 Supplier data loaded:', data);
        setSupplier(data);
      } catch (err) {
        console.error('❌ Error fetching supplier:', err);
        setError('حدث خطأ في الاتصال بالخادم');
        toast.error('حدث خطأ في تحميل بيانات المورد');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [id, router]);

  // دالة إعادة المحاولة
  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500">جاري تحميل بيانات المورد...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
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
            <Button onClick={() => router.push('/suppliers')}>
              الذهاب إلى الموردين
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Building2 className="w-16 h-16 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600">لا توجد بيانات</h3>
          <p className="text-gray-500">لم يتم العثور على بيانات لهذا المورد</p>
          <Button onClick={() => router.push('/suppliers')}>
            العودة إلى الموردين
          </Button>
        </div>
      </div>
    );
  }

  // استخراج البيانات مع التعامل مع القيم الفارغة
  const balance = toNumber(supplier.balance);
  const totalPurchases = toNumber(supplier.total_purchases);
  const isBlocked = !supplier.is_active;
  const isTopSupplier = totalPurchases > 10000;

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
              {supplier.name || 'مورد غير معروف'}
              {isTopSupplier && <Crown className="w-5 h-5 text-yellow-500" />}
              {isBlocked && <Ban className="w-5 h-5 text-red-500" />}
            </h1>
            {supplier.name_ar && (
              <p className="text-sm text-gray-500">{supplier.name_ar}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isBlocked ? 'destructive' : 'default'} className="text-sm px-3 py-1">
            {isBlocked ? 'محظور' : 'نشط'}
          </Badge>
          {isTopSupplier && (
            <Badge className="bg-yellow-500 text-white text-sm px-3 py-1">
              <Crown className="w-3 h-3 ml-1" />
              مورد ممتاز
            </Badge>
          )}
        </div>
      </div>

      {/* بطاقات المعلومات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الشخصية */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* الهاتف */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className="font-medium">{supplier.phone || 'غير متوفر'}</p>
                </div>
              </div>

              {/* الهاتف الثاني */}
              {supplier.phone2 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">رقم هاتف آخر</p>
                    <p className="font-medium">{supplier.phone2}</p>
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني */}
              {supplier.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium">{supplier.email}</p>
                  </div>
                </div>
              )}

              {/* العنوان */}
              {supplier.address && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">العنوان</p>
                    <p className="font-medium">{supplier.address}</p>
                  </div>
                </div>
              )}

              {/* الرقم الضريبي */}
              {supplier.tax_number && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">الرقم الضريبي</p>
                    <p className="font-medium">{supplier.tax_number}</p>
                  </div>
                </div>
              )}

              {/* الملاحظات */}
              {supplier.notes && (
                <div className="col-span-2 flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">ملاحظات</p>
                    <p className="text-sm">{supplier.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* تاريخ الإنشاء والتحديث */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>تاريخ الإنشاء: {formatDate(supplier.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>آخر تحديث: {formatDate(supplier.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المعلومات المالية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <DollarSign className="w-5 h-5" />
              المعلومات المالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* الرصيد */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-500">الرصيد الحالي</p>
              <p className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : balance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {balance.toFixed(2)} ج.م
              </p>
              {balance < 0 && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  مديونية: {Math.abs(balance).toFixed(2)} ج.م
                </p>
              )}
            </div>

            {/* إجمالي المشتريات */}
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي المشتريات</p>
                  <p className="text-xl font-bold text-blue-600">{totalPurchases.toFixed(2)} ج.م</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* حالة المورد */}
            <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">حالة المورد</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isBlocked ? (
                      <Badge variant="destructive">محظور</Badge>
                    ) : isTopSupplier ? (
                      <Badge className="bg-yellow-500">ممتاز</Badge>
                    ) : (
                      <Badge variant="default">نشط</Badge>
                    )}
                  </div>
                </div>
                {isTopSupplier ? (
                  <Star className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Building2 className="w-8 h-8 text-purple-500" />
                )}
              </div>
            </div>

            {/* تصنيف المورد */}
            <div className="p-3 rounded-lg border bg-indigo-50 dark:bg-indigo-950/20">
              <p className="text-sm text-gray-500">تصنيف المورد</p>
              <div className="flex items-center gap-2 mt-1">
                {totalPurchases > 50000 ? (
                  <span className="text-lg font-bold text-indigo-600">⭐ ممتاز</span>
                ) : totalPurchases > 10000 ? (
                  <span className="text-lg font-bold text-blue-600">⭐ جيد جداً</span>
                ) : totalPurchases > 5000 ? (
                  <span className="text-lg font-bold text-green-600">⭐ جيد</span>
                ) : (
                  <span className="text-lg font-bold text-gray-500">عادي</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                بناءً على إجمالي المشتريات: {totalPurchases.toFixed(2)} ج.م
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/purchases?supplier=${supplier.id}`}>
          <Button variant="outline" className="gap-2">
            <ShoppingBag className="w-4 h-4" />
            عرض طلبات الشراء
          </Button>
        </Link>
        <Link href={`/suppliers?edit=${supplier.id}`}>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            تعديل المورد
          </Button>
        </Link>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          طباعة التقرير
        </Button>
      </div>

      {/* تذييل */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t">
        <p>معرف المورد: {supplier.id}</p>
        <p>تم إنشاء هذا التقرير بواسطة نظام DUKA</p>
      </div>
    </div>
  );
}