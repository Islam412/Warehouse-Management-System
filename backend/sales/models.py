from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from decimal import Decimal
from accounts.models import User
from customers.models import Customer
from products.models import Product

class Invoice(models.Model):
    """فاتورة المبيعات"""
    INVOICE_STATUS = (
        ('draft', 'مسودة'),
        ('confirmed', 'مؤكدة'),
        ('paid', 'مدفوعة'),
        ('partially_paid', 'مدفوعة جزئياً'),
        ('cancelled', 'ملغية'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=20, unique=True, verbose_name="رقم الفاتورة")
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='invoices', verbose_name="العميل")
    
    date = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الفاتورة")
    due_date = models.DateField(verbose_name="تاريخ الاستحقاق")
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="المجموع")
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الخصم")
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الضريبة")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الإجمالي")
    
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="المدفوع")
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="المتبقي")
    
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default='draft', verbose_name="الحالة")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sales_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        verbose_name = "فاتورة"
        verbose_name_plural = "الفواتير"
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.invoice_number} - {self.customer.name}"
    
    def calculate_total(self):
        """حساب الإجمالي"""
        self.subtotal = sum(item.total for item in self.items.all())
        self.total = self.subtotal - self.discount + self.tax
        self.remaining_amount = self.total - self.paid_amount
        self.save()
        
        # تحديث حالة الفاتورة
        if self.remaining_amount <= 0:
            self.status = 'paid'
        elif self.paid_amount > 0:
            self.status = 'partially_paid'
        self.save()
    
    @property
    def is_overdue(self):
        """هل الفاتورة متأخرة؟"""
        from django.utils import timezone
        return self.status != 'paid' and timezone.now().date() > self.due_date

class InvoiceItem(models.Model):
    """بنود الفاتورة"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='sales_items')
    
    quantity = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'invoice_items'
        verbose_name = "بند فاتورة"
        verbose_name_plural = "بنود الفاتورة"
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    def save(self, *args, **kwargs):
        self.total = (self.quantity * self.unit_price) - self.discount + self.tax
        super().save(*args, **kwargs)
        self.invoice.calculate_total()

