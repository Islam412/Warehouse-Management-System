from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    """إدارة الموردين"""
    list_display = ['name', 'name_ar', 'phone', 'email', 'balance_display', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'name_ar', 'phone', 'email', 'tax_number']
    list_editable = ['is_active']
    readonly_fields = ['id', 'created_at', 'updated_at', 'balance_display']
    ordering = ['name']
    
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': ('id', 'name', 'name_ar', 'email', 'phone', 'phone2', 'address')
        }),
        (_('معلومات مالية'), {
            'fields': ('balance', 'balance_display')
        }),
        (_('معلومات إضافية'), {
            'fields': ('tax_number', 'notes', 'is_active')
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def balance_display(self, obj):
        """عرض الرصيد بشكل منسق"""
        try:
            balance = float(obj.balance) if obj.balance else 0
            color = '#28a745' if balance >= 0 else '#dc3545'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.2f} جنيه</span>',
                color, balance
            )
        except (ValueError, TypeError):
            return format_html(
                '<span style="color: #6c757d; font-weight: bold;">0.00 جنيه</span>'
            )
    balance_display.short_description = _('الرصيد')
    balance_display.admin_order_field = 'balance'
