'use client';

import { useState } from 'react';
import { useCreateProduct, useCategories, useBrands, useUnits } from '@/hooks/useProducts';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  onSuccess?: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    category: '',
    brand: '',
    unit: '',
    sku: '',
    barcode: '',
    purchase_price: '',
    selling_price: '',
    wholesale_price: '',
    size: '',
    color: '',
    weight: '',
    is_active: true,
    is_featured: false,
    has_stock: true,
  });

  const createProduct = useCreateProduct();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: units } = useUnits();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        wholesale_price: parseFloat(formData.wholesale_price) || 0,
        weight: parseFloat(formData.weight) || 0,
      };

      await createProduct.mutateAsync(data);
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        category: '',
        brand: '',
        unit: '',
        sku: '',
        barcode: '',
        purchase_price: '',
        selling_price: '',
        wholesale_price: '',
        size: '',
        color: '',
        weight: '',
        is_active: true,
        is_featured: false,
        has_stock: true,
      });
      onSuccess?.();
      toast.success('تم إضافة المنتج بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* الاسم */}
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثلاً: قلب حنفية"
            required
          />
        </div>

        {/* الاسم بالعربية */}
        <div className="space-y-2">
          <Label htmlFor="name_ar">اسم المنتج بالعربية</Label>
          <Input
            id="name_ar"
            name="name_ar"
            value={formData.name_ar}
            onChange={handleChange}
            placeholder="مثلاً: قلب حنفية"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* الفئة */}
        <div className="space-y-2">
          <Label>الفئة *</Label>
          <Select onValueChange={(value) => handleSelectChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* العلامة التجارية */}
        <div className="space-y-2">
          <Label>العلامة التجارية *</Label>
          <Select onValueChange={(value) => handleSelectChange('brand', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العلامة" />
            </SelectTrigger>
            <SelectContent>
              {brands?.map((brand: any) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* وحدة القياس */}
        <div className="space-y-2">
          <Label>وحدة القياس *</Label>
          <Select onValueChange={(value) => handleSelectChange('unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الوحدة" />
            </SelectTrigger>
            <SelectContent>
              {units?.map((unit: any) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="مثلاً: SKU-001"
            required
          />
        </div>

        {/* الباركود */}
        <div className="space-y-2">
          <Label htmlFor="barcode">الباركود</Label>
          <Input
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="مثلاً: 1234567890"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* سعر الشراء */}
        <div className="space-y-2">
          <Label htmlFor="purchase_price">سعر الشراء *</Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            step="0.01"
            value={formData.purchase_price}
            onChange={handleChange}
            placeholder="50.00"
            required
          />
        </div>

        {/* سعر البيع */}
        <div className="space-y-2">
          <Label htmlFor="selling_price">سعر البيع *</Label>
          <Input
            id="selling_price"
            name="selling_price"
            type="number"
            step="0.01"
            value={formData.selling_price}
            onChange={handleChange}
            placeholder="80.00"
            required
          />
        </div>

        {/* سعر الجملة */}
        <div className="space-y-2">
          <Label htmlFor="wholesale_price">سعر الجملة</Label>
          <Input
            id="wholesale_price"
            name="wholesale_price"
            type="number"
            step="0.01"
            value={formData.wholesale_price}
            onChange={handleChange}
            placeholder="65.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* المقاس */}
        <div className="space-y-2">
          <Label htmlFor="size">المقاس</Label>
          <Input
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="مثلاً: 1/2"
          />
        </div>

        {/* اللون */}
        <div className="space-y-2">
          <Label htmlFor="color">اللون</Label>
          <Input
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="مثلاً: Chrome"
          />
        </div>

        {/* الوزن */}
        <div className="space-y-2">
          <Label htmlFor="weight">الوزن (كجم)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={handleChange}
            placeholder="1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* نشط */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>نشط</Label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
          />
        </div>

        {/* مميز */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>مميز</Label>
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
          />
        </div>

        {/* به مخزون */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>به مخزون</Label>
          <Switch
            checked={formData.has_stock}
            onCheckedChange={(checked) => handleSwitchChange('has_stock', checked)}
          />
        </div>
      </div>

      {/* الوصف */}
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="وصف المنتج..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          'إضافة المنتج'
        )}
      </Button>
    </form>
  );
}
