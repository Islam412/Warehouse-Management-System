'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoice } from '@/hooks/useSales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, Loader2, Eye } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isPrinting, setIsPrinting] = useState(false);

  // التحقق من المصادقة
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: invoice, isLoading, error } = useInvoice(id);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل الفاتورة</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    confirmed: 'bg-blue-500',
    paid: 'bg-green-500',
    partially_paid: 'bg-yellow-500',
    cancelled: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    draft: 'مسودة',
    confirmed: 'مؤكدة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    cancelled: 'ملغية',
  };

  // دالة مساعدة لتحويل الأرقام
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* أزرار التحكم - تختفي عند الطباعة */}
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          العودة
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          طباعة الفاتورة
        </Button>
      </div>

      {/* الفاتورة */}
      <Card id="invoice-print" className="print:shadow-none print:border-0">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-3xl font-bold text-blue-600">DUKA</CardTitle>
          <p className="text-gray-500">نظام إدارة المتاجر المتكامل</p>
          <p className="text-sm text-gray-400">www.duka.com</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات الفاتورة */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">رقم الفاتورة</p>
              <p className="font-bold text-lg">{invoice.invoice_number || 'N/A'}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">التاريخ</p>
              <p className="font-bold">{invoice.date ? new Date(invoice.date).toLocaleDateString('ar-EG') : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">العميل</p>
              <p className="font-bold">{invoice.customer_name || invoice.customer?.name || '-'}</p>
              <p className="text-sm text-gray-500">{invoice.customer_phone || invoice.customer?.phone || ''}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">تاريخ الاستحقاق</p>
              <p className="font-bold">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('ar-EG') : '-'}</p>
            </div>
          </div>

          {/* الحالة */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">الحالة:</span>
            <Badge className={statusColors[invoice.status] || 'bg-gray-500'}>
              {statusLabels[invoice.status] || invoice.status}
            </Badge>
          </div>

          {/* بنود الفاتورة */}
          <div>
            <h3 className="font-semibold mb-3">بنود الفاتورة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-center">السعر</TableHead>
                  <TableHead className="text-center">الخصم</TableHead>
                  <TableHead className="text-left">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.product_name || item.product?.name || 'غير معروف'}</TableCell>
                      <TableCell className="text-center">{toNumber(item.quantity)}</TableCell>
                      <TableCell className="text-center">{toNumber(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-center">{toNumber(item.discount).toFixed(2)}</TableCell>
                      <TableCell className="text-left font-bold">{toNumber(item.total).toFixed(2)} ج.م</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">لا توجد بنود</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* الإجماليات */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">المجموع الفرعي</span>
                  <span className="font-bold">{toNumber(invoice.subtotal).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">الخصم</span>
                  <span className="font-bold text-red-500">-{toNumber(invoice.discount).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">الضريبة</span>
                  <span className="font-bold">+{toNumber(invoice.tax).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                  <span className="text-lg font-bold">الإجمالي</span>
                  <span className="text-2xl font-bold text-blue-600">{toNumber(invoice.total).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">المدفوع</span>
                  <span className="font-bold text-green-600">{toNumber(invoice.paid_amount).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">المتبقي</span>
                  <span className="font-bold text-red-600">{toNumber(invoice.remaining_amount).toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          {invoice.notes && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">ملاحظات:</p>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* تذييل الفاتورة */}
          <div className="border-t pt-4 text-center text-xs text-gray-400">
            <p>شكراً لتسوقكم معنا</p>
            <p>تم إنشاء هذه الفاتورة بواسطة نظام DUKA</p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          #invoice-print {
            margin: 0 !important;
            padding: 20px !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
