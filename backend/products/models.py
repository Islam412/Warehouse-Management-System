from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

import uuid

class Category(models.Model):
    """فئة المنتج"""
    name = models.CharField(max_length=100, unique=True, verbose_name="الاسم")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="الاسم بالعربية")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, 
                               related_name='children', verbose_name="الفئة الرئيسية")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = "فئة"
        verbose_name_plural = "الفئات"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Brand(models.Model):
    """العلامة التجارية"""
    name = models.CharField(max_length=100, unique=True, verbose_name="الاسم")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="الاسم بالعربية")
    logo = models.ImageField(upload_to='brands/', blank=True, null=True, verbose_name="الشعار")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brands'
        verbose_name = "علامة تجارية"
        verbose_name_plural = "العلامات التجارية"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Unit(models.Model):
    """وحدة القياس"""
    name = models.CharField(max_length=50, unique=True, verbose_name="الاسم")
    name_ar = models.CharField(max_length=50, blank=True, null=True, verbose_name="الاسم بالعربية")
    symbol = models.CharField(max_length=10, blank=True, null=True, verbose_name="الرمز")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    class Meta:
        db_table = 'units'
        verbose_name = "وحدة"
        verbose_name_plural = "الوحدات"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    """المنتج الرئيسي"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=200, verbose_name="اسم المنتج")
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name="اسم المنتج بالعربية")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', 
                                 verbose_name="الفئة")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name='products', 
                              verbose_name="العلامة التجارية")
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name='products', 
                             verbose_name="وحدة القياس")
    
    sku = models.CharField(max_length=50, unique=True, verbose_name="SKU")
    barcode = models.CharField(max_length=50, blank=True, null=True, verbose_name="الباركود")
    
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, 
                                         validators=[MinValueValidator(0)], 
                                         verbose_name="سعر الشراء")
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, 
                                        validators=[MinValueValidator(0)], 
                                        verbose_name="سعر البيع")
    wholesale_price = models.DecimalField(max_digits=12, decimal_places=2, 
                                          validators=[MinValueValidator(0)], 
                                          blank=True, null=True, 
                                          verbose_name="سعر الجملة")
    
    size = models.CharField(max_length=50, blank=True, null=True, verbose_name="المقاس")
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name="اللون")
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, 
                                 verbose_name="الوزن")
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_featured = models.BooleanField(default=False, verbose_name="مميز")
    has_stock = models.BooleanField(default=True, verbose_name="به مخزون")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, 
                                   null=True, related_name='products_created')
    
    class Meta:
        db_table = 'products'
        verbose_name = "منتج"
        verbose_name_plural = "المنتجات"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name', 'sku', 'barcode']),
            models.Index(fields=['category', 'brand']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.brand.name}"
    
    @property
    def profit_margin(self):
        if self.purchase_price > 0:
            return ((self.selling_price - self.purchase_price) / self.purchase_price) * 100
        return 0

class ProductImage(models.Model):
    """صور المنتج"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False, verbose_name="الصورة الرئيسية")
    alt_text = models.CharField(max_length=200, blank=True, null=True, verbose_name="نص بديل")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        verbose_name = "صورة المنتج"
        verbose_name_plural = "صور المنتج"
        ordering = ['order', '-is_primary']
