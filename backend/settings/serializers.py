from rest_framework import serializers
from .models import Company, Branch, StoreSettings, SocialLink, PaymentMethod, ShippingMethod

class CompanySerializer(serializers.ModelSerializer):
    """Serializer للشركة"""
    social_links = serializers.SerializerMethodField()
    branches = serializers.SerializerMethodField()
    payment_methods = serializers.SerializerMethodField()
    shipping_methods = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'name_ar', 'legal_name',
            'logo', 'favicon', 'cover_image',
            'phone', 'phone2', 'whatsapp', 'email', 'email2',
            'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin', 'snapchat',
            'address', 'address_ar', 'city', 'city_ar', 'state', 'state_ar',
            'country', 'country_ar', 'postal_code',
            'latitude', 'longitude', 'google_maps_url',
            'tax_number', 'commercial_register', 'license_number',
            'is_active', 'created_at', 'updated_at',
            'social_links', 'branches', 'payment_methods', 'shipping_methods'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_social_links(self, obj):
        from .serializers import SocialLinkSerializer
        links = obj.social_links.filter(is_active=True)
        return SocialLinkSerializer(links, many=True).data
    
    def get_branches(self, obj):
        from .serializers import BranchSerializer
        branches = obj.branches.filter(is_active=True)
        return BranchSerializer(branches, many=True).data
    
    def get_payment_methods(self, obj):
        from .serializers import PaymentMethodSerializer
        methods = obj.payment_methods.filter(is_active=True)
        return PaymentMethodSerializer(methods, many=True).data
    
    def get_shipping_methods(self, obj):
        from .serializers import ShippingMethodSerializer
        methods = obj.shipping_methods.filter(is_active=True)
        return ShippingMethodSerializer(methods, many=True).data


class BranchSerializer(serializers.ModelSerializer):
    """Serializer للفروع"""
    manager_name = serializers.ReadOnlyField(source='manager.username')
    
    class Meta:
        model = Branch
        fields = [
            'id', 'company', 'name', 'name_ar', 'code',
            'phone', 'phone2', 'whatsapp', 'email',
            'address', 'address_ar', 'city', 'city_ar', 'state', 'state_ar',
            'latitude', 'longitude',
            'opening_time', 'closing_time', 'is_24_hours', 'weekend_days',
            'is_active', 'is_main', 'manager', 'manager_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']


class StoreSettingsSerializer(serializers.ModelSerializer):
    """Serializer لإعدادات النظام"""
    company_name = serializers.ReadOnlyField(source='company.name')
    updated_by_name = serializers.ReadOnlyField(source='updated_by.username')
    
    class Meta:
        model = StoreSettings
        fields = [
            'id', 'company', 'company_name',
            'currency', 'currency_symbol', 'currency_position',
            'decimal_places', 'thousand_separator',
            'default_tax_rate', 'include_tax_in_price',
            'invoice_prefix', 'invoice_suffix', 'invoice_footer', 'invoice_terms',
            'enable_invoice_pdf',
            'low_stock_threshold', 'enable_stock_alerts',
            'allow_negative_stock', 'enable_batch_tracking', 'enable_serial_tracking',
            'enable_customer_accounts', 'enable_supplier_accounts',
            'auto_customer_code', 'auto_supplier_code',
            'enable_email_notifications', 'enable_sms_notifications',
            'enable_push_notifications', 'enable_whatsapp_notifications',
            'default_language', 'rtl_layout', 'date_format', 'time_format',
            'session_timeout', 'max_login_attempts', 'enable_2fa', 'require_strong_password',
            'enable_api_logging', 'enable_audit_log', 'enable_backup', 'backup_frequency',
            'enable_online_store', 'enable_mobile_app', 'enable_pos',
            'updated_by', 'updated_by_name', 'updated_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'updated_by']


class SocialLinkSerializer(serializers.ModelSerializer):
    """Serializer لروابط التواصل الاجتماعي"""
    
    class Meta:
        model = SocialLink
        fields = ['id', 'company', 'platform', 'platform_ar', 'icon', 'url', 'is_active', 'order']
        read_only_fields = ['id']


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer لطرق الدفع"""
    
    class Meta:
        model = PaymentMethod
        fields = ['id', 'company', 'name', 'name_ar', 'icon', 'is_active', 'is_default', 'order']
        read_only_fields = ['id']


class ShippingMethodSerializer(serializers.ModelSerializer):
    """Serializer لطرق الشحن"""
    
    class Meta:
        model = ShippingMethod
        fields = ['id', 'company', 'name', 'name_ar', 'description', 'cost', 'estimated_days', 'is_active', 'is_default']
        read_only_fields = ['id']


# Serializers للتحديث الجزئي
class CompanyUpdateSerializer(serializers.ModelSerializer):
    """Serializer لتحديث بيانات الشركة"""
    
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class BranchCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء فرع جديد"""
    
    class Meta:
        model = Branch
        fields = [
            'company', 'name', 'name_ar', 'phone', 'phone2', 'whatsapp', 'email',
            'address', 'address_ar', 'city', 'city_ar', 'state', 'state_ar',
            'latitude', 'longitude', 'opening_time', 'closing_time',
            'is_24_hours', 'weekend_days', 'is_active', 'is_main', 'manager'
        ]