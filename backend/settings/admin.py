from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Company, Branch, StoreSettings, 
    SocialLink, PaymentMethod, ShippingMethod
)


# ============================================
# Company Admin - إدارة الشركة
# ============================================

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """واجهة إدارة الشركة - Admin احترافي"""
    
    # ✅ إضافة is_active إلى list_display
    list_display = [
        'name_display', 'phone_display', 'email_display', 
        'logo_preview', 'is_active', 'branches_count', 'updated_at'
    ]
    
    # فلاتر البحث
    list_filter = ['is_active', 'country', 'city', 'created_at']
    
    # حقول البحث
    search_fields = ['name', 'name_ar', 'legal_name', 'phone', 'email', 'tax_number']
    
    # ✅ الآن is_active موجود في list_display
    list_editable = ['is_active']
    
    # ترتيب افتراضي
    ordering = ['name']
    
    # حقول للقراءة فقط
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'logo_preview', 
        'favicon_preview', 'cover_preview'
    ]
    
    # حفظ الصور تلقائياً
    save_on_top = True
    
    # تجميع الحقول
    fieldsets = (
        (_('معلومات أساسية'), {
            'fields': (
                'id',
                ('name', 'name_ar'),
                'legal_name',
                ('logo', 'logo_preview'),
                ('favicon', 'favicon_preview'),
                ('cover_image', 'cover_preview'),
            )
        }),
        
        (_('معلومات الاتصال'), {
            'fields': (
                ('phone', 'phone2'),
                'whatsapp',
                ('email', 'email2'),
            )
        }),
        
        (_('التواصل الاجتماعي'), {
            'fields': (
                'facebook', 'instagram', 'twitter', 
                'youtube', 'tiktok', 'linkedin', 'snapchat'
            ),
            'classes': ('collapse',),
        }),
        
        (_('العنوان والموقع'), {
            'fields': (
                ('address', 'address_ar'),
                ('city', 'city_ar'),
                ('state', 'state_ar'),
                ('country', 'country_ar'),
                'postal_code',
                ('latitude', 'longitude'),
                'google_maps_url',
            ),
            'classes': ('wide',),
        }),
        
        (_('معلومات قانونية'), {
            'fields': (
                'tax_number',
                'commercial_register',
                'license_number',
            ),
            'classes': ('collapse',),
        }),
        
        (_('حالة الشركة'), {
            'fields': ('is_active',),
        }),
        
        (_('معلومات النظام'), {
            'fields': ('updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # ========== دوال عرض مخصصة ==========
    
    def name_display(self, obj):
        """عرض الاسم بشكل منسق"""
        if obj.name_ar:
            return format_html(
                '<div><strong>{}</strong><br><span style="color: #6c757d; font-size: 12px;">{}</span></div>',
                obj.name, obj.name_ar
            )
        return format_html('<strong>{}</strong>', obj.name)
    name_display.short_description = _('الاسم')
    name_display.admin_order_field = 'name'
    
    def phone_display(self, obj):
        """عرض رقم الهاتف كرابط للاتصال"""
        if obj.phone:
            return format_html(
                '<a href="tel:{}" style="color: #28a745; text-decoration: none;">📞 {}</a>',
                obj.phone, obj.phone
            )
        return '-'
    phone_display.short_description = _('الهاتف')
    
    def email_display(self, obj):
        """عرض البريد الإلكتروني كرابط"""
        if obj.email:
            return format_html(
                '<a href="mailto:{}" style="color: #17a2b8;">📧 {}</a>',
                obj.email, obj.email
            )
        return '-'
    email_display.short_description = _('البريد الإلكتروني')
    
    def logo_preview(self, obj):
        """معاينة الشعار"""
        if obj.logo:
            return format_html(
                '<img src="{}" width="80" height="80" style="border-radius: 10px; object-fit: cover; border: 2px solid #ddd;" />',
                obj.logo.url
            )
        return format_html(
            '<span style="color: #999; font-size: 14px;">🚫 لا يوجد شعار</span>'
        )
    logo_preview.short_description = _('معاينة الشعار')
    
    def favicon_preview(self, obj):
        """معاينة الأيقونة"""
        if obj.favicon:
            return format_html(
                '<img src="{}" width="32" height="32" style="border-radius: 5px; object-fit: cover;" />',
                obj.favicon.url
            )
        return format_html('<span style="color: #999;">🚫</span>')
    favicon_preview.short_description = _('معاينة الأيقونة')
    
    def cover_preview(self, obj):
        """معاينة صورة الغلاف"""
        if obj.cover_image:
            return format_html(
                '<img src="{}" width="200" height="80" style="border-radius: 8px; object-fit: cover; border: 1px solid #ddd;" />',
                obj.cover_image.url
            )
        return format_html('<span style="color: #999;">🚫 لا توجد صورة غلاف</span>')
    cover_preview.short_description = _('معاينة الغلاف')
    
    def branches_count(self, obj):
        """عدد الفروع"""
        count = obj.branches.count()
        color = '#28a745' if count > 0 else '#6c757d'
        return format_html(
            '<span style="color: {}; font-weight: bold;">🏢 {}</span>',
            color, count
        )
    branches_count.short_description = _('الفروع')
    
    # ========== إجراءات مخصصة ==========
    
    actions = ['activate_company', 'deactivate_company']
    
    def activate_company(self, request, queryset):
        """تفعيل الشركة"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'✅ تم تفعيل {updated} شركة(شركات) بنجاح.')
    activate_company.short_description = _('تفعيل الشركات المحددة')
    
    def deactivate_company(self, request, queryset):
        """إلغاء تفعيل الشركة"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'❌ تم إلغاء تفعيل {updated} شركة(شركات) بنجاح.')
    deactivate_company.short_description = _('إلغاء تفعيل الشركات المحددة')


# ============================================
# Branch Admin - إدارة الفروع
# ============================================

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    """واجهة إدارة الفروع"""
    
    # ✅ إضافة is_active و is_main إلى list_display
    list_display = [
        'name_display', 'code_display', 'phone_display', 
        'city_display', 'manager_display', 
        'is_active', 'is_main'
    ]
    
    list_filter = ['is_active', 'is_main', 'city', 'created_at']
    search_fields = ['name', 'name_ar', 'code', 'phone', 'address']
    
    # ✅ الآن is_active و is_main موجودان في list_display
    list_editable = ['is_active', 'is_main']
    
    ordering = ['company', 'name']
    readonly_fields = ['id', 'code', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('معلومات الفرع'), {
            'fields': (
                'id', 'code',
                ('name', 'name_ar'),
                'company',
            )
        }),
        
        (_('معلومات الاتصال'), {
            'fields': (
                ('phone', 'phone2'),
                'whatsapp',
                'email',
            )
        }),
        
        (_('العنوان'), {
            'fields': (
                ('address', 'address_ar'),
                ('city', 'city_ar'),
                ('state', 'state_ar'),
            )
        }),
        
        (_('ساعات العمل'), {
            'fields': (
                ('opening_time', 'closing_time'),
                'is_24_hours',
                'weekend_days',
            ),
            'classes': ('wide',),
        }),
        
        (_('إدارة الفرع'), {
            'fields': (
                'manager',
                ('is_active', 'is_main'),
            )
        }),
        
        (_('معلومات النظام'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # ========== دوال عرض مخصصة ==========
    
    def name_display(self, obj):
        """عرض اسم الفرع"""
        if obj.name_ar:
            return format_html(
                '<div><strong>{}</strong><br><span style="color: #6c757d; font-size: 12px;">{}</span></div>',
                obj.name, obj.name_ar
            )
        return format_html('<strong>{}</strong>', obj.name)
    name_display.short_description = _('الاسم')
    name_display.admin_order_field = 'name'
    
    def code_display(self, obj):
        """عرض الكود"""
        return format_html(
            '<span style="background: #f8f9fa; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">{}</span>',
            obj.code
        )
    code_display.short_description = _('الكود')
    
    def phone_display(self, obj):
        """عرض رقم الهاتف"""
        if obj.phone:
            return format_html(
                '<a href="tel:{}" style="color: #28a745;">📞 {}</a>',
                obj.phone, obj.phone
            )
        return '-'
    phone_display.short_description = _('الهاتف')
    
    def city_display(self, obj):
        """عرض المدينة"""
        if obj.city_ar:
            return format_html(
                '<div>{}<br><span style="color: #6c757d; font-size: 12px;">{}</span></div>',
                obj.city, obj.city_ar
            )
        return obj.city or '-'
    city_display.short_description = _('المدينة')
    
    def manager_display(self, obj):
        """عرض المدير"""
        if obj.manager:
            return format_html(
                '<span style="color: #17a2b8;">👤 {}</span>',
                obj.manager.get_full_name() or obj.manager.username
            )
        return format_html('<span style="color: #999;">🚫 غير معين</span>')
    manager_display.short_description = _('المدير')
    
    # ========== إجراءات مخصصة ==========
    
    actions = ['activate_branches', 'deactivate_branches', 'set_as_main']
    
    def activate_branches(self, request, queryset):
        """تفعيل الفروع"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'✅ تم تفعيل {updated} فرع(فروع) بنجاح.')
    activate_branches.short_description = _('تفعيل الفروع المحددة')
    
    def deactivate_branches(self, request, queryset):
        """إلغاء تفعيل الفروع"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'❌ تم إلغاء تفعيل {updated} فرع(فروع) بنجاح.')
    deactivate_branches.short_description = _('إلغاء تفعيل الفروع المحددة')
    
    def set_as_main(self, request, queryset):
        """تعيين كفرع رئيسي"""
        if queryset.count() > 1:
            self.message_user(
                request, 
                '⚠️ يمكن تعيين فرع واحد فقط كرئيسي. يرجى اختيار فرع واحد.',
                level='ERROR'
            )
            return
        
        branch = queryset.first()
        # إلغاء الرئيسي عن جميع الفروع
        branch.company.branches.update(is_main=False)
        # تعيين هذا الفرع كرئيسي
        branch.is_main = True
        branch.save()
        self.message_user(request, f'✅ تم تعيين "{branch.name}" كفرع رئيسي.')
    set_as_main.short_description = _('تعيين كفرع رئيسي')


# ============================================
# StoreSettings Admin - إدارة الإعدادات
# ============================================

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    """واجهة إدارة إعدادات النظام"""
    
    list_display = [
        'company_name_display', 'currency_display', 
        'tax_rate_display', 'invoice_prefix_display', 
        'updated_by_display', 'updated_at'
    ]
    
    readonly_fields = ['id', 'created_at', 'updated_at', 'updated_by']
    
    fieldsets = (
        (_('الشركة'), {
            'fields': ('company',)
        }),
        
        (_('إعدادات العملة'), {
            'fields': (
                ('currency', 'currency_symbol'),
                'currency_position',
                ('decimal_places', 'thousand_separator'),
            ),
            'classes': ('wide',),
        }),
        
        (_('إعدادات الضرائب'), {
            'fields': (
                'default_tax_rate',
                'include_tax_in_price',
            ),
        }),
        
        (_('إعدادات الفواتير'), {
            'fields': (
                ('invoice_prefix', 'invoice_suffix'),
                'invoice_footer',
                'invoice_terms',
                'enable_invoice_pdf',
            ),
            'classes': ('wide',),
        }),
        
        (_('إعدادات المخزون'), {
            'fields': (
                'low_stock_threshold',
                'enable_stock_alerts',
                'allow_negative_stock',
                ('enable_batch_tracking', 'enable_serial_tracking'),
            ),
            'classes': ('collapse',),
        }),
        
        (_('إعدادات العملاء والموردين'), {
            'fields': (
                ('enable_customer_accounts', 'enable_supplier_accounts'),
                ('auto_customer_code', 'auto_supplier_code'),
            ),
            'classes': ('collapse',),
        }),
        
        (_('إعدادات الإشعارات'), {
            'fields': (
                ('enable_email_notifications', 'enable_sms_notifications'),
                ('enable_push_notifications', 'enable_whatsapp_notifications'),
            ),
            'classes': ('collapse',),
        }),
        
        (_('إعدادات اللغة والواجهة'), {
            'fields': (
                'default_language',
                'rtl_layout',
                ('date_format', 'time_format'),
            ),
            'classes': ('collapse',),
        }),
        
        (_('إعدادات الأمان'), {
            'fields': (
                'session_timeout',
                'max_login_attempts',
                ('enable_2fa', 'require_strong_password'),
            ),
            'classes': ('collapse',),
        }),
        
        (_('إعدادات النظام'), {
            'fields': (
                ('enable_api_logging', 'enable_audit_log'),
                ('enable_backup', 'backup_frequency'),
            ),
            'classes': ('collapse',),
        }),
        
        (_('تفعيل الميزات'), {
            'fields': (
                ('enable_online_store', 'enable_mobile_app'),
                'enable_pos',
            ),
            'classes': ('collapse',),
        }),
        
        (_('معلومات النظام'), {
            'fields': ('id', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # ========== دوال عرض مخصصة ==========
    
    def company_name_display(self, obj):
        """عرض اسم الشركة"""
        return format_html(
            '<strong style="color: #17a2b8;">🏢 {}</strong>',
            obj.company.name
        )
    company_name_display.short_description = _('الشركة')
    
    def currency_display(self, obj):
        """عرض العملة"""
        return format_html(
            '<span style="font-weight: bold;">{} ({})</span>',
            obj.currency_symbol, obj.currency
        )
    currency_display.short_description = _('العملة')
    
    def tax_rate_display(self, obj):
        """عرض نسبة الضريبة"""
        return format_html(
            '<span style="color: #fd7e14; font-weight: bold;">{}%</span>',
            obj.default_tax_rate
        )
    tax_rate_display.short_description = _('الضريبة')
    
    def invoice_prefix_display(self, obj):
        """عرض بادئة الفاتورة"""
        return format_html(
            '<span style="background: #f8f9fa; padding: 2px 8px; border-radius: 4px; font-family: monospace;">{}</span>',
            obj.invoice_prefix
        )
    invoice_prefix_display.short_description = _('بادئة الفاتورة')
    
    def updated_by_display(self, obj):
        """عرض آخر من قام بالتحديث"""
        if obj.updated_by:
            return format_html(
                '👤 {}',
                obj.updated_by.get_full_name() or obj.updated_by.username
            )
        return format_html('<span style="color: #999;">-</span>')
    updated_by_display.short_description = _('آخر تحديث بواسطة')
    
    # منع إنشاء أكثر من إعداد واحد
    def has_add_permission(self, request):
        return not StoreSettings.objects.exists()


# ============================================
# SocialLink Admin - إدارة روابط التواصل
# ============================================

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    """واجهة إدارة روابط التواصل الاجتماعي"""
    
    # ✅ إضافة is_active و order إلى list_display
    list_display = [
        'platform_display', 'url_display', 
        'icon_display', 'is_active', 'order'
    ]
    
    list_filter = ['is_active', 'platform']
    search_fields = ['platform', 'platform_ar', 'url']
    
    # ✅ الآن is_active و order موجودان في list_display
    list_editable = ['is_active', 'order']
    
    ordering = ['company', 'order']
    readonly_fields = ['id']
    
    fieldsets = (
        (_('معلومات الرابط'), {
            'fields': (
                'company',
                ('platform', 'platform_ar'),
                'url',
                'icon',
                ('is_active', 'order'),
            )
        }),
    )
    
    # ========== دوال عرض مخصصة ==========
    
    def platform_display(self, obj):
        """عرض المنصة"""
        if obj.platform_ar:
            return format_html(
                '<div><strong>{}</strong><br><span style="color: #6c757d; font-size: 12px;">{}</span></div>',
                obj.platform, obj.platform_ar
            )
        return format_html('<strong>{}</strong>', obj.platform)
    platform_display.short_description = _('المنصة')
    
    def url_display(self, obj):
        """عرض الرابط كرابط قابل للنقر"""
        if obj.url:
            display_url = obj.url[:50] + '...' if len(obj.url) > 50 else obj.url
            return format_html(
                '<a href="{}" target="_blank" style="color: #17a2b8;">🔗 {}</a>',
                obj.url, display_url
            )
        return '-'
    url_display.short_description = _('الرابط')
    
    def icon_display(self, obj):
        """عرض الأيقونة"""
        if obj.icon:
            return format_html(
                '<span style="font-size: 20px;">{}</span>',
                obj.icon
            )
        return format_html('<span style="color: #999;">🚫</span>')
    icon_display.short_description = _('الأيقونة')


# ============================================
# PaymentMethod Admin - إدارة طرق الدفع
# ============================================

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """واجهة إدارة طرق الدفع"""
    
    # ✅ إضافة is_active, is_default, order إلى list_display
    list_display = [
        'name_display', 'icon_preview', 
        'is_default', 'order', 'is_active'
    ]
    
    list_filter = ['is_active', 'is_default']
    search_fields = ['name', 'name_ar']
    
    # ✅ الآن is_active, is_default, order موجودون في list_display
    list_editable = ['is_active', 'is_default', 'order']
    
    ordering = ['company', 'order']
    readonly_fields = ['id', 'icon_preview']
    
    fieldsets = (
        (_('معلومات طريقة الدفع'), {
            'fields': (
                'company',
                ('name', 'name_ar'),
                ('icon', 'icon_preview'),
                ('is_active', 'is_default'),
                'order',
            )
        }),
    )
    
    # ========== دوال عرض مخصصة ==========
    
    def name_display(self, obj):
        """عرض الاسم"""
        if obj.name_ar:
            return format_html(
                '<div><strong>{}</strong><br><span style="color: #6c757d; font-size: 12px;">{}</span></div>',
                obj.name, obj.name_ar
            )
        return format_html('<strong>{}</strong>', obj.name)
    name_display.short_description = _('الاسم')
    
    def icon_preview(self, obj):
        """معاينة الأيقونة"""
        if obj.icon:
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 8px; object-fit: cover;" />',
                obj.icon.url
            )
        return format_html('<span style="color: #999;">🚫</span>')
    icon_preview.short_description = _('معاينة الأيقونة')


# ============================================
# ShippingMethod Admin - إدارة طرق الشحن
# ============================================

@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    """واجهة إدارة طرق الشحن"""
    
    # ✅ إضافة is_active و is_default إلى list_display
    list_display = [
        'name_display', 'cost_display', 
        'days_display', 'is_default', 'is_active'
    ]
    
    list_filter = ['is_active', 'is_default']
    search_fields = ['name', 'name_ar', 'description']
    
    # ✅ الآن is_active و is_default موجودان في list_display
    list_editable = ['is_active', 'is_default']
    
    ordering = ['company', 'name']
    readonly_fields = ['id']
    
    fieldsets = (
        (_('معلومات طريقة الشحن'), {
            'fields': (
                'company',
                ('name', 'name_ar'),
                'description',
                ('cost', 'estimated_days'),
                ('is_active', 'is_default'),
            )
        }),
    )
    
    # ========== دوال عرض مخصصة ==========
    
    def name_display(self, obj):
        """عرض الاسم"""
        if obj.name_ar:
            return format_html(
                '<div><strong>{}</strong><br><span style="color: #6c757d; font-size: 12px;">{}</span></div>',
                obj.name, obj.name_ar
            )
        return format_html('<strong>{}</strong>', obj.name)
    name_display.short_description = _('الاسم')
    
    def cost_display(self, obj):
        """عرض التكلفة"""
        return format_html(
            '<span style="color: #28a745; font-weight: bold;">{:.2f} ج.م</span>',
            obj.cost
        )
    cost_display.short_description = _('التكلفة')
    
    def days_display(self, obj):
        """عرض أيام التوصيل"""
        return format_html(
            '<span style="background: #f8f9fa; padding: 2px 8px; border-radius: 4px;">{} يوم</span>',
            obj.estimated_days
        )
    days_display.short_description = _('أيام التوصيل')