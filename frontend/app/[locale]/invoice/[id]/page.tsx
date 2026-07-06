'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useInvoice } from '@/hooks/useSales';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function InvoicePrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isPrinting, setIsPrinting] = useState(false);

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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* أزرار التحكم - تختفي عند الطباعة */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          طباعة الفاتورة
        </Button>
      </div>

      {/* الفاتورة */}
      <div id="invoice-print" className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto print:shadow-none print:p-4">
        {/* رأس الفاتورة */}
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-3xl font-bold text-blue-600">DUKA</h1>
          <p className="text-gray-500">نظام إدارة المتاجر المتكامل</p>
          <p className="text-sm text-gray-400 mt-1">www.duka.com</p>
        </div>

        {/* معلومات الفاتورة */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">رقم الفاتورة</p>
            <p className="font-bold text-lg">{invoice.invoice_number || 'N/A'}</p>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-500">التاريخ</p>
            <p className="font-bold">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">العميل</p>
            <p className="font-bold">{invoice.customer_name}</p>
            <p className="text-sm text-gray-500">{invoice.customer_phone}</p>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-500">تاريخ الاستحقاق</p>
            <p className="font-bold">{new Date(invoice.due_date).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        {/* حالة الفاتورة */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">الحالة:</span>
          <Badge className={
            invoice.status === 'paid' ? 'bg-green-500' :
            invoice.status === 'partially_paid' ? 'bg-yellow-500' :
            invoice.status === 'confirmed' ? 'bg-blue-500' :
            invoice.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
          }>
            {invoice.status_display || invoice.status}
          </Badge>
        </div>

        {/* بنود الفاتورة */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-right py-2 text-sm font-bold">#</th>
              <th className="text-right py-2 text-sm font-bold">المنتج</th>
              <th className="text-center py-2 text-sm font-bold">الكمية</th>
              <th className="text-center py-2 text-sm font-bold">السعر</th>
              <th className="text-center py-2 text-sm font-bold">الخصم</th>
              <th className="text-left py-2 text-sm font-bold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="py-2 text-sm">{item.product_name}</td>
                <td className="py-2 text-sm text-center">{item.quantity}</td>
                <td className="py-2 text-sm text-center">{item.unit_price.toFixed(2)}</td>
                <td className="py-2 text-sm text-center">{item.discount?.toFixed(2) || '0.00'}</td>
                <td className="py-2 text-sm text-left font-bold">{item.total.toFixed(2)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* الإجماليات */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">المجموع الفرعي</span>
                <span className="font-bold">{invoice.subtotal?.toFixed(2) || '0.00'} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">الخصم</span>
                <span className="font-bold text-red-500">-{invoice.discount?.toFixed(2) || '0.00'} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">الضريبة</span>
                <span className="font-bold">+{invoice.tax?.toFixed(2) || '0.00'} ج.م</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                <span className="text-lg font-bold">الإجمالي</span>
                <span className="text-2xl font-bold text-blue-600">{invoice.total?.toFixed(2) || '0.00'} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">المدفوع</span>
                <span className="font-bold text-green-600">{invoice.paid_amount?.toFixed(2) || '0.00'} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">المتبقي</span>
                <span className="font-bold text-red-600">{invoice.remaining_amount?.toFixed(2) || '0.00'} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* ملاحظات */}
        {invoice.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">ملاحظات:</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* تذييل الفاتورة */}
        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-400">
          <p>شكراً لتسوقكم معنا</p>
          <p>تم إنشاء هذه الفاتورة بواسطة نظام DUKA</p>
        </div>
      </div>

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
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
