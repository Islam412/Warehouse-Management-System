'use client';

import { useState, useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function CustomerForm({ onSuccess, initialData, isEditing = false }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    is_active: true,
    is_vip: false,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  useEffect(() => {
    if (initialData && isEditing) {
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
        is_active: initialData.is_active !== false,
        is_vip: initialData.is_vip || false,
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

    try {
      const data = {
        name: formData.name,
        name_ar: formData.name_ar || '',
        email: formData.email || '',
        phone: formData.phone,
        phone2: formData.phone2 || '',
        address: formData.address || '',
        balance: parseFloat(formData.balance) || 0,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        tax_number: formData.tax_number || '',
        notes: formData.notes || '',
        is_active: formData.is_active,
        is_vip: formData.is_vip,
      };

      if (isEditing && initialData) {
        await updateCustomer.mutateAsync({ id: initialData.id, data });
      } else {
        await createCustomer.mutateAsync(data);
      }

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
        is_active: true,
        is_vip: false,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error saving customer:', error);
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
            value={formData.balance}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit_limit">حد الائتمان</Label>
          <Input
            id="credit_limit"
            name="credit_limit"
            type="number"
            step="0.01"
            value={formData.credit_limit}
            onChange={handleChange}
            placeholder="1000.00"
          />
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
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>نشط</Label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>عميل مميز (VIP)</Label>
          <Switch
            checked={formData.is_vip}
            onCheckedChange={(checked) => handleSwitchChange('is_vip', checked)}
          />
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
