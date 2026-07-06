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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceFormProps {
  onSuccess?: () => void;
}

interface InvoiceItem {
  product: string;
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
    notes: '',
    status: 'confirmed', // الحالة الافتراضية
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { product: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 },
  ]);

  const createInvoice = useCreateInvoice();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProducts();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  const products = Array.isArray(productsData) ? productsData : 
                     productsData?.results ? productsData.results : [];

  // جلب المنتجات مرة أخرى للتأكد
  useEffect(() => {
    refetchProducts();
  }, []);

  console.log('📦 Products in form:', products);
  console.log('📦 Products data raw:', productsData);

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.quantity * item.unit_price) - item.discount + item.tax;
    });
    return subtotal;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    return subtotal - discount + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('📤 Form data before submit:', { formData, items });

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

    const data = {
      customer: formData.customer,
      due_date: formData.due_date,
      discount: formData.discount || 0,
      tax: formData.tax || 0,
      notes: formData.notes || '',
      status: formData.status || 'confirmed',
      items: validItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        tax: item.tax || 0,
      })),
    };

    console.log('📤 Creating invoice with status:', data.status);
    console.log('📤 Full invoice data:', data);

    try {
      const result = await createInvoice.mutateAsync(data);
      console.log('✅ Invoice created:', result);
      
      setFormData({
        customer: '',
        due_date: '',
        discount: 0,
        tax: 0,
        notes: '',
        status: 'confirmed',
      });
      setItems([{ product: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
      toast.success('تم إنشاء الفاتورة بنجاح! 🎉');
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error creating invoice:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إنشاء الفاتورة');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  if (customersLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="mr-2 text-gray-500">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* معلومات العميل */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">العميل *</Label>
              <Select 
                value={formData.customer} 
                onValueChange={(value) => setFormData({ ...formData, customer: value })}
              >
                <SelectTrigger className="w-full">
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
              <Label className="text-sm font-medium">تاريخ الاستحقاق *</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حالة الفاتورة */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">حالة الفاتورة</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="confirmed">مؤكدة</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
                <SelectItem value="partially_paid">مدفوعة جزئياً</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">اختر حالة الفاتورة (مسودة، مؤكدة، مدفوعة، مدفوعة جزئياً)</p>
          </div>
        </CardContent>
      </Card>

      {/* بنود الفاتورة */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">بنود الفاتورة</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة بند
            </Button>
          </div>

          {products.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ لا توجد منتجات. يرجى إضافة منتجات أولاً من صفحة المنتجات.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="col-span-4">
                  <Label className="text-xs">المنتج</Label>
                  <Select 
                    value={item.product} 
                    onValueChange={(value) => updateItem(index, 'product', value)}
                  >
                    <SelectTrigger className="w-full h-9">
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
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">السعر</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">الخصم</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.discount}
                    onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="col-span-1 text-left">
                  <Label className="text-xs">الإجمالي</Label>
                  <p className="text-sm font-bold text-blue-600">
                    {((item.quantity * item.unit_price) - item.discount + item.tax).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الخصم والضريبة والإجمالي */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">خصم الفاتورة</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">ضريبة الفاتورة</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 flex flex-col items-end justify-end">
              <div className="text-right w-full">
                <p className="text-sm text-gray-500">المجموع الفرعي</p>
                <p className="text-lg font-bold text-gray-700">{subtotal.toFixed(2)} ج.م</p>
              </div>
              <div className="text-right w-full border-t pt-2">
                <p className="text-sm text-gray-500">الإجمالي النهائي</p>
                <p className="text-2xl font-bold text-blue-600">{total.toFixed(2)} ج.م</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملاحظات */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">ملاحظات</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="ملاحظات على الفاتورة..."
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري الإنشاء...
          </>
        ) : (
          'إنشاء الفاتورة'
        )}
      </Button>
    </form>
  );
}
