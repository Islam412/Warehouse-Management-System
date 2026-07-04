'use client';

import { useState, useEffect } from 'react';
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
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ onSuccess, initialData, isEditing = false }: ProductFormProps) {
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
    purchase_price: 0,
    selling_price: 0,
    wholesale_price: 0,
    size: '',
    color: '',
    weight: 0,
    is_active: true,
    is_featured: false,
    has_stock: true,
  });

  const createProduct = useCreateProduct();
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const { data: unitsData } = useUnits();

  // تحميل البيانات الأولية للتعديل
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        name_ar: initialData.name_ar || '',
        description: initialData.description || '',
        category: initialData.category || initialData.category_id || '',
        brand: initialData.brand || initialData.brand_id || '',
        unit: initialData.unit || initialData.unit_id || '',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        purchase_price: initialData.purchase_price || 0,
        selling_price: initialData.selling_price || 0,
        wholesale_price: initialData.wholesale_price || 0,
        size: initialData.size || '',
        color: initialData.color || '',
        weight: initialData.weight || 0,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_featured: initialData.is_featured !== undefined ? initialData.is_featured : false,
        has_stock: initialData.has_stock !== undefined ? initialData.has_stock : true,
      });
    }
  }, [initialData]);

  // التأكد من أن البيانات مصفوفات
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const brands = Array.isArray(brandsData) ? brandsData : [];
  const units = Array.isArray(unitsData) ? unitsData : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
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

    // التحقق من الحقول المطلوبة
    if (!formData.name) {
      toast.error('اسم المنتج مطلوب');
      setIsLoading(false);
      return;
    }
    if (!formData.category) {
      toast.error('الفئة مطلوبة');
      setIsLoading(false);
      return;
    }
    if (!formData.brand) {
      toast.error('العلامة التجارية مطلوبة');
      setIsLoading(false);
      return;
    }
    if (!formData.unit) {
      toast.error('وحدة القياس مطلوبة');
      setIsLoading(false);
      return;
    }
    if (!formData.sku) {
      toast.error('SKU مطلوب');
      setIsLoading(false);
      return;
    }
    if (formData.purchase_price <= 0) {
      toast.error('سعر الشراء يجب أن يكون أكبر من 0');
      setIsLoading(false);
      return;
    }
    if (formData.selling_price <= 0) {
      toast.error('سعر البيع يجب أن يكون أكبر من 0');
      setIsLoading(false);
      return;
    }

    try {
      const data = {
        name: formData.name,
        name_ar: formData.name_ar || '',
        description: formData.description || '',
        category: formData.category,
        brand: formData.brand,
        unit: formData.unit,
        sku: formData.sku,
        barcode: formData.barcode || '',
        purchase_price: formData.purchase_price,
        selling_price: formData.selling_price,
        wholesale_price: formData.wholesale_price || 0,
        size: formData.size || '',
        color: formData.color || '',
        weight: formData.weight || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        has_stock: formData.has_stock,
      };

      await createProduct.mutateAsync(data);
      
      if (!isEditing) {
        setFormData({
          name: '',
          name_ar: '',
          description: '',
          category: '',
          brand: '',
          unit: '',
          sku: '',
          barcode: '',
          purchase_price: 0,
          selling_price: 0,
          wholesale_price: 0,
          size: '',
          color: '',
          weight: 0,
          is_active: true,
          is_featured: false,
          has_stock: true,
        });
      }
      
      onSuccess?.();
      toast.success(isEditing ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
    } catch (error: any) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label>الفئة *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <SelectItem value="no-categories" disabled>لا توجد فئات - أضفها من Admin</SelectItem>
              ) : (
                categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} {cat.name_ar ? `(${cat.name_ar})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>العلامة التجارية *</Label>
          <Select 
            value={formData.brand} 
            onValueChange={(value) => handleSelectChange('brand', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر العلامة" />
            </SelectTrigger>
            <SelectContent>
              {brands.length === 0 ? (
                <SelectItem value="no-brands" disabled>لا توجد علامات - أضفها من Admin</SelectItem>
              ) : (
                brands.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name} {brand.name_ar ? `(${brand.name_ar})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>وحدة القياس *</Label>
          <Select 
            value={formData.unit} 
            onValueChange={(value) => handleSelectChange('unit', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الوحدة" />
            </SelectTrigger>
            <SelectContent>
              {units.length === 0 ? (
                <SelectItem value="no-units" disabled>لا توجد وحدات - أضفها من Admin</SelectItem>
              ) : (
                units.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="purchase_price">سعر الشراء *</Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchase_price || ''}
            onChange={handleChange}
            placeholder="50.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="selling_price">سعر البيع *</Label>
          <Input
            id="selling_price"
            name="selling_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.selling_price || ''}
            onChange={handleChange}
            placeholder="80.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wholesale_price">سعر الجملة</Label>
          <Input
            id="wholesale_price"
            name="wholesale_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.wholesale_price || ''}
            onChange={handleChange}
            placeholder="65.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="weight">الوزن (كجم)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.01"
            min="0"
            value={formData.weight || ''}
            onChange={handleChange}
            placeholder="1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label className="cursor-pointer">نشط</Label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label className="cursor-pointer">مميز</Label>
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label className="cursor-pointer">به مخزون</Label>
          <Switch
            checked={formData.has_stock}
            onCheckedChange={(checked) => handleSwitchChange('has_stock', checked)}
          />
        </div>
      </div>

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
          isEditing ? 'تحديث المنتج' : 'إضافة المنتج'
        )}
      </Button>
    </form>
  );
}
