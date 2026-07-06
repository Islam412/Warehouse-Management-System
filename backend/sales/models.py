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
    invoice_number = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="رقم الفاتورة")
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
        return f"{self.invoice_number or 'No Number'} - {self.customer.name}"
    
    def save(self, *args, **kwargs):
        # إنشاء رقم فاتورة إذا لم يكن موجوداً
        if not self.invoice_number:
            from django.utils import timezone
            today = timezone.now()
            year = today.strftime('%Y')
            month = today.strftime('%m')
            count = Invoice.objects.filter(
                date__year=year, 
                date__month=month
            ).count() + 1
            self.invoice_number = f"INV-{year}{month}-{str(count).zfill(4)}"
        
        # حفظ الفاتورة أولاً (للتأكد من وجود ID)
        super().save(*args, **kwargs)
        
        # حساب الإجمالي بعد الحفظ (عندما يكون هناك ID)
        self.update_totals()
    
    def update_totals(self):
        """تحديث الإجماليات بعد حفظ البنود"""
        # التأكد من وجود ID قبل الوصول إلى items
        if self.pk:
            self.subtotal = sum(item.total for item in self.items.all())
            self.total = self.subtotal - self.discount + self.tax
            self.remaining_amount = self.total - self.paid_amount
            
            # تحديث حالة الفاتورة
            if self.remaining_amount <= 0:
                self.status = 'paid'
            elif self.paid_amount > 0:
                self.status = 'partially_paid'
            
            # حفظ التحديثات بدون إعادة استدعاء save() لتجنب الحلقات اللانهائية
            super().save(update_fields=['subtotal', 'total', 'remaining_amount', 'status'])
    
    def calculate_total(self):
        """حساب الإجمالي - استدعاء من الخارج"""
        self.update_totals()
    
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
        # تحديث إجمالي الفاتورة بعد حفظ البند
        self.invoice.update_totals()

class Payment(models.Model):
    """المدفوعات"""
    PAYMENT_METHODS = (
        ('cash', 'نقدي'),
        ('card', 'بطاقة'),
        ('bank_transfer', 'تحويل بنكي'),
        ('cheque', 'شيك'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = "دفعة"
        verbose_name_plural = "المدفوعات"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.amount}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # تحديث المدفوعات في الفاتورة
        self.invoice.paid_amount = sum(p.amount for p in self.invoice.payments.all())
        self.invoice.remaining_amount = self.invoice.total - self.invoice.paid_amount
        if self.invoice.remaining_amount <= 0:
            self.invoice.status = 'paid'
        elif self.invoice.paid_amount > 0:
            self.invoice.status = 'partially_paid'
        self.invoice.save(update_fields=['paid_amount', 'remaining_amount', 'status'])

class Return(models.Model):
    """مرتجعات المبيعات"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name='returns')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='returns')
    
    quantity = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    reason = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='returns')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'returns'
        verbose_name = "مرتجع"
        verbose_name_plural = "المرتجعات"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.product.name}"
