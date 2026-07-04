from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Category, Brand, Unit, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """إدارة فئات المنتجات"""
    
    list_display = ['name', 'name_ar', 'parent', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'name_ar', 'description']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': ('name', 'name_ar', 'description')
        }),
        (_('التسلسل الهرمي'), {
            'fields': ('parent',),
            'classes': ('collapse',)
        }),
        (_('حالة الفئة'), {
            'fields': ('is_active',)
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    """إدارة العلامات التجارية"""
    
    list_display = ['name', 'name_ar', 'logo_preview', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'name_ar', 'description']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at', 'logo_preview']
    ordering = ['name']
    
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': ('name', 'name_ar', 'description')
        }),
        (_('الشعار'), {
            'fields': ('logo', 'logo_preview'),
        }),
        (_('حالة العلامة'), {
            'fields': ('is_active',)
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def logo_preview(self, obj):
        """معاينة الشعار"""
        if obj.logo:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 5px; object-fit: cover;" />',
                obj.logo.url
            )
        return format_html('<span style="color: #999;">لا يوجد شعار</span>')
    logo_preview.short_description = _('معاينة الشعار')


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    """إدارة وحدات القياس"""
    
    list_display = ['name', 'name_ar', 'symbol', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'name_ar', 'symbol']
    list_editable = ['is_active', 'symbol']
    ordering = ['name']
    
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': ('name', 'name_ar', 'symbol')
        }),
        (_('حالة الوحدة'), {
            'fields': ('is_active',)
        }),
    )


class ProductImageInline(admin.TabularInline):
    """إدارة صور المنتج داخل صفحة المنتج"""
    
    model = ProductImage
    extra = 1
    fields = ['image', 'is_primary', 'order', 'image_preview']
    readonly_fields = ['image_preview']
    ordering = ['order']
    
    def image_preview(self, obj):
        """معاينة الصورة داخل الـ inline"""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 5px; object-fit: cover;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">لا توجد صورة</span>')
    image_preview.short_description = _('معاينة')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """إدارة المنتجات - Admin احترافي"""
    
    list_display = [
        'name', 'sku', 'brand', 'category', 
        'selling_price_display', 'profit_margin_display', 
        'is_active', 'has_stock', 'created_at'
    ]
    
    list_filter = [
        'is_active', 'has_stock', 'brand', 'category', 'unit',
        'created_at', 'created_by'
    ]
    
    search_fields = ['name', 'name_ar', 'sku', 'barcode', 'description']
    list_editable = ['is_active']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'profit_margin']
    ordering = ['-created_at', 'name']
    
    inlines = [ProductImageInline]
    
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': ('id', 'name', 'name_ar', 'description', 'category', 'brand', 'unit')
        }),
        (_('معلومات المخزون'), {
            'fields': ('sku', 'barcode'),
            'classes': ('wide',)
        }),
        (_('الأسعار والتكاليف'), {
            'fields': ('purchase_price', 'selling_price', 'wholesale_price', 'profit_margin'),
            'classes': ('wide',)
        }),
        (_('خصائص إضافية'), {
            'fields': ('size', 'color', 'weight'),
            'classes': ('collapse',)
        }),
        (_('حالة المنتج'), {
            'fields': ('is_active', 'is_featured', 'has_stock'),
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive', 'mark_featured', 'unmark_featured']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'brand', 'category', 'unit', 'created_by'
        )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    # ========== دوال عرض مخصصة - تم إصلاحها ==========
    
    def selling_price_display(self, obj):
        """عرض سعر البيع بشكل منسق"""
        try:
            price = float(obj.selling_price) if obj.selling_price else 0
            return format_html(
                '<span style="font-weight: bold; color: #28a745;">{:.2f} جنيه</span>',
                price
            )
        except (ValueError, TypeError):
            return format_html(
                '<span style="font-weight: bold; color: #28a745;">0.00 جنيه</span>'
            )
    selling_price_display.short_description = _('سعر البيع')
    selling_price_display.admin_order_field = 'selling_price'
    
    def profit_margin_display(self, obj):
        """عرض هامش الربح بشكل منسق"""
        try:
            margin = float(obj.profit_margin) if obj.profit_margin else 0
            color = '#28a745' if margin > 20 else '#ffc107' if margin > 10 else '#dc3545'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
                color, margin
            )
        except (ValueError, TypeError):
            return format_html(
                '<span style="color: #6c757d; font-weight: bold;">0.0%</span>'
            )
    profit_margin_display.short_description = _('هامش الربح')
    profit_margin_display.admin_order_field = 'profit_margin'
    
    # ========== إجراءات مخصصة ==========
    
    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'تم تفعيل {updated} منتج(منتجات) بنجاح.')
    make_active.short_description = _('تفعيل المنتجات المحددة')
    
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'تم إلغاء تفعيل {updated} منتج(منتجات) بنجاح.')
    make_inactive.short_description = _('إلغاء تفعيل المنتجات المحددة')
    
    def mark_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'تم تمييز {updated} منتج(منتجات) كمميزة.')
    mark_featured.short_description = _('تمييز المنتجات كمميزة')
    
    def unmark_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'تم إلغاء تمييز {updated} منتج(منتجات).')
    unmark_featured.short_description = _('إلغاء تمييز المنتجات')


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """إدارة صور المنتجات"""
    
    list_display = ['product', 'image_preview', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name', 'alt_text']
    list_editable = ['is_primary', 'order']
    readonly_fields = ['created_at', 'image_preview']
    ordering = ['product', 'order']
    
    fieldsets = (
        (_('معلومات الصورة'), {
            'fields': ('product', 'image', 'image_preview')
        }),
        (_('تفاصيل إضافية'), {
            'fields': ('is_primary', 'alt_text', 'order')
        }),
        (_('معلومات النظام'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="border-radius: 5px; object-fit: cover;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">لا توجد صورة</span>')
    image_preview.short_description = _('معاينة')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')
