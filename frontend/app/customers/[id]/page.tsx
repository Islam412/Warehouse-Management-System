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
  Star, 
  Calendar,
  ShoppingBag,
  FileText,
  TrendingUp,
  Ban,
  AlertCircle,
  CheckCircle,
  Edit,
  Printer,
  ShoppingCart,
  RefreshCw,
  Users
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

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات العميل مباشرة
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) {
        setError('معرف العميل غير موجود');
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

        const response = await fetch(`http://localhost:8000/api/v1/customers/api/customers/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('العميل غير موجود');
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
        console.log('📊 Customer data loaded:', data);
        setCustomer(data);
      } catch (err) {
        console.error('❌ Error fetching customer:', err);
        setError('حدث خطأ في الاتصال بالخادم');
        toast.error('حدث خطأ في تحميل بيانات العميل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id, router]);

  // دالة إعادة المحاولة
  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500">جاري تحميل بيانات العميل...</p>
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
            <Button onClick={() => router.push('/customers')}>
              الذهاب إلى العملاء
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Users className="w-16 h-16 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600">لا توجد بيانات</h3>
          <p className="text-gray-500">لم يتم العثور على بيانات لهذا العميل</p>
          <Button onClick={() => router.push('/customers')}>
            العودة إلى العملاء
          </Button>
        </div>
      </div>
    );
  }

  // استخراج البيانات مع التعامل مع القيم الفارغة
  const balance = toNumber(customer.balance);
  const totalPurchases = toNumber(customer.total_purchases);
  const totalInvoices = toNumber(customer.total_invoices);
  const totalPaid = toNumber(customer.total_paid);
  const isBlocked = !customer.is_active;
  const isVIP = customer.is_vip || false;
  const hasDebt = balance < 0;
  const outstandingBalance = toNumber(customer.outstanding_balance);

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
              {customer.name || 'عميل غير معروف'}
              {isVIP && <Star className="w-5 h-5 text-amber-500" />}
              {isBlocked && <Ban className="w-5 h-5 text-red-500" />}
            </h1>
            {customer.name_ar && (
              <p className="text-sm text-gray-500">{customer.name_ar}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isBlocked ? 'destructive' : 'default'} className="text-sm px-3 py-1">
            {isBlocked ? 'محظور' : 'نشط'}
          </Badge>
          {isVIP && (
            <Badge className="bg-amber-500 text-white text-sm px-3 py-1">
              <Star className="w-3 h-3 ml-1" />
              مميز VIP
            </Badge>
          )}
          {hasDebt && !isBlocked && (
            <Badge className="bg-orange-500 text-white text-sm px-3 py-1">
              <AlertCircle className="w-3 h-3 ml-1" />
              عليه أقساط
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
                  <p className="font-medium">{customer.phone || 'غير متوفر'}</p>
                </div>
              </div>

              {/* الهاتف الثاني */}
              {customer.phone2 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">رقم هاتف آخر</p>
                    <p className="font-medium">{customer.phone2}</p>
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني */}
              {customer.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
              )}

              {/* العنوان */}
              {customer.address && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">العنوان</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </div>
              )}

              {/* الرقم الضريبي */}
              {customer.tax_number && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">الرقم الضريبي</p>
                    <p className="font-medium">{customer.tax_number}</p>
                  </div>
                </div>
              )}

              {/* الملاحظات */}
              {customer.notes && (
                <div className="col-span-2 flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">ملاحظات</p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* تاريخ الإنشاء والتحديث */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>تاريخ الإنشاء: {formatDate(customer.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>آخر تحديث: {formatDate(customer.updated_at)}</span>
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
              {hasDebt && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  مديونية: {Math.abs(balance).toFixed(2)} ج.م
                </p>
              )}
            </div>

            {/* الرصيد المستحق */}
            {outstandingBalance !== 0 && (
              <div className="p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                <p className="text-sm text-gray-500">الرصيد المستحق</p>
                <p className={`text-lg font-bold ${outstandingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {outstandingBalance.toFixed(2)} ج.م
                </p>
              </div>
            )}

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

            {/* إجمالي المدفوع */}
            <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي المدفوع</p>
                  <p className="text-xl font-bold text-green-600">{totalPaid.toFixed(2)} ج.م</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* عدد الفواتير */}
            <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">عدد الفواتير</p>
                  <p className="text-xl font-bold text-purple-600">{totalInvoices}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* متوسط الإنفاق */}
            {totalInvoices > 0 && (
              <div className="p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">متوسط الإنفاق لكل فاتورة</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {(totalPurchases / totalInvoices).toFixed(2)} ج.م
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            )}

            {/* حد الائتمان */}
            {customer.credit_limit && toNumber(customer.credit_limit) > 0 && (
              <div className="p-3 rounded-lg border bg-indigo-50 dark:bg-indigo-950/20">
                <p className="text-sm text-gray-500">حد الائتمان</p>
                <p className="text-lg font-bold text-indigo-600">
                  {toNumber(customer.credit_limit).toFixed(2)} ج.م
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/sales?customer=${customer.id}`}>
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            عرض فواتير العميل
          </Button>
        </Link>
        <Link href={`/customers?edit=${customer.id}`}>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            تعديل العميل
          </Button>
        </Link>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          طباعة التقرير
        </Button>
      </div>

      {/* تذييل */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t">
        <p>معرف العميل: {customer.id}</p>
        <p>تم إنشاء هذا التقرير بواسطة نظام DUKA</p>
      </div>
    </div>
  );
}