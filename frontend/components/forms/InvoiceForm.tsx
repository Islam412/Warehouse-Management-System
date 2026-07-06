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
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { product: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 },
  ]);

  const createInvoice = useCreateInvoice();
  const { data: customersData } = useCustomers();
  const { data: productsData } = useProducts();

  const customers = Array.isArray(customersData) ? customersData : 
                     customersData?.results ? customersData.results : [];

  const products = Array.isArray(productsData) ? productsData : 
                     productsData?.results ? productsData.results : [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.customer) {
      toast.error('العميل مطلوب');
      setIsLoading(false);
      return;
    }

    const validItems = items.filter(item => item.product && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('يجب إضافة منتج واحد على الأقل');
      setIsLoading(false);
      return;
    }

    const data = {
      customer: formData.customer,
      due_date: formData.due_date,
      discount: formData.discount || 0,
      tax: formData.tax || 0,
      notes: formData.notes || '',
      items: validItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        tax: item.tax || 0,
      })),
    };

    console.log('📤 Creating invoice:', data);

    try {
      await createInvoice.mutateAsync(data);
      setFormData({
        customer: '',
        due_date: '',
        discount: 0,
        tax: 0,
        notes: '',
      });
      setItems([{ product: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
      onSuccess?.();
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // حساب الإجمالي
  const calculateTotal = () => {
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.quantity * item.unit_price) - item.discount + item.tax;
    });
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    return subtotal - discount + tax;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      {/* معلومات الفاتورة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>العميل *</Label>
          <Select 
            value={formData.customer} 
            onValueChange={(value) => setFormData({ ...formData, customer: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر العميل" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer: any) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">تاريخ الاستحقاق *</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
        </div>
      </div>

      {/* بنود الفاتورة */}
      <div className="space-y-3">
        <Label>بنود الفاتورة</Label>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg">
            <div className="col-span-4">
              <Label className="text-xs">المنتج</Label>
              <Select 
                value={item.product} 
                onValueChange={(value) => updateItem(index, 'product', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.selling_price} ج.م
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">الكمية</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">سعر الوحدة</Label>
              <Input
                type="number"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">الخصم</Label>
              <Input
                type="number"
                step="0.01"
                value={item.discount}
                onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة بند
        </Button>
      </div>

      {/* الخصم والضريبة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discount">خصم الفاتورة</Label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax">ضريبة الفاتورة</Label>
          <Input
            id="tax"
            type="number"
            step="0.01"
            value={formData.tax}
            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2 flex items-center justify-end">
          <div className="text-right">
            <Label className="text-sm">الإجمالي</Label>
            <p className="text-2xl font-bold text-blue-600">{calculateTotal().toFixed(2)} ج.م</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="ملاحظات على الفاتورة..."
        />
      </div>

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
