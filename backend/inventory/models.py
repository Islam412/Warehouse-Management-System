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

