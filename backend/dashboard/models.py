from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class DashboardWidget(models.Model):
    """عناصر لوحة التحكم القابلة للتخصيص"""
    WIDGET_TYPES = (
        ('summary', 'ملخص عام'),
        ('sales', 'المبيعات'),
        ('purchases', 'المشتريات'),
        ('inventory', 'المخزون'),
        ('finance', 'المالية'),
        ('customers', 'العملاء'),
        ('suppliers', 'الموردين'),
        ('products', 'المنتجات'),
        ('chart', 'رسم بياني'),
        ('table', 'جدول'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name="عنوان العنصر")
    widget_type = models.CharField(max_length=50, choices=WIDGET_TYPES, verbose_name="نوع العنصر")
    config = models.JSONField(default=dict, verbose_name="الإعدادات")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_widgets', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dashboard_widgets'
        verbose_name = "عنصر لوحة التحكم"
        verbose_name_plural = "عناصر لوحة التحكم"
        ordering = ['order']
    
    def __str__(self):
        return f"{self.title} - {self.get_widget_type_display()}"