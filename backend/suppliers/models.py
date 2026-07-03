from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class Supplier(models.Model):
    """نموذج المورد"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=200, verbose_name="اسم المورد")
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name="اسم المورد بالعربية")
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    phone2 = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم هاتف آخر")
    address = models.TextField(blank=True, null=True, verbose_name="العنوان")
    
    # معلومات مالية
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="الرصيد")
    
    # معلومات إضافية
    tax_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="الرقم الضريبي")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='suppliers_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'suppliers'
        verbose_name = "مورد"
        verbose_name_plural = "الموردين"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def total_purchases(self):
        return sum(order.total for order in self.orders.all())
