from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class Notification(models.Model):
    """نموذج الإشعارات"""
    NOTIFICATION_TYPES = (
        ('info', 'معلومات'),
        ('success', 'نجاح'),
        ('warning', 'تحذير'),
        ('error', 'خطأ'),
        ('stock_alert', 'تنبيه مخزون'),
        ('payment_due', 'موعد دفع'),
        ('collection_due', 'موعد تحصيل'),
        ('order_received', 'استلام طلب'),
        ('system', 'نظام'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name="العنوان")
    message = models.TextField(verbose_name="الرسالة")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info', verbose_name="نوع الإشعار")
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name="المستخدم")
    
    is_read = models.BooleanField(default=False, verbose_name="مقروء")
    is_sent = models.BooleanField(default=False, verbose_name="تم الإرسال")
    
    link = models.CharField(max_length=500, blank=True, null=True, verbose_name="الرابط")
    
    reference_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="نوع المرجع")
    reference_id = models.UUIDField(blank=True, null=True, verbose_name="معرف المرجع")
    extra_data = models.JSONField(default=dict, blank=True, verbose_name="بيانات إضافية")
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True, verbose_name="تاريخ القراءة")
    sent_at = models.DateTimeField(blank=True, null=True, verbose_name="تاريخ الإرسال")
    
    class Meta:
        db_table = 'notifications'
        verbose_name = "إشعار"
        verbose_name_plural = "الإشعارات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
    
    def mark_as_sent(self):
        """تحديد الإشعار كمرسل"""
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save()

class NotificationPreference(models.Model):
    """تفضيلات الإشعارات للمستخدم"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    enable_notifications = models.BooleanField(default=True, verbose_name="تفعيل الإشعارات")
    enable_email = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني")
    enable_push = models.BooleanField(default=True, verbose_name="إشعارات التطبيق")
    
    stock_alert = models.BooleanField(default=True, verbose_name="تنبيهات المخزون")
    payment_due = models.BooleanField(default=True, verbose_name="مواعيد الدفع")
    collection_due = models.BooleanField(default=True, verbose_name="مواعيد التحصيل")
    order_received = models.BooleanField(default=True, verbose_name="استلام الطلبات")
    system_updates = models.BooleanField(default=True, verbose_name="تحديثات النظام")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = "تفضيلات الإشعارات"
        verbose_name_plural = "تفضيلات الإشعارات"
    
    def __str__(self):
        return f"Preferences - {self.user.username}"

class NotificationLog(models.Model):
    """سجل إرسال الإشعارات"""
    CHANNELS = (
        ('email', 'بريد إلكتروني'),
        ('push', 'إشعار تطبيق'),
        ('sms', 'رسالة نصية'),
        ('whatsapp', 'واتساب'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    channel = models.CharField(max_length=20, choices=CHANNELS, verbose_name="قناة الإرسال")
    status = models.CharField(max_length=20, default='pending', verbose_name="الحالة")
    response = models.TextField(blank=True, null=True, verbose_name="الاستجابة")
    error = models.TextField(blank=True, null=True, verbose_name="الخطأ")
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(blank=True, null=True, verbose_name="تاريخ الإرسال")
    
    class Meta:
        db_table = 'notification_logs'
        verbose_name = "سجل إشعار"
        verbose_name_plural = "سجل الإشعارات"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification.title} - {self.get_channel_display()}"
