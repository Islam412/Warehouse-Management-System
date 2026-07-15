from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import PurchaseOrder, PurchaseItem


class PurchaseItemInline(admin.TabularInline):
    """عرض بنود أمر الشراء داخل الأمر"""
    model = PurchaseItem
    extra = 1
    fields = ['product', 'quantity', 'unit_price', 'discount', 'tax', 'total', 'received_quantity']
    readonly_fields = ['total']
    raw_id_fields = ['product']


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    """إدارة أوامر الشراء"""
    list_display = ['order_number', 'supplier', 'warehouse', 'total_display', 
                   'status_display', 'expected_date', 'order_date']
    list_filter = ['status', 'order_date', 'expected_date']
    search_fields = ['order_number', 'supplier__name', 'supplier__phone']
    readonly_fields = ['id', 'order_number', 'order_date', 'subtotal', 'total', 
                      'received_date', 'created_at', 'updated_at']
    inlines = [PurchaseItemInline]
    ordering = ['-order_date']
    
    fieldsets = (
        (_('معلومات الأمر'), {
            'fields': ('id', 'order_number', 'supplier', 'warehouse', 'order_date')
        }),
        (_('التواريخ'), {
            'fields': ('expected_date', 'received_date')
        }),
        (_('المبالغ'), {
            'fields': ('subtotal', 'discount', 'tax', 'total')
        }),
        (_('حالة الأمر'), {
            'fields': ('status',)
        }),
        (_('معلومات إضافية'), {
            'fields': ('notes',)
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def total_display(self, obj):
        """عرض الإجمالي بشكل منسق - ✅ تم الإصلاح"""
        try:
            total = float(obj.total) if obj.total else 0
            return format_html('<span style="font-weight: bold;">{:.2f} جنيه</span>', total)
        except (ValueError, TypeError):
            return format_html('<span style="font-weight: bold;">0.00 جنيه</span>')
    total_display.short_description = _('الإجمالي')
    total_display.admin_order_field = 'total'
    
    def status_display(self, obj):
        """عرض الحالة بشكل منسق"""
        colors = {
            'draft': '#6c757d',
            'ordered': '#17a2b8',
            'received': '#28a745',
            'cancelled': '#dc3545',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html('<span style="color: {};">{}</span>', color, obj.get_status_display())
    status_display.short_description = _('الحالة')
    
    actions = ['mark_as_ordered', 'mark_as_received', 'mark_as_cancelled']
    
    def mark_as_ordered(self, request, queryset):
        updated = queryset.filter(status='draft').update(status='ordered')
        self.message_user(request, f'تم تحديث {updated} أمر(أوامر) إلى "تم الطلب".')
    mark_as_ordered.short_description = _('تحديد كـ "تم الطلب"')
    
    def mark_as_received(self, request, queryset):
        updated = queryset.filter(status='ordered').update(status='received')
        self.message_user(request, f'تم تحديث {updated} أمر(أوامر) إلى "تم الاستلام".')
    mark_as_received.short_description = _('تحديد كـ "تم الاستلام"')
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.filter(status__in=['draft', 'ordered']).update(status='cancelled')
        self.message_user(request, f'تم إلغاء {updated} أمر(أوامر).')
    mark_as_cancelled.short_description = _('تحديد كـ "ملغي"')


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    """إدارة بنود الشراء"""
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_display', 'received_quantity']
    list_filter = ['order__status']
    search_fields = ['product__name', 'product__sku', 'order__order_number']
    readonly_fields = ['id', 'total']
    ordering = ['-order__order_date']
    
    def total_display(self, obj):
        """عرض الإجمالي بشكل منسق - ✅ تم الإصلاح"""
        try:
            total = float(obj.total) if obj.total else 0
            return format_html('<span style="font-weight: bold;">{:.2f} جنيه</span>', total)
        except (ValueError, TypeError):
            return format_html('<span style="font-weight: bold;">0.00 جنيه</span>')
    total_display.short_description = _('الإجمالي')