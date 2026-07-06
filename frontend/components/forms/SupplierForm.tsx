'use client';

import { useState, useEffect } from 'react';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SupplierFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function SupplierForm({ onSuccess, initialData, isEditing = false }: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    phone2: '',
    address: '',
    balance: '',
    tax_number: '',
    notes: '',
    is_active: true,
  });

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  // تحميل البيانات عند التعديل
  useEffect(() => {
    console.log('🔄 Loading supplier data:', { isEditing, initialData });
    
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        name_ar: initialData.name_ar || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        phone2: initialData.phone2 || '',
        address: initialData.address || '',
        balance: initialData.balance?.toString() || '',
        tax_number: initialData.tax_number || '',
        notes: initialData.notes || '',
        is_active: initialData.is_active !== false,
      });
    } else if (!isEditing) {
      setFormData({
        name: '',
        name_ar: '',
        email: '',
        phone: '',
        phone2: '',
        address: '',
        balance: '',
        tax_number: '',
        notes: '',
        is_active: true,
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.name) {
      toast.error('اسم المورد مطلوب');
      setIsLoading(false);
      return;
    }
    if (!formData.phone) {
      toast.error('رقم الهاتف مطلوب');
      setIsLoading(false);
      return;
    }

    const data = {
      name: formData.name.trim(),
      name_ar: formData.name_ar?.trim() || '',
      email: formData.email?.trim() || '',
      phone: formData.phone.trim(),
      phone2: formData.phone2?.trim() || '',
      address: formData.address?.trim() || '',
      balance: parseFloat(formData.balance) || 0,
      tax_number: formData.tax_number?.trim() || '',
      notes: formData.notes?.trim() || '',
      is_active: formData.is_active,
    };

    console.log('📤 Submitting supplier data:', data);

    try {
      if (isEditing && initialData) {
        await updateSupplier.mutateAsync({ id: initialData.id, data });
      } else {
        await createSupplier.mutateAsync(data);
        setFormData({
          name: '',
          name_ar: '',
          email: '',
          phone: '',
          phone2: '',
          address: '',
          balance: '',
          tax_number: '',
          notes: '',
          is_active: true,
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error saving supplier:', error);
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
          <Label htmlFor="name">اسم المورد *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="شركة النيل للتجارة"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_ar">اسم المورد بالعربية</Label>
          <Input
            id="name_ar"
            name="name_ar"
            value={formData.name_ar}
            onChange={handleChange}
            placeholder="شركة النيل للتجارة"
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
            placeholder="supplier@example.com"
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

      <div className="space-y-2">
        <Label htmlFor="address">العنوان</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="القاهرة، مصر"
        />
      </div>

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
        <Label htmlFor="notes">ملاحظات</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="ملاحظات عن المورد..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          isEditing ? 'تحديث المورد' : 'إضافة المورد'
        )}
      </Button>
    </form>
  );
}
