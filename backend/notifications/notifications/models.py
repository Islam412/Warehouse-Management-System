from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('info', 'معلومات'),
        ('success', 'نجاح'),
        ('warning', 'تحذير'),
        ('error', 'خطأ'),
        ('payment_due', 'موعد دفع'),
        ('collection_due', 'موعد تحصيل'),
        ('shipment_due', 'موعد شحنة'),
        ('stock_alert', 'تنبيه مخزون'),
        ('system', 'نظام'),
    )
    
    PRIORITY = (
        ('low', 'منخفض'),
        ('medium', 'متوسط'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name="العنوان")
    message = models.TextField(verbose_name="الرسالة")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    priority = models.CharField(max_length=10, choices=PRIORITY, default='medium')
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications')
    
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reference_id = models.UUIDField(blank=True, null=True)
    extra_data = models.JSONField(default=dict, blank=True)
    
    due_date = models.DateTimeField(blank=True, null=True, verbose_name="تاريخ الاستحقاق")
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
    
    def mark_as_sent(self):
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save()
