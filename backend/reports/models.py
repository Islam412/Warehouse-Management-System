from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

class ReportLog(models.Model):
    """سجل التقارير - لتتبع التقارير التي تم إنشاؤها"""
    REPORT_TYPES = (
        ('sales', 'مبيعات'),
        ('purchases', 'مشتريات'),
        ('inventory', 'مخزون'),
        ('customers', 'عملاء'),
        ('suppliers', 'موردين'),
        ('finance', 'مالية'),
        ('profit_loss', 'أرباح وخسائر'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES, verbose_name="نوع التقرير")
    title = models.CharField(max_length=200, verbose_name="عنوان التقرير")
    filters = models.JSONField(default=dict, blank=True, verbose_name="الفلاتر")
    file_path = models.CharField(max_length=500, blank=True, null=True, verbose_name="مسار الملف")
    format = models.CharField(max_length=10, default='json', verbose_name="صيغة التقرير")
    
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_logs'
        verbose_name = "سجل تقرير"
        verbose_name_plural = "سجل التقارير"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
