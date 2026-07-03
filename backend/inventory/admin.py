from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Warehouse, Stock, StockMovement

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    """إدارة المخازن"""
    list_display = ['name', 'name_ar', 'location', 'manager', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'name_ar', 'location']
    list_editable = ['is_active']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': ('id', 'name', 'name_ar', 'location')
        }),
        (_('المسؤول'), {
            'fields': ('manager',)
        }),
        (_('حالة المخزن'), {
            'fields': ('is_active',)
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    """إدارة المخزون"""
    list_display = ['product', 'warehouse', 'quantity_display', 'available_display', 
                    'status_display', 'last_updated']
    list_filter = ['warehouse', 'product__category', 'product__brand']
    search_fields = ['product__name', 'product__sku', 'warehouse__name']
    readonly_fields = ['id', 'last_updated', 'available_quantity']
    ordering = ['-last_updated']
    
    fieldsets = (
        (_('معلومات المخزون'), {
            'fields': ('id', 'product', 'warehouse')
        }),
        (_('الكميات'), {
            'fields': ('quantity', 'min_quantity', 'max_quantity', 'reserved_quantity', 
                      'available_quantity')
        }),
        (_('معلومات النظام'), {
            'fields': ('last_updated', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def quantity_display(self, obj):
        """عرض الكمية بشكل منسق"""
        color = '#dc3545' if obj.is_low_stock else '#28a745' if obj.quantity > 0 else '#6c757d'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, obj.quantity)
    quantity_display.short_description = _('الكمية')
    
    def available_display(self, obj):
        """عرض الكمية المتاحة"""
        available = obj.available_quantity
        color = '#28a745' if available > 0 else '#dc3545'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, available)
    available_display.short_description = _('المتاحة')
    
    def status_display(self, obj):
        """عرض حالة المخزون"""
        if obj.is_low_stock:
            return format_html('<span style="color: #dc3545;">🔴 منخفض</span>')
        elif obj.is_over_stock:
            return format_html('<span style="color: #ffc107;">🟡 زائد</span>')
        else:
            return format_html('<span style="color: #28a745;">🟢 طبيعي</span>')
    status_display.short_description = _('الحالة')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'warehouse', 'updated_by')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """إدارة حركات المخزون"""
    list_display = ['product', 'warehouse', 'movement_type_display', 'quantity', 
                    'previous_quantity', 'new_quantity', 'created_at']
    list_filter = ['movement_type', 'warehouse', 'created_at']
    search_fields = ['product__name', 'product__sku', 'notes']
    readonly_fields = ['id', 'created_at', 'created_by']
    ordering = ['-created_at']
    
    fieldsets = (
        (_('معلومات الحركة'), {
            'fields': ('id', 'product', 'warehouse', 'movement_type')
        }),
        (_('الكميات'), {
            'fields': ('quantity', 'previous_quantity', 'new_quantity')
        }),
        (_('معلومات إضافية'), {
            'fields': ('reference_id', 'reference_type', 'notes')
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def movement_type_display(self, obj):
        """عرض نوع الحركة بشكل منسق"""
        colors = {
            'purchase': '#28a745',
            'sale': '#dc3545',
            'return_sale': '#17a2b8',
            'return_purchase': '#17a2b8',
            'adjustment': '#ffc107',
            'damage': '#dc3545',
            'transfer': '#6c757d',
            'opening': '#28a745',
        }
        color = colors.get(obj.movement_type, '#6c757d')
        return format_html('<span style="color: {};">{}</span>', 
                          color, obj.get_movement_type_display())
    movement_type_display.short_description = _('نوع الحركة')
