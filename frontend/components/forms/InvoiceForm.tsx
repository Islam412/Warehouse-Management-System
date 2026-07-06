'use client';

import { useState, useEffect } from 'react';
import { useCreateInvoice } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Trash2, DollarSign, Users, Package, Calendar, FileText, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceFormProps {
  onSuccess?: () => void;
}

interface InvoiceItem {
  product: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    due_date: '',
    discount: 0,
    tax: 0,
    paid_amount: 0,
    notes: '',
    status: 'confirmed',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { product: '', product_name: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 },
  ]);

  const createInvoice = useCreateInvoice();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  const products = Array.isArray(productsData) ? productsData : 
                     productsData?.results ? productsData.results : [];

  // دالة لإضافة بند جديد
  const addItem = () => {
    setItems([...items, { product: '', product_name: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
  };

  // دالة لحذف بند
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // دالة لتحديث البند مع تعبئة السعر تلقائياً
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // إذا تم اختيار منتج، جلب سعره وتعبئته تلقائياً
    if (field === 'product' && value) {
      const selectedProduct = products.find((p: any) => p.id === value);
      if (selectedProduct) {
        newItems[index].product_name = selectedProduct.name;
        newItems[index].unit_price = parseFloat(selectedProduct.selling_price) || 0;
      }
    }
    
    setItems(newItems);
  };

  // حساب المجموع الفرعي
  const calculateSubtotal = () => {
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.quantity * item.unit_price) - item.discount + item.tax;
    });
    return subtotal;
  };

  // حساب الإجمالي النهائي
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    return subtotal - discount + tax;
  };

  // حساب المتبقي
  const remaining = calculateTotal() - (formData.paid_amount || 0);

  // تقديم الفاتورة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.customer) {
      toast.error('العميل مطلوب');
      setIsLoading(false);
      return;
    }

    if (!formData.due_date) {
      toast.error('تاريخ الاستحقاق مطلوب');
      setIsLoading(false);
      return;
    }

    const validItems = items.filter(item => item.product && item.quantity > 0 && item.unit_price > 0);
    if (validItems.length === 0) {
      toast.error('يجب إضافة منتج واحد على الأقل مع سعر وكمية');
      setIsLoading(false);
      return;
    }

    const total = calculateTotal();
    const paidAmount = formData.paid_amount || 0;
    
    let status = formData.status;
    if (paidAmount >= total) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partially_paid';
    }

    const data = {
      customer: formData.customer,
      due_date: formData.due_date,
      discount: formData.discount || 0,
      tax: formData.tax || 0,
      paid_amount: paidAmount,
      notes: formData.notes || '',
      status: status,
      items: validItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        tax: item.tax || 0,
      })),
    };

    try {
      await createInvoice.mutateAsync(data);
      setFormData({
        customer: '',
        due_date: '',
        discount: 0,
        tax: 0,
        paid_amount: 0,
        notes: '',
        status: 'confirmed',
      });
      setItems([{ product: '', product_name: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
      toast.success('تم إنشاء الفاتورة بنجاح! 🎉');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إنشاء الفاتورة');
    } finally {
      setIsLoading(false);
    }
  };

  if (customersLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="mr-3 text-gray-500">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      {/* الصف الأول: العميل والتاريخ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            العميل *
          </Label>
          <Select 
            value={formData.customer} 
            onValueChange={(value) => setFormData({ ...formData, customer: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="اختر العميل" />
            </SelectTrigger>
            <SelectContent>
              {customers.length === 0 ? (
                <SelectItem value="no-customers" disabled>لا توجد عملاء</SelectItem>
              ) : (
                customers.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500" />
            تاريخ الاستحقاق *
          </Label>
          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="h-11"
          />
        </div>
      </div>

      {/* الصف الثاني: الحالة والمدفوع */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            حالة الفاتورة
          </Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">📝 مسودة</SelectItem>
              <SelectItem value="confirmed">✅ مؤكدة</SelectItem>
              <SelectItem value="paid">💰 مدفوعة</SelectItem>
              <SelectItem value="partially_paid">🔄 مدفوعة جزئياً</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-yellow-500" />
            المبلغ المدفوع
          </Label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="h-11 pr-8"
            />
          </div>
          <p className="text-xs text-gray-500">
            المتبقي: <span className="font-bold text-red-500">{remaining.toFixed(2)} ج.م</span>
          </p>
        </div>
      </div>

      {/* بنود الفاتورة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            بنود الفاتورة
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1 h-9">
            <Plus className="w-4 h-4" />
            إضافة بند
          </Button>
        </div>

        {products.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-400">
            ⚠️ لا توجد منتجات. يرجى إضافة منتجات أولاً.
          </div>
        )}

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-12 gap-2 items-end">
                {/* المنتج */}
                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs text-gray-500">المنتج</Label>
                  <Select 
                    value={item.product} 
                    onValueChange={(value) => updateItem(index, 'product', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="اختر المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-products" disabled>لا توجد منتجات</SelectItem>
                      ) : (
                        products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.selling_price} ج.م
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {item.product_name && (
                    <p className="text-xs text-blue-500 mt-1">{item.product_name}</p>
                  )}
                </div>

                {/* الكمية */}
                <div className="col-span-3 md:col-span-2">
                  <Label className="text-xs text-gray-500">الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>

                {/* السعر */}
                <div className="col-span-3 md:col-span-2">
                  <Label className="text-xs text-gray-500">السعر</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>

                {/* الخصم */}
                <div className="col-span-3 md:col-span-2">
                  <Label className="text-xs text-gray-500">الخصم</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.discount}
                    onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>

                {/* الإجمالي + حذف */}
                <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">الإجمالي</Label>
                    <p className="text-sm font-bold text-blue-600">
                      {((item.quantity * item.unit_price) - item.discount + item.tax).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 mt-4"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* الخصم والضريبة والإجمالي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">خصم الفاتورة</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">ضريبة الفاتورة</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.tax}
            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="h-11"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 flex flex-col justify-center">
          <p className="text-sm text-gray-500">المجموع الفرعي</p>
          <p className="text-lg font-bold text-gray-700">{calculateSubtotal().toFixed(2)} ج.م</p>
          <div className="border-t border-blue-200 dark:border-blue-800 mt-1 pt-1">
            <p className="text-sm text-gray-500">الإجمالي النهائي</p>
            <p className="text-2xl font-bold text-blue-600">{calculateTotal().toFixed(2)} ج.م</p>
          </div>
          <div className="flex gap-4 mt-1 text-xs">
            <span className="text-green-600">مدفوع: {formData.paid_amount.toFixed(2)}</span>
            <span className="text-red-500">متبقي: {remaining.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ملاحظات */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">ملاحظات</Label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="ملاحظات على الفاتورة..."
        />
      </div>

      <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            جاري إنشاء الفاتورة...
          </>
        ) : (
          'إنشاء الفاتورة'
        )}
      </Button>
    </form>
  );
}
