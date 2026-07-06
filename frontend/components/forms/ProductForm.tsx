'use client';

import { useState, useEffect } from 'react';
import { useCreateProduct, useUpdateProduct, useCategories, useBrands, useUnits } from '@/hooks/useProducts';
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
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ onSuccess, initialData, isEditing = false }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [hasStock, setHasStock] = useState<boolean>(true);
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
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { data: unitsData, isLoading: unitsLoading } = useUnits();

  // التأكد من أن البيانات مصفوفات
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const brands = Array.isArray(brandsData) ? brandsData : [];
  const units = Array.isArray(unitsData) ? unitsData : [];

  console.log('📊 Categories in form:', categories);
  console.log('📊 Brands in form:', brands);
  console.log('📊 Units in form:', units);

  // تحميل البيانات عند التعديل
  useEffect(() => {
    console.log('🔄 Loading product data:', { isEditing, initialData });
    
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        name_ar: initialData.name_ar || '',
        description: initialData.description || '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        unit: initialData.unit || '',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        purchase_price: initialData.purchase_price?.toString() || '',
        selling_price: initialData.selling_price?.toString() || '',
        wholesale_price: initialData.wholesale_price?.toString() || '',
        size: initialData.size || '',
        color: initialData.color || '',
        weight: initialData.weight?.toString() || '',
      });
      setIsActive(initialData.is_active !== false);
      setIsFeatured(initialData.is_featured || false);
      setHasStock(initialData.has_stock !== false);
    } else if (!isEditing) {
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
      });
      setIsActive(true);
      setIsFeatured(false);
      setHasStock(true);
    }
  }, [initialData, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`📌 Select ${name} changed to:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('📤 Form data before submit:', formData);

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

    const purchasePrice = parseFloat(formData.purchase_price) || 0;
    const sellingPrice = parseFloat(formData.selling_price) || 0;

    if (purchasePrice <= 0) {
      toast.error('سعر الشراء يجب أن يكون أكبر من 0');
      setIsLoading(false);
      return;
    }
    if (sellingPrice <= 0) {
      toast.error('سعر البيع يجب أن يكون أكبر من 0');
      setIsLoading(false);
      return;
    }

    // تجهيز البيانات للإرسال
    const data = {
      name: formData.name.trim(),
      name_ar: formData.name_ar?.trim() || '',
      description: formData.description?.trim() || '',
      category: formData.category,
      brand: formData.brand,
      unit: formData.unit,
      sku: formData.sku.trim(),
      barcode: formData.barcode?.trim() || '',
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      wholesale_price: parseFloat(formData.wholesale_price) || 0,
      size: formData.size?.trim() || '',
      color: formData.color?.trim() || '',
      weight: parseFloat(formData.weight) || 0,
      is_active: isActive,
      is_featured: isFeatured,
      has_stock: hasStock,
    };

    console.log('📤 Submitting product data:', data);

    try {
      if (isEditing && initialData) {
        console.log(`✏️ Updating product with ID: ${initialData.id}`);
        await updateProduct.mutateAsync({ id: initialData.id, data });
      } else {
        console.log('➕ Creating new product');
        await createProduct.mutateAsync(data);
        // إعادة تعيين النموذج
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
        });
        setIsActive(true);
        setIsFeatured(false);
        setHasStock(true);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error saving product:', error);
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

  if (categoriesLoading || brandsLoading || unitsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="mr-2 text-gray-500">جاري تحميل البيانات...</span>
      </div>
    );
  }

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

      {/* الفئات والعلامات والوحدات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* الفئة */}
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
                <SelectItem value="no-categories" disabled>لا توجد فئات</SelectItem>
              ) : (
                categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} {cat.name_ar ? `(${cat.name_ar})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="text-xs text-amber-600">⚠️ لا توجد فئات. أضف فئات من Django Admin</p>
          )}
        </div>

        {/* العلامة التجارية */}
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
                <SelectItem value="no-brands" disabled>لا توجد علامات</SelectItem>
              ) : (
                brands.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name} {brand.name_ar ? `(${brand.name_ar})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {brands.length === 0 && (
            <p className="text-xs text-amber-600">⚠️ لا توجد علامات تجارية. أضف علامات من Django Admin</p>
          )}
        </div>

        {/* وحدة القياس */}
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
                <SelectItem value="no-units" disabled>لا توجد وحدات</SelectItem>
              ) : (
                units.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} {unit.name_ar ? `(${unit.name_ar})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {units.length === 0 && (
            <p className="text-xs text-amber-600">⚠️ لا توجد وحدات قياس. أضف وحدات من Django Admin</p>
          )}
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
            value={formData.purchase_price}
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
            value={formData.selling_price}
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
            value={formData.wholesale_price}
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
            value={formData.weight}
            onChange={handleChange}
            placeholder="1.5"
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

      {/* Switches باستخدام Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">مميز</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isFeatured ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                isFeatured && "bg-amber-500 hover:bg-amber-600 text-white"
              )}
              onClick={() => setIsFeatured(true)}
            >
              <Check className="w-4 h-4 ml-1" />
              مميز
            </Button>
            <Button
              type="button"
              variant={!isFeatured ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                !isFeatured && "bg-gray-500 hover:bg-gray-600 text-white"
              )}
              onClick={() => setIsFeatured(false)}
            >
              <X className="w-4 h-4 ml-1" />
              عادي
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">به مخزون</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={hasStock ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                hasStock && "bg-blue-500 hover:bg-blue-600 text-white"
              )}
              onClick={() => setHasStock(true)}
            >
              <Check className="w-4 h-4 ml-1" />
              متوفر
            </Button>
            <Button
              type="button"
              variant={!hasStock ? "default" : "outline"}
              className={cn(
                "flex-1 transition-all",
                !hasStock && "bg-red-500 hover:bg-red-600 text-white"
              )}
              onClick={() => setHasStock(false)}
            >
              <X className="w-4 h-4 ml-1" />
              غير متوفر
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
          isEditing ? 'تحديث المنتج' : 'إضافة المنتج'
        )}
      </Button>
    </form>
  );
}
