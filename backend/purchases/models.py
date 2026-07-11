from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from decimal import Decimal
from accounts.models import User
from suppliers.models import Supplier
from products.models import Product
from inventory.models import Warehouse


class PurchaseOrder(models.Model):
    """أمر الشراء"""
    ORDER_STATUS = (
        ('draft', 'مسودة'),
        ('ordered', 'تم الطلب'),
        ('received', 'تم الاستلام'),
        ('cancelled', 'ملغي'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, verbose_name="رقم الطلب")
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='orders', verbose_name="المورد")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='purchase_orders', verbose_name="المخزن")
    
    order_date = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الطلب")
    expected_date = models.DateField(verbose_name="تاريخ الاستلام المتوقع")
    received_date = models.DateTimeField(blank=True, null=True, verbose_name="تاريخ الاستلام الفعلي")
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="المجموع")
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الخصم")
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الضريبة")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الإجمالي")
    
    # ✅ إضافة حقل المبلغ المدفوع لحساب المستحقات
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="المبلغ المدفوع")
    
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='draft', verbose_name="الحالة")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='purchases_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'purchase_orders'
        verbose_name = "أمر شراء"
        verbose_name_plural = "أوامر الشراء"
        ordering = ['-order_date']
    
    def __str__(self):
        return f"{self.order_number} - {self.supplier.name}"
    
    def calculate_total(self):
        """حساب الإجمالي"""
        self.subtotal = sum(item.total for item in self.items.all())
        self.total = self.subtotal - self.discount + self.tax
        self.save()
    
    @property
    def remaining_amount(self):
        """المبلغ المتبقي للدفع"""
        return self.total - self.paid_amount
class PurchaseItem(models.Model):
    """بنود أمر الشراء"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='purchase_items')
    
    quantity = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    received_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الكمية المستلمة")
    
    paid_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0, 
        verbose_name="المبلغ المدفوع"
    )
    class Meta:
        db_table = 'purchase_items'
        verbose_name = "بند شراء"
        verbose_name_plural = "بنود الشراء"
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    def save(self, *args, **kwargs):
        self.total = (self.quantity * self.unit_price) - self.discount + self.tax
        super().save(*args, **kwargs)
        self.order.calculate_total()
    
    @property
    def remaining_quantity(self):
        """الكمية المتبقية للاستلام"""
        return self.quantity - self.received_quantity
