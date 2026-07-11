from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class Notification(models.Model):
    """نموذج الإشعارات الذكي"""
    
    NOTIFICATION_TYPES = (
        ('info', 'معلومات'),
        ('success', 'نجاح'),
        ('warning', 'تحذير'),
        ('error', 'خطأ'),
        ('payment_due', 'موعد دفع'),          # إرسال قسط لشركة/مندوب
        ('collection_due', 'موعد تحصيل'),    # استلام قسط من عميل
        ('shipment_due', 'موعد شحنة'),       # موعد استلام شحنة
        ('shipment_received', 'تم استلام شحنة'),  # تسليم شحنة
        ('stock_alert', 'تنبيه مخزون'),       # اقتراب نفاذ منتج
        ('system', 'نظام'),
        ('order_created', 'طلب جديد'),
        ('order_confirmed', 'تم تأكيد الطلب'),
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
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='info')
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
            models.Index(fields=['notification_type', 'is_read']),
            models.Index(fields=['due_date']),
        ]
        verbose_name = "إشعار"
        verbose_name_plural = "الإشعارات"
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_sent(self):
        """تحديد الإشعار كمرسل"""
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at'])
    
    @classmethod
    def create_smart_notification(cls, title, message, notification_type, user, 
                                   priority='medium', reference_type=None, 
                                   reference_id=None, due_date=None, extra_data=None):
        """إنشاء إشعار ذكي مع التحقق من التكرار"""
        # التحقق من عدم وجود إشعار مكرر
        existing = cls.objects.filter(
            reference_type=reference_type,
            reference_id=reference_id,
            notification_type=notification_type,
            created_at__date=timezone.now().date()
        )
        
        if existing.exists():
            return existing.first()
        
        return cls.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            user=user,
            reference_type=reference_type,
            reference_id=reference_id,
            due_date=due_date,
            extra_data=extra_data or {},
        )


class NotificationPreference(models.Model):
    """تفضيلات الإشعارات للمستخدم"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='notification_preferences')
    
    enable_notifications = models.BooleanField(default=True, verbose_name="تفعيل الإشعارات")
    enable_email = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني")
    enable_push = models.BooleanField(default=True, verbose_name="إشعارات التطبيق")
    
    stock_alert = models.BooleanField(default=True, verbose_name="تنبيهات المخزون")
    payment_due = models.BooleanField(default=True, verbose_name="مواعيد الدفع")
    collection_due = models.BooleanField(default=True, verbose_name="مواعيد التحصيل")
    shipment_due = models.BooleanField(default=True, verbose_name="مواعيد الشحنات")
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