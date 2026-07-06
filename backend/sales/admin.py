from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Invoice, InvoiceItem, Payment, Return

class InvoiceItemInline(admin.TabularInline):
    """عرض بنود الفاتورة داخل الفاتورة"""
    model = InvoiceItem
    extra = 1
    fields = ['product', 'quantity', 'unit_price', 'total']
    readonly_fields = ['total']

class PaymentInline(admin.TabularInline):
    """عرض المدفوعات داخل الفاتورة"""
    model = Payment
    extra = 0
    fields = ['amount', 'payment_method', 'reference', 'created_at']
    readonly_fields = ['created_at']
    max_num = 10

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """إدارة الفواتير"""
    list_display = ['invoice_number', 'customer', 'total_display', 'status_display', 
                   'due_date', 'is_overdue_display', 'created_at']
    list_filter = ['status', 'date', 'due_date']
    search_fields = ['invoice_number', 'customer__name', 'customer__phone']
    readonly_fields = ['id', 'invoice_number', 'date', 'subtotal', 'total', 
                      'paid_amount', 'remaining_amount', 'created_at', 'updated_at']
    inlines = [InvoiceItemInline, PaymentInline]
    ordering = ['-date']
    
    fieldsets = (
        (_('معلومات الفاتورة'), {
            'fields': ('id', 'invoice_number', 'customer', 'date', 'due_date')
        }),
        (_('المبالغ'), {
            'fields': ('subtotal', 'discount', 'tax', 'total', 'paid_amount', 'remaining_amount')
        }),
        (_('حالة الفاتورة'), {
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
        """عرض الإجمالي بشكل منسق"""
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
            'confirmed': '#17a2b8',
            'paid': '#28a745',
            'partially_paid': '#ffc107',
            'cancelled': '#dc3545',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html('<span style="color: {};">{}</span>', color, obj.get_status_display())
    status_display.short_description = _('الحالة')
    
    def is_overdue_display(self, obj):
        """عرض حالة التأخير"""
        if obj.is_overdue:
            return format_html('<span style="color: #dc3545;">🔴 متأخرة</span>')
        return format_html('<span style="color: #28a745;">✅ في الموعد</span>')
    is_overdue_display.short_description = _('حالة التأخير')
    
    actions = ['confirm_invoices', 'cancel_invoices']
    
    def confirm_invoices(self, request, queryset):
        """تأكيد الفواتير المحددة"""
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'تم تأكيد {updated} فاتورة(فواتير).')
    confirm_invoices.short_description = _('تأكيد الفواتير المحددة')
    
    def cancel_invoices(self, request, queryset):
        """إلغاء الفواتير المحددة"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'تم إلغاء {updated} فاتورة(فواتير).')
    cancel_invoices.short_description = _('إلغاء الفواتير المحددة')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """إدارة المدفوعات"""
    list_display = ['invoice', 'amount_display', 'payment_method', 'reference', 'created_at']
    list_filter = ['payment_method', 'created_at']
    search_fields = ['invoice__invoice_number', 'reference']
    readonly_fields = ['id', 'created_at', 'created_by']
    ordering = ['-created_at']
    
    def amount_display(self, obj):
        try:
            amount = float(obj.amount) if obj.amount else 0
            return format_html('<span style="font-weight: bold;">{:.2f} جنيه</span>', amount)
        except (ValueError, TypeError):
            return format_html('<span style="font-weight: bold;">0.00 جنيه</span>')
    amount_display.short_description = _('المبلغ')

@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    """إدارة المرتجعات"""
    list_display = ['invoice', 'product', 'quantity', 'amount_display', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['invoice__invoice_number', 'product__name', 'reason']
    readonly_fields = ['id', 'created_at', 'created_by']
    ordering = ['-created_at']
    
    def amount_display(self, obj):
        try:
            amount = float(obj.amount) if obj.amount else 0
            return format_html('<span style="font-weight: bold;">{:.2f} جنيه</span>', amount)
        except (ValueError, TypeError):
            return format_html('<span style="font-weight: bold;">0.00 جنيه</span>')
    amount_display.short_description = _('المبلغ')
