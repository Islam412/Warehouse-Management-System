'use client';

import { useState, useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomerFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function CustomerForm({ onSuccess, initialData, isEditing = false }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    phone2: '',
    address: '',
    balance: '',
    credit_limit: '',
    tax_number: '',
    notes: '',
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  // تحميل البيانات عند التعديل
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        name_ar: initialData.name_ar || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        phone2: initialData.phone2 || '',
        address: initialData.address || '',
        balance: initialData.balance?.toString() || '',
        credit_limit: initialData.credit_limit?.toString() || '',
        tax_number: initialData.tax_number || '',
        notes: initialData.notes || '',
      });
      setIsActive(initialData.is_active !== false);
      setIsVip(initialData.is_vip || false);
    } else if (!isEditing) {
      setFormData({
        name: '',
        name_ar: '',
        email: '',
        phone: '',
        phone2: '',
        address: '',
        balance: '',
        credit_limit: '',
        tax_number: '',
        notes: '',
      });
      setIsActive(true);
      setIsVip(false);
    }
  }, [initialData, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // التحقق من الحقول المطلوبة
    if (!formData.name) {
      toast.error('اسم العميل مطلوب');
      setIsLoading(false);
      return;
    }
    if (!formData.phone) {
      toast.error('رقم الهاتف مطلوب');
      setIsLoading(false);
      return;
    }

    // التحقق من الأرقام
    const balance = parseFloat(formData.balance) || 0;
    const creditLimit = parseFloat(formData.credit_limit) || 0;

    // الحد الأقصى للأرقام
    const MAX_VALUE = 9999999999.99;

    if (balance > MAX_VALUE) {
      toast.error(`الرصيد لا يمكن أن يتجاوز ${MAX_VALUE.toLocaleString()}`);
      setIsLoading(false);
      return;
    }

    if (creditLimit > MAX_VALUE) {
      toast.error(`حد الائتمان لا يمكن أن يتجاوز ${MAX_VALUE.toLocaleString()}`);
      setIsLoading(false);
      return;
    }

    if (creditLimit < 0) {
      toast.error('حد الائتمان لا يمكن أن يكون سالباً');
      setIsLoading(false);
      return;
    }

    // تجهيز البيانات للإرسال
    const data = {
      name: formData.name.trim(),
      name_ar: formData.name_ar?.trim() || '',
      email: formData.email?.trim() || '',
      phone: formData.phone.trim(),
      phone2: formData.phone2?.trim() || '',
      address: formData.address?.trim() || '',
      balance: balance,
      credit_limit: creditLimit,
      tax_number: formData.tax_number?.trim() || '',
      notes: formData.notes?.trim() || '',
      is_active: isActive,
      is_vip: isVip,
    };

    console.log('📤 Submitting data:', data);

    try {
      if (isEditing && initialData) {
        await updateCustomer.mutateAsync({ id: initialData.id, data });
      } else {
        await createCustomer.mutateAsync(data);
        // إعادة تعيين النموذج
        setFormData({
          name: '',
          name_ar: '',
          email: '',
          phone: '',
          phone2: '',
          address: '',
          balance: '',
          credit_limit: '',
          tax_number: '',
          notes: '',
        });
        setIsActive(true);
        setIsVip(false);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error saving customer:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // عرض رسالة خطأ مفصلة
      const errorData = error.response?.data;
      if (errorData) {
        const messages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        toast.error(`خطأ في البيانات:\n${messages}`);
      } else {
        toast.error('حدث خطأ في حفظ البيانات');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم العميل *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="أحمد محمد"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_ar">اسم العميل بالعربية</Label>
          <Input
            id="name_ar"
            name="name_ar"
            value={formData.name_ar}
            onChange={handleChange}
            placeholder="أحمد محمد"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0123456789"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone2">رقم هاتف آخر</Label>
          <Input
            id="phone2"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            placeholder="0123456789"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="customer@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_number">الرقم الضريبي</Label>
          <Input
            id="tax_number"
            name="tax_number"
            value={formData.tax_number}
            onChange={handleChange}
            placeholder="123-456-789"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="balance">الرصيد</Label>
          <Input
            id="balance"
            name="balance"
            type="number"
            step="0.01"
            min="-9999999999.99"
            max="9999999999.99"
            value={formData.balance}
            onChange={handleChange}
            placeholder="0.00"
          />
          <p className="text-xs text-gray-400">القيمة القصوى: 9,999,999,999.99</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit_limit">حد الائتمان</Label>
          <Input
            id="credit_limit"
            name="credit_limit"
            type="number"
            step="0.01"
            min="0"
            max="9999999999.99"
            value={formData.credit_limit}
            onChange={handleChange}
            placeholder="1000.00"
          />
          <p className="text-xs text-gray-400">القيمة القصوى: 9,999,999,999.99</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">العنوان</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="شارع النيل، القاهرة"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="ملاحظات عن العميل..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                isActive && "bg-green-600 hover:bg-green-700 text-white"
              )}
              onClick={() => setIsActive(true)}
            >
              <Check className="w-4 h-4 ml-1" />
              نشط
            </Button>
            <Button
              type="button"
              variant={!isActive ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                !isActive && "bg-red-600 hover:bg-red-700 text-white"
              )}
              onClick={() => setIsActive(false)}
            >
              <X className="w-4 h-4 ml-1" />
              غير نشط
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">نوع العميل</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isVip ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                isVip && "bg-amber-500 hover:bg-amber-600 text-white"
              )}
              onClick={() => setIsVip(true)}
            >
              <Check className="w-4 h-4 ml-1" />
              مميز (VIP)
            </Button>
            <Button
              type="button"
              variant={!isVip ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                !isVip && "bg-gray-500 hover:bg-gray-600 text-white"
              )}
              onClick={() => setIsVip(false)}
            >
              <X className="w-4 h-4 ml-1" />
              عادي
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          isEditing ? 'تحديث العميل' : 'إضافة العميل'
        )}
      </Button>
    </form>
  );
}
