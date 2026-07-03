from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from products.models import Product
from accounts.models import User

class Warehouse(models.Model):
    """المستودع / المخزن"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="اسم المخزن")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="اسم المخزن بالعربية")
    location = models.TextField(blank=True, null=True, verbose_name="الموقع")
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, 
                                null=True, related_name='managed_warehouses', 
                                verbose_name="المدير")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'warehouses'
        verbose_name = "مخزن"
        verbose_name_plural = "المخازن"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Stock(models.Model):
    """المخزون الحالي"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='stocks')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='stocks')
    
    quantity = models.DecimalField(max_digits=12, decimal_places=2, 
                                   validators=[MinValueValidator(0)], 
                                   default=0, verbose_name="الكمية الحالية")
    min_quantity = models.DecimalField(max_digits=12, decimal_places=2, 
                                       validators=[MinValueValidator(0)], 
                                       default=0, verbose_name="الحد الأدنى للتنبيه")
    max_quantity = models.DecimalField(max_digits=12, decimal_places=2, 
                                       validators=[MinValueValidator(0)], 
                                       default=0, verbose_name="الحد الأقصى")
    
    reserved_quantity = models.DecimalField(max_digits=12, decimal_places=2, 
                                            validators=[MinValueValidator(0)], 
                                            default=0, verbose_name="الكمية المحجوزة")
    
    last_updated = models.DateTimeField(auto_now=True, verbose_name="آخر تحديث")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, 
                                   null=True, related_name='stock_updates')
    
    class Meta:
        db_table = 'stocks'
        verbose_name = "مخزون"
        verbose_name_plural = "المخزون"
        unique_together = ['product', 'warehouse']
    
    def __str__(self):
        return f"{self.product.name} - {self.warehouse.name}: {self.quantity}"
    
    @property
    def available_quantity(self):
        """الكمية المتاحة (الإجمالي - المحجوز)"""
        return self.quantity - self.reserved_quantity
    
    @property
    def is_low_stock(self):
        """هل المخزون منخفض؟"""
        return self.quantity <= self.min_quantity
    
    @property
    def is_over_stock(self):
        """هل المخزون زائد عن الحد؟"""
        return self.max_quantity > 0 and self.quantity > self.max_quantity


