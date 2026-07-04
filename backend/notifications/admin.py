from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Notification, NotificationPreference, NotificationLog

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """إدارة الإشعارات"""
    list_display = ['title', 'user', 'notification_type_display', 'is_read_display', 'is_sent_display', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_sent', 'created_at']
    search_fields = ['title', 'message', 'user__username', 'user__email']
    readonly_fields = ['id', 'created_at', 'read_at', 'sent_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (_('معلومات الإشعار'), {
            'fields': ('id', 'title', 'message', 'notification_type')
        }),
        (_('المستخدم'), {
            'fields': ('user',)
        }),
        (_('الحالة'), {
            'fields': ('is_read', 'is_sent', 'read_at', 'sent_at')
        }),
        (_('المرجع'), {
            'fields': ('link', 'reference_type', 'reference_id', 'extra_data')
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def notification_type_display(self, obj):
        colors = {
            'info': '#17a2b8',
            'success': '#28a745',
            'warning': '#ffc107',
            'error': '#dc3545',
            'stock_alert': '#fd7e14',
            'payment_due': '#6f42c1',
            'collection_due': '#20c997',
            'order_received': '#28a745',
            'system': '#6c757d',
        }
        color = colors.get(obj.notification_type, '#6c757d')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, obj.get_notification_type_display())
    notification_type_display.short_description = _('النوع')
    
    def is_read_display(self, obj):
        if obj.is_read:
            return format_html('<span style="color: #28a745;">✅ مقروء</span>')
        return format_html('<span style="color: #dc3545;">❌ غير مقروء</span>')
    is_read_display.short_description = _('الحالة')
    
    def is_sent_display(self, obj):
        if obj.is_sent:
            return format_html('<span style="color: #28a745;">✅ مرسل</span>')
        return format_html('<span style="color: #ffc107;">⏳ معلق</span>')
    is_sent_display.short_description = _('الإرسال')
    
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_sent']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'تم تحديد {updated} إشعار(إشعارات) كمقروءة.')
    mark_as_read.short_description = _('تحديد كمقروء')
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'تم تحديد {updated} إشعار(إشعارات) كغير مقروءة.')
    mark_as_unread.short_description = _('تحديد كغير مقروء')
    
    def mark_as_sent(self, request, queryset):
        updated = queryset.update(is_sent=True)
        self.message_user(request, f'تم تحديد {updated} إشعار(إشعارات) كمرسلة.')
    mark_as_sent.short_description = _('تحديد كمرسلة')

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """إدارة تفضيلات الإشعارات"""
    list_display = ['user', 'enable_notifications_display', 'enable_email', 'enable_push']
    list_filter = ['enable_notifications', 'enable_email', 'enable_push']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['user']
    
    def enable_notifications_display(self, obj):
        return format_html(
            '<span style="color: {};">{}</span>',
            '#28a745' if obj.enable_notifications else '#dc3545',
            '✅ مفعل' if obj.enable_notifications else '❌ معطل'
        )
    enable_notifications_display.short_description = _('الإشعارات')

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    """إدارة سجل الإشعارات"""
    list_display = ['notification', 'channel_display', 'status_display', 'created_at']
    list_filter = ['channel', 'status', 'created_at']
    search_fields = ['notification__title', 'notification__user__username']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']
    
    def channel_display(self, obj):
        return obj.get_channel_display()
    channel_display.short_description = _('القناة')
    
    def status_display(self, obj):
        colors = {
            'pending': '#ffc107',
            'sent': '#28a745',
            'failed': '#dc3545',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.status)
    status_display.short_description = _('الحالة')
