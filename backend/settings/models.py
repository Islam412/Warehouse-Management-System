from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User

class Company(models.Model):
    """نموذج الشركة الرئيسي"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # معلومات أساسية
    name = models.CharField(max_length=200, verbose_name="اسم الشركة")
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name="اسم الشركة بالعربية")
    legal_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="الاسم القانوني")
    
    # الشعار والصور
    logo = models.ImageField(upload_to='company/logos/', blank=True, null=True, verbose_name="شعار الشركة")
    favicon = models.ImageField(upload_to='company/favicon/', blank=True, null=True, verbose_name="أيقونة الموقع")
    cover_image = models.ImageField(upload_to='company/cover/', blank=True, null=True, verbose_name="صورة الغلاف")
    
    # معلومات الاتصال
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم الهاتف")
    phone2 = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم الهاتف البديل")
    whatsapp = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم واتساب")
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    email2 = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني البديل")
    
    # التواصل الاجتماعي
    facebook = models.URLField(blank=True, null=True, verbose_name="فيسبوك")
    instagram = models.URLField(blank=True, null=True, verbose_name="إنستجرام")
    twitter = models.URLField(blank=True, null=True, verbose_name="تويتر")
    youtube = models.URLField(blank=True, null=True, verbose_name="يوتيوب")
    tiktok = models.URLField(blank=True, null=True, verbose_name="تيك توك")
    linkedin = models.URLField(blank=True, null=True, verbose_name="لينكد إن")
    snapchat = models.URLField(blank=True, null=True, verbose_name="سناب شات")
    
    # العنوان
    address = models.TextField(blank=True, null=True, verbose_name="العنوان")
    address_ar = models.TextField(blank=True, null=True, verbose_name="العنوان بالعربية")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="المدينة")
    city_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="المدينة بالعربية")
    state = models.CharField(max_length=100, blank=True, null=True, verbose_name="المحافظة")
    state_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="المحافظة بالعربية")
    country = models.CharField(max_length=100, default='مصر', verbose_name="الدولة")
    country_ar = models.CharField(max_length=100, default='مصر', verbose_name="الدولة بالعربية")
    postal_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="الرمز البريدي")
    
    # الموقع الجغرافي
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True, verbose_name="خط العرض")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True, verbose_name="خط الطول")
    google_maps_url = models.URLField(blank=True, null=True, verbose_name="رابط خرائط جوجل")
    
    # معلومات قانونية وضريبية
    tax_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="الرقم الضريبي")
    commercial_register = models.CharField(max_length=50, blank=True, null=True, verbose_name="السجل التجاري")
    license_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="رقم الترخيص")
    
    # معلومات النظام
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='company_updates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_settings'
        verbose_name = "الشركة"
        verbose_name_plural = "إعدادات الشركة"
    
    def __str__(self):
        return self.name
    
    @classmethod
    def get_company(cls):
        """جلب بيانات الشركة (إنشاء افتراضية إذا لم توجد)"""
        company, created = cls.objects.get_or_create(
            id='00000000-0000-0000-0000-000000000001',
            defaults={
                'name': 'شركتي',
                'name_ar': 'شركتي',
                'phone': '0123456789',
                'email': 'info@company.com',
                'country': 'مصر',
                'city': 'القاهرة',
            }
        )
        return company


class Branch(models.Model):
    """نموذج الفروع"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='branches', verbose_name="الشركة")
    
    # معلومات الفرع
    name = models.CharField(max_length=200, verbose_name="اسم الفرع")
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name="اسم الفرع بالعربية")
    code = models.CharField(max_length=20, unique=True, verbose_name="كود الفرع")
    
    # معلومات الاتصال
    phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    phone2 = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم هاتف بديل")
    whatsapp = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم واتساب")
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    
    # العنوان
    address = models.TextField(verbose_name="العنوان")
    address_ar = models.TextField(blank=True, null=True, verbose_name="العنوان بالعربية")
    city = models.CharField(max_length=100, verbose_name="المدينة")
    city_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="المدينة بالعربية")
    state = models.CharField(max_length=100, blank=True, null=True, verbose_name="المحافظة")
    state_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="المحافظة بالعربية")
    
    # الموقع الجغرافي
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True, verbose_name="خط العرض")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True, verbose_name="خط الطول")
    
    # ساعات العمل
    opening_time = models.TimeField(blank=True, null=True, verbose_name="وقت الفتح")
    closing_time = models.TimeField(blank=True, null=True, verbose_name="وقت الإغلاق")
    is_24_hours = models.BooleanField(default=False, verbose_name="يعمل 24 ساعة")
    weekend_days = models.CharField(max_length=50, blank=True, null=True, verbose_name="أيام العطلة")
    
    # معلومات إضافية
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_main = models.BooleanField(default=False, verbose_name="الفرع الرئيسي")
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_branches', verbose_name="مدير الفرع")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_branches'
        verbose_name = "فرع"
        verbose_name_plural = "الفروع"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            # إنشاء كود تلقائي
            from utils.generate_code import generate_code
            self.code = generate_code(8)
        super().save(*args, **kwargs)


class StoreSettings(models.Model):
    """الإعدادات العامة للنظام"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='settings', verbose_name="الشركة")
    
    # إعدادات العملة
    currency = models.CharField(max_length=10, default='EGP', verbose_name="العملة")
    currency_symbol = models.CharField(max_length=5, default='ج.م', verbose_name="رمز العملة")
    currency_position = models.CharField(
        max_length=10, 
        choices=[('before', 'قبل الرقم'), ('after', 'بعد الرقم')],
        default='after',
        verbose_name="مكان رمز العملة"
    )
    decimal_places = models.PositiveIntegerField(default=2, verbose_name="عدد الأرقام العشرية")
    thousand_separator = models.CharField(max_length=1, default=',', verbose_name="فاصل الآلاف")
    
    # إعدادات الضرائب
    default_tax_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=14.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="نسبة الضريبة الافتراضية (%)"
    )
    include_tax_in_price = models.BooleanField(default=False, verbose_name="الضريبة مشمولة في السعر")
    
    # إعدادات الفواتير
    invoice_prefix = models.CharField(max_length=10, default='INV', verbose_name="بادئة الفاتورة")
    invoice_suffix = models.CharField(max_length=10, blank=True, null=True, verbose_name="لاحقة الفاتورة")
    invoice_footer = models.TextField(blank=True, null=True, verbose_name="تذييل الفاتورة")
    invoice_terms = models.TextField(blank=True, null=True, verbose_name="شروط وأحكام الفاتورة")
    enable_invoice_pdf = models.BooleanField(default=True, verbose_name="تفعيل PDF الفواتير")
    
    # إعدادات المخزون
    low_stock_threshold = models.PositiveIntegerField(default=10, verbose_name="حد التنبيه للمخزون المنخفض")
    enable_stock_alerts = models.BooleanField(default=True, verbose_name="تفعيل تنبيهات المخزون")
    allow_negative_stock = models.BooleanField(default=False, verbose_name="السماح بالمخزون السلبي")
    enable_batch_tracking = models.BooleanField(default=False, verbose_name="تفعيل تتبع الدفعات")
    enable_serial_tracking = models.BooleanField(default=False, verbose_name="تفعيل تتبع الأرقام التسلسلية")
    
    # إعدادات العملاء والموردين
    enable_customer_accounts = models.BooleanField(default=True, verbose_name="تفعيل حسابات العملاء")
    enable_supplier_accounts = models.BooleanField(default=True, verbose_name="تفعيل حسابات الموردين")
    auto_customer_code = models.BooleanField(default=True, verbose_name="كود عميل تلقائي")
    auto_supplier_code = models.BooleanField(default=True, verbose_name="كود مورد تلقائي")
    
    # إعدادات الإشعارات
    enable_email_notifications = models.BooleanField(default=True, verbose_name="تفعيل إشعارات البريد")
    enable_sms_notifications = models.BooleanField(default=False, verbose_name="تفعيل إشعارات SMS")
    enable_push_notifications = models.BooleanField(default=True, verbose_name="تفعيل إشعارات التطبيق")
    enable_whatsapp_notifications = models.BooleanField(default=False, verbose_name="تفعيل إشعارات واتساب")
    
    # إعدادات اللغة والواجهة
    default_language = models.CharField(
        max_length=10,
        choices=[('ar', 'العربية'), ('en', 'English')],
        default='ar',
        verbose_name="اللغة الافتراضية"
    )
    rtl_layout = models.BooleanField(default=True, verbose_name="اتجاه من اليمين لليسار")
    date_format = models.CharField(max_length=20, default='Y-m-d', verbose_name="صيغة التاريخ")
    time_format = models.CharField(max_length=20, default='H:i', verbose_name="صيغة الوقت")
    
    # إعدادات الأمان
    session_timeout = models.PositiveIntegerField(default=60, verbose_name="مدة انتهاء الجلسة (دقائق)")
    max_login_attempts = models.PositiveIntegerField(default=5, verbose_name="عدد محاولات الدخول المسموح بها")
    enable_2fa = models.BooleanField(default=False, verbose_name="تفعيل المصادقة الثنائية")
    require_strong_password = models.BooleanField(default=True, verbose_name="كلمة مرور قوية")
    
    # إعدادات النظام
    enable_api_logging = models.BooleanField(default=True, verbose_name="تفعيل سجل API")
    enable_audit_log = models.BooleanField(default=True, verbose_name="تفعيل سجل التدقيق")
    enable_backup = models.BooleanField(default=True, verbose_name="تفعيل النسخ الاحتياطي")
    backup_frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'يومي'),
            ('weekly', 'أسبوعي'),
            ('monthly', 'شهري'),
            ('manual', 'يدوي')
        ],
        default='daily',
        verbose_name="تكرار النسخ الاحتياطي"
    )
    
    # إعدادات التطبيقات المتصلة
    enable_online_store = models.BooleanField(default=False, verbose_name="تفعيل المتجر الإلكتروني")
    enable_mobile_app = models.BooleanField(default=False, verbose_name="تفعيل تطبيق الموبايل")
    enable_pos = models.BooleanField(default=True, verbose_name="تفعيل نظام نقاط البيع")
    
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='settings_updates')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'store_settings'
        verbose_name = "إعدادات النظام"
        verbose_name_plural = "إعدادات النظام"
    
    def __str__(self):
        return f"إعدادات {self.company.name}"
    
    @classmethod
    def get_settings(cls, company=None):
        """جلب الإعدادات (إنشاء افتراضية إذا لم توجد)"""
        if not company:
            company = Company.get_company()
        
        settings, created = cls.objects.get_or_create(
            company=company,
            defaults={
                'currency': 'EGP',
                'currency_symbol': 'ج.م',
                'default_tax_rate': 14.00,
                'invoice_prefix': 'INV',
                'low_stock_threshold': 10,
            }
        )
        return settings


class SocialLink(models.Model):
    """روابط التواصل الاجتماعي الإضافية"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='social_links')
    
    platform = models.CharField(max_length=50, verbose_name="المنصة")
    platform_ar = models.CharField(max_length=50, blank=True, null=True, verbose_name="المنصة بالعربية")
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name="أيقونة")
    url = models.URLField(verbose_name="الرابط")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")
    
    class Meta:
        db_table = 'social_links'
        verbose_name = "رابط تواصل اجتماعي"
        verbose_name_plural = "روابط التواصل الاجتماعي"
        ordering = ['order']
    
    def __str__(self):
        return f"{self.platform} - {self.company.name}"


class PaymentMethod(models.Model):
    """طرق الدفع المقبولة"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='payment_methods')
    
    name = models.CharField(max_length=100, verbose_name="اسم طريقة الدفع")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="اسم طريقة الدفع بالعربية")
    icon = models.ImageField(upload_to='payment_methods/', blank=True, null=True, verbose_name="أيقونة")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_default = models.BooleanField(default=False, verbose_name="الطريقة الافتراضية")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")
    
    class Meta:
        db_table = 'payment_methods'
        verbose_name = "طريقة دفع"
        verbose_name_plural = "طرق الدفع"
        ordering = ['order']
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"


class ShippingMethod(models.Model):
    """طرق الشحن والتوصيل"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='shipping_methods')
    
    name = models.CharField(max_length=100, verbose_name="اسم طريقة الشحن")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="اسم طريقة الشحن بالعربية")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="التكلفة")
    estimated_days = models.PositiveIntegerField(default=3, verbose_name="أيام التوصيل المتوقعة")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_default = models.BooleanField(default=False, verbose_name="الطريقة الافتراضية")
    
    class Meta:
        db_table = 'shipping_methods'
        verbose_name = "طريقة شحن"
        verbose_name_plural = "طرق الشحن"
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"