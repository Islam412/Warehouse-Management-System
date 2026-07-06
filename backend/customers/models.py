from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class Customer(models.Model):
    """نموذج العميل"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=200, verbose_name="اسم العميل")
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name="اسم العميل بالعربية")
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    phone2 = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم هاتف آخر")
    address = models.TextField(blank=True, null=True, verbose_name="العنوان")
    
    # معلومات مالية مع حدود
    balance = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        validators=[MinValueValidator(-9999999999.99), MaxValueValidator(9999999999.99)],
        verbose_name="الرصيد"
    )
    credit_limit = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(9999999999.99)],
        verbose_name="حد الائتمان"
    )
    
    # معلومات إضافية
    tax_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="الرقم الضريبي")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_vip = models.BooleanField(default=False, verbose_name="عميل مميز")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='customers_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customers'
        verbose_name = "عميل"
        verbose_name_plural = "العملاء"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def outstanding_balance(self):
        """الرصيد المستحق"""
        return self.balance
    
    @property
    def total_invoices(self):
        return self.invoices.count()
    
    @property
    def total_purchases(self):
        from django.db.models import Sum
        return self.invoices.aggregate(total=Sum('total'))['total'] or 0
    
    @property
    def total_paid(self):
        from django.db.models import Sum
        return self.invoices.aggregate(total=Sum('paid_amount'))['total'] or 0
