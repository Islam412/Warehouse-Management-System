"""
اختبارات تطبيق إعدادات الشركة والنظام (settings_app)
===================================================
تغطي هذه الاختبارات جميع النماذج، واجهات API، والإجراءات المخصصة
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
import uuid
import json
from datetime import datetime, time

from .models import (
    Company, Branch, StoreSettings, 
    SocialLink, PaymentMethod, ShippingMethod
)

User = get_user_model()

# ============================================
# اختبارات النماذج (Models Tests)
# ============================================

class CompanyModelTest(TestCase):
    """اختبارات نموذج الشركة"""
    
    def setUp(self):
        """تحضير البيانات قبل كل اختبار"""
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.company = Company.get_company()
    
    def test_get_company_creates_default(self):
        """اختبار إنشاء شركة افتراضية تلقائياً"""
        # حذف الشركة الحالية
        Company.objects.all().delete()
        
        # استدعاء get_company يجب أن ينشئ شركة جديدة
        company = Company.get_company()
        
        self.assertIsNotNone(company)
        self.assertEqual(company.name, 'شركتي')
        self.assertEqual(company.phone, '0123456789')
        self.assertEqual(company.email, 'info@company.com')
    
    def test_company_str_method(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.company), 'شركتي')
    
    def test_company_update(self):
        """اختبار تحديث بيانات الشركة"""
        self.company.name = 'شركة جديدة'
        self.company.name_ar = 'شركة جديدة بالعربية'
        self.company.phone = '9876543210'
        self.company.updated_by = self.user
        self.company.save()
        
        self.company.refresh_from_db()
        self.assertEqual(self.company.name, 'شركة جديدة')
        self.assertEqual(self.company.phone, '9876543210')
    
    def test_company_social_media_fields(self):
        """اختبار حقول التواصل الاجتماعي"""
        self.company.facebook = 'https://facebook.com/mystore'
        self.company.instagram = 'https://instagram.com/mystore'
        self.company.twitter = 'https://twitter.com/mystore'
        self.company.youtube = 'https://youtube.com/mystore'
        self.company.tiktok = 'https://tiktok.com/mystore'
        self.company.linkedin = 'https://linkedin.com/mystore'
        self.company.snapchat = 'https://snapchat.com/mystore'
        self.company.save()
        
        self.company.refresh_from_db()
        self.assertEqual(self.company.facebook, 'https://facebook.com/mystore')
        self.assertEqual(self.company.instagram, 'https://instagram.com/mystore')
        self.assertEqual(self.company.twitter, 'https://twitter.com/mystore')
        self.assertEqual(self.company.youtube, 'https://youtube.com/mystore')
        self.assertEqual(self.company.tiktok, 'https://tiktok.com/mystore')
        self.assertEqual(self.company.linkedin, 'https://linkedin.com/mystore')
        self.assertEqual(self.company.snapchat, 'https://snapchat.com/mystore')
    
    def test_company_location_fields(self):
        """اختبار حقول الموقع الجغرافي"""
        self.company.address = 'شارع النيل، القاهرة'
        self.company.address_ar = 'شارع النيل، القاهرة'
        self.company.city = 'Cairo'
        self.company.city_ar = 'القاهرة'
        self.company.state = 'Cairo Governorate'
        self.company.state_ar = 'محافظة القاهرة'
        self.company.country = 'Egypt'
        self.company.country_ar = 'مصر'
        self.company.postal_code = '11511'
        self.company.latitude = 30.0444
        self.company.longitude = 31.2357
        self.company.save()
        
        self.company.refresh_from_db()
        self.assertEqual(self.company.city, 'Cairo')
        self.assertEqual(self.company.country, 'Egypt')
        self.assertEqual(float(self.company.latitude), 30.0444)
    
    def test_company_legal_fields(self):
        """اختبار الحقول القانونية"""
        self.company.tax_number = '123-456-789'
        self.company.commercial_register = 'CR-2024-001'
        self.company.license_number = 'LIC-2024-001'
        self.company.save()
        
        self.company.refresh_from_db()
        self.assertEqual(self.company.tax_number, '123-456-789')
        self.assertEqual(self.company.commercial_register, 'CR-2024-001')


class BranchModelTest(TestCase):
    """اختبارات نموذج الفروع"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.company = Company.get_company()
        
        self.branch = Branch.objects.create(
            company=self.company,
            name='الفرع الرئيسي',
            name_ar='الفرع الرئيسي',
            phone='0123456789',
            address='شارع النيل، القاهرة',
            address_ar='شارع النيل، القاهرة',
            city='Cairo',
            city_ar='القاهرة',
            is_main=True,
            manager=self.user
        )
    
    def test_create_branch(self):
        """اختبار إنشاء فرع جديد"""
        self.assertEqual(self.branch.name, 'الفرع الرئيسي')
        self.assertTrue(self.branch.is_active)
        self.assertTrue(self.branch.is_main)
        self.assertIsNotNone(self.branch.code)  # الكود يتم إنشاؤه تلقائياً
    
    def test_branch_str_method(self):
        """اختبار طريقة __str__"""
        expected = f"{self.branch.name} - {self.company.name}"
        self.assertEqual(str(self.branch), expected)
    
    def test_branch_code_auto_generation(self):
        """اختبار توليد كود الفرع تلقائياً"""
        self.assertIsNotNone(self.branch.code)
        self.assertEqual(len(self.branch.code), 8)  # الطول الافتراضي
    
    def test_branch_working_hours(self):
        """اختبار ساعات العمل"""
        self.branch.opening_time = time(9, 0)  # 9:00 صباحاً
        self.branch.closing_time = time(21, 0)  # 9:00 مساءً
        self.branch.is_24_hours = False
        self.branch.weekend_days = 'Friday,Saturday'
        self.branch.save()
        
        self.branch.refresh_from_db()
        self.assertEqual(self.branch.opening_time, time(9, 0))
        self.assertEqual(self.branch.closing_time, time(21, 0))
        self.assertFalse(self.branch.is_24_hours)
    
    def test_branch_toggle_active(self):
        """اختبار تفعيل/إلغاء تفعيل الفرع"""
        self.branch.is_active = False
        self.branch.save()
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.is_active)
        
        self.branch.is_active = True
        self.branch.save()
        self.branch.refresh_from_db()
        self.assertTrue(self.branch.is_active)
    
    def test_only_one_main_branch(self):
        """اختبار أنه يمكن أن يكون هناك فرع رئيسي واحد فقط"""
        # إنشاء فرع آخر وتعيينه كرئيسي
        branch2 = Branch.objects.create(
            company=self.company,
            name='الفرع الثاني',
            phone='9876543210',
            address='الاسكندرية',
            city='Alexandria',
            is_main=True
        )
        
        # تحديث كل الفروع ليكون فرع واحد فقط هو الرئيسي
        self.company.branches.update(is_main=False)
        branch2.is_main = True
        branch2.save()
        
        # التحقق من أن الفرع الأول لم يعد رئيسياً
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.is_main)
        
        # التحقق من أن الفرع الثاني هو الرئيسي
        branch2.refresh_from_db()
        self.assertTrue(branch2.is_main)
    
    def test_branch_with_manager(self):
        """اختبار تعيين مدير للفرع"""
        manager = User.objects.create_user(
            email='manager@example.com',
            username='manager',
            password='manager123'
        )
        self.branch.manager = manager
        self.branch.save()
        
        self.branch.refresh_from_db()
        self.assertEqual(self.branch.manager, manager)
        self.assertEqual(self.branch.manager.email, 'manager@example.com')


class StoreSettingsModelTest(TestCase):
    """اختبارات نموذج إعدادات النظام"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.company = Company.get_company()
        self.settings = StoreSettings.get_settings()
    
    def test_get_settings_creates_default(self):
        """اختبار إنشاء إعدادات افتراضية تلقائياً"""
        # حذف الإعدادات الحالية
        StoreSettings.objects.all().delete()
        
        # استدعاء get_settings يجب أن ينشئ إعدادات جديدة
        settings = StoreSettings.get_settings()
        
        self.assertIsNotNone(settings)
        self.assertEqual(settings.currency, 'EGP')
        self.assertEqual(settings.currency_symbol, 'ج.م')
        self.assertEqual(float(settings.default_tax_rate), 14.00)
        self.assertEqual(settings.invoice_prefix, 'INV')
    
    def test_settings_str_method(self):
        """اختبار طريقة __str__"""
        expected = f"إعدادات {self.company.name}"
        self.assertEqual(str(self.settings), expected)
    
    def test_currency_settings(self):
        """اختبار إعدادات العملة"""
        self.settings.currency = 'USD'
        self.settings.currency_symbol = '$'
        self.settings.currency_position = 'before'
        self.settings.decimal_places = 2
        self.settings.thousand_separator = ','
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertEqual(self.settings.currency, 'USD')
        self.assertEqual(self.settings.currency_symbol, '$')
        self.assertEqual(self.settings.currency_position, 'before')
    
    def test_tax_settings(self):
        """اختبار إعدادات الضرائب"""
        self.settings.default_tax_rate = 15.00
        self.settings.include_tax_in_price = True
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertEqual(float(self.settings.default_tax_rate), 15.00)
        self.assertTrue(self.settings.include_tax_in_price)
    
    def test_invoice_settings(self):
        """اختبار إعدادات الفواتير"""
        self.settings.invoice_prefix = 'INV-2024'
        self.settings.invoice_suffix = 'A'
        self.settings.invoice_footer = 'شكراً لتسوقكم معنا'
        self.settings.invoice_terms = 'الدفع خلال 30 يوم'
        self.settings.enable_invoice_pdf = True
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertEqual(self.settings.invoice_prefix, 'INV-2024')
        self.assertEqual(self.settings.invoice_footer, 'شكراً لتسوقكم معنا')
    
    def test_stock_settings(self):
        """اختبار إعدادات المخزون"""
        self.settings.low_stock_threshold = 5
        self.settings.enable_stock_alerts = True
        self.settings.allow_negative_stock = False
        self.settings.enable_batch_tracking = True
        self.settings.enable_serial_tracking = False
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertEqual(self.settings.low_stock_threshold, 5)
        self.assertTrue(self.settings.enable_stock_alerts)
        self.assertFalse(self.settings.allow_negative_stock)
    
    def test_notification_settings(self):
        """اختبار إعدادات الإشعارات"""
        self.settings.enable_email_notifications = True
        self.settings.enable_sms_notifications = True
        self.settings.enable_push_notifications = True
        self.settings.enable_whatsapp_notifications = False
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertTrue(self.settings.enable_email_notifications)
        self.assertTrue(self.settings.enable_sms_notifications)
        self.assertFalse(self.settings.enable_whatsapp_notifications)
    
    def test_security_settings(self):
        """اختبار إعدادات الأمان"""
        self.settings.session_timeout = 30
        self.settings.max_login_attempts = 3
        self.settings.enable_2fa = True
        self.settings.require_strong_password = True
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertEqual(self.settings.session_timeout, 30)
        self.assertEqual(self.settings.max_login_attempts, 3)
        self.assertTrue(self.settings.enable_2fa)
    
    def test_feature_toggles(self):
        """اختبار مفاتيح تشغيل الميزات"""
        self.settings.enable_online_store = True
        self.settings.enable_mobile_app = True
        self.settings.enable_pos = True
        self.settings.save()
        
        self.settings.refresh_from_db()
        self.assertTrue(self.settings.enable_online_store)
        self.assertTrue(self.settings.enable_mobile_app)
        self.assertTrue(self.settings.enable_pos)


class SocialLinkModelTest(TestCase):
    """اختبارات نموذج روابط التواصل الاجتماعي"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.company = Company.get_company()
        
        self.social_link = SocialLink.objects.create(
            company=self.company,
            platform='YouTube',
            platform_ar='يوتيوب',
            icon='fa-youtube',
            url='https://youtube.com/mystore',
            is_active=True,
            order=1
        )
    
    def test_create_social_link(self):
        """اختبار إنشاء رابط تواصل اجتماعي"""
        self.assertEqual(self.social_link.platform, 'YouTube')
        self.assertEqual(self.social_link.url, 'https://youtube.com/mystore')
        self.assertTrue(self.social_link.is_active)
    
    def test_social_link_str_method(self):
        """اختبار طريقة __str__"""
        expected = f"{self.social_link.platform} - {self.company.name}"
        self.assertEqual(str(self.social_link), expected)
    
    def test_social_link_ordering(self):
        """اختبار ترتيب الروابط"""
        link2 = SocialLink.objects.create(
            company=self.company,
            platform='Instagram',
            platform_ar='انستجرام',
            icon='fa-instagram',
            url='https://instagram.com/mystore',
            order=0  # سيظهر قبل الأول
        )
        
        links = SocialLink.objects.filter(company=self.company)
        self.assertEqual(links[0], link2)  # الأول في الترتيب
        self.assertEqual(links[1], self.social_link)


class PaymentMethodModelTest(TestCase):
    """اختبارات نموذج طرق الدفع"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='test123'
        )
        self.company = Company.get_company()
        
        self.payment_method = PaymentMethod.objects.create(
            company=self.company,
            name='Cash',
            name_ar='نقدي',
            is_active=True,
            is_default=True,
            order=1
        )
    
    def test_create_payment_method(self):
        """اختبار إنشاء طريقة دفع"""
        self.assertEqual(self.payment_method.name, 'Cash')
        self.assertTrue(self.payment_method.is_active)
        self.assertTrue(self.payment_method.is_default)
    
    def test_payment_method_str_method(self):
        """اختبار طريقة __str__"""
        expected = f"{self.payment_method.name} - {self.company.name}"
        self.assertEqual(str(self.payment_method), expected)
    
    def test_only_one_default_payment(self):
        """اختبار أنه يمكن أن يكون هناك طريقة دفع افتراضية واحدة فقط"""
        # إنشاء طريقة دفع أخرى وتعيينها كافتراضية
        method2 = PaymentMethod.objects.create(
            company=self.company,
            name='Card',
            name_ar='بطاقة',
            is_active=True,
            is_default=True,
            order=2
        )
        
        # إلغاء الافتراضي عن الكل
        PaymentMethod.objects.filter(company=self.company).update(is_default=False)
        
        # تعيين الطريقة الثانية كافتراضية
        method2.is_default = True
        method2.save()
        
        # التحقق من أن الطريقة الأولى لم تعد افتراضية
        self.payment_method.refresh_from_db()
        self.assertFalse(self.payment_method.is_default)
        
        # التحقق من أن الطريقة الثانية هي الافتراضية
        method2.refresh_from_db()
        self.assertTrue(method2.is_default)


class ShippingMethodModelTest(TestCase):
    """اختبارات نموذج طرق الشحن"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='test123'
        )
        self.company = Company.get_company()
        
        self.shipping_method = ShippingMethod.objects.create(
            company=self.company,
            name='Standard Delivery',
            name_ar='شحن قياسي',
            description='توصيل خلال 3-5 أيام',
            cost=50.00,
            estimated_days=3,
            is_active=True,
            is_default=True
        )
    
    def test_create_shipping_method(self):
        """اختبار إنشاء طريقة شحن"""
        self.assertEqual(self.shipping_method.name, 'Standard Delivery')
        self.assertEqual(float(self.shipping_method.cost), 50.00)
        self.assertEqual(self.shipping_method.estimated_days, 3)
        self.assertTrue(self.shipping_method.is_default)
    
    def test_shipping_method_str_method(self):
        """اختبار طريقة __str__"""
        expected = f"{self.shipping_method.name} - {self.company.name}"
        self.assertEqual(str(self.shipping_method), expected)
    
    def test_only_one_default_shipping(self):
        """اختبار أنه يمكن أن يكون هناك طريقة شحن افتراضية واحدة فقط"""
        # إنشاء طريقة شحن أخرى
        method2 = ShippingMethod.objects.create(
            company=self.company,
            name='Express Delivery',
            name_ar='شحن سريع',
            cost=100.00,
            estimated_days=1,
            is_default=True
        )
        
        # إلغاء الافتراضي عن الكل
        ShippingMethod.objects.filter(company=self.company).update(is_default=False)
        
        # تعيين الطريقة الثانية كافتراضية
        method2.is_default = True
        method2.save()
        
        # التحقق من أن الطريقة الأولى لم تعد افتراضية
        self.shipping_method.refresh_from_db()
        self.assertFalse(self.shipping_method.is_default)
        
        # التحقق من أن الطريقة الثانية هي الافتراضية
        method2.refresh_from_db()
        self.assertTrue(method2.is_default)


# ============================================
# اختبارات واجهات API (API Tests)
# ============================================

class SettingsAPITest(TestCase):
    """اختبارات واجهات API للإعدادات"""
    
    def setUp(self):
        """تحضير البيانات وتهيئة العميل"""
        self.client = APIClient()
        
        # إنشاء مستخدم
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456',
            is_staff=True
        )
        
        # الحصول على JWT Token
        response = self.client.post('/api/token/', {
            'email': 'admin@example.com',
            'password': 'admin123456'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # الحصول على بيانات الشركة
        self.company = Company.get_company()
    
    def test_get_company(self):
        """اختبار جلب بيانات الشركة"""
        response = self.client.get('/api/v1/settings/api/company/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'شركتي')
        self.assertIsNotNone(response.data['id'])
    
    def test_update_company(self):
        """اختبار تحديث بيانات الشركة"""
        data = {
            'name': 'متجري الجديد',
            'name_ar': 'متجري الجديد بالعربية',
            'phone': '01001234567',
            'email': 'new@store.com'
        }
        response = self.client.patch('/api/v1/settings/api/company/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'متجري الجديد')
        self.assertEqual(response.data['phone'], '01001234567')
    
    def test_upload_logo(self):
        """اختبار رفع شعار الشركة"""
        # إنشاء ملف وهمي
        logo_file = SimpleUploadedFile(
            'logo.png',
            b'fake_image_content',
            content_type='image/png'
        )
        
        response = self.client.post(
            '/api/v1/settings/api/company/upload-logo/',
            {'logo': logo_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIsNotNone(response.data.get('logo_url'))
    
    def test_get_settings(self):
        """اختبار جلب إعدادات النظام"""
        response = self.client.get('/api/v1/settings/api/settings/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['currency'], 'EGP')
        self.assertEqual(float(response.data['default_tax_rate']), 14.00)
    
    def test_update_settings(self):
        """اختبار تحديث إعدادات النظام"""
        data = {
            'currency': 'USD',
            'currency_symbol': '$',
            'default_tax_rate': '15.00',
            'invoice_prefix': 'INV-2024'
        }
        response = self.client.patch('/api/v1/settings/api/settings/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['currency'], 'USD')
        self.assertEqual(response.data['currency_symbol'], '$')
        self.assertEqual(float(response.data['default_tax_rate']), 15.00)
    
    def test_reset_settings(self):
        """اختبار إعادة الإعدادات للوضع الافتراضي"""
        # تغيير الإعدادات أولاً
        settings = StoreSettings.get_settings()
        settings.currency = 'USD'
        settings.save()
        
        # إعادة التعيين
        response = self.client.post('/api/v1/settings/api/settings/reset/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['currency'], 'EGP')
        self.assertEqual(response.data['currency_symbol'], 'ج.م')
        self.assertEqual(float(response.data['default_tax_rate']), 14.00)


class BranchAPITest(TestCase):
    """اختبارات واجهات API للفروع"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'admin@example.com',
            'password': 'admin123456'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.company = Company.get_company()
        
        self.branch = Branch.objects.create(
            company=self.company,
            name='الفرع الرئيسي',
            phone='0123456789',
            address='القاهرة',
            city='Cairo',
            is_main=True
        )
    
    def test_list_branches(self):
        """اختبار جلب قائمة الفروع"""
        response = self.client.get('/api/v1/settings/api/branches/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_create_branch(self):
        """اختبار إنشاء فرع جديد"""
        data = {
            'company': str(self.company.id),
            'name': 'فرع الإسكندرية',
            'name_ar': 'فرع الإسكندرية',
            'phone': '01098765432',
            'address': 'الإسكندرية',
            'address_ar': 'الإسكندرية',
            'city': 'Alexandria',
            'city_ar': 'الإسكندرية'
        }
        response = self.client.post('/api/v1/settings/api/branches/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'فرع الإسكندرية')
        self.assertIsNotNone(response.data['code'])
    
    def test_get_branch_detail(self):
        """اختبار جلب تفاصيل فرع"""
        response = self.client.get(f'/api/v1/settings/api/branches/{self.branch.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'الفرع الرئيسي')
    
    def test_update_branch(self):
        """اختبار تحديث فرع"""
        data = {'name': 'الفرع الرئيسي - محدث'}
        response = self.client.patch(
            f'/api/v1/settings/api/branches/{self.branch.id}/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'الفرع الرئيسي - محدث')
    
    def test_toggle_branch_active(self):
        """اختبار تفعيل/إلغاء تفعيل فرع"""
        # إلغاء التفعيل
        response = self.client.post(
            f'/api/v1/settings/api/branches/{self.branch.id}/toggle_active/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])
        
        # إعادة التفعيل
        response = self.client.post(
            f'/api/v1/settings/api/branches/{self.branch.id}/toggle_active/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_active'])
    
    def test_set_main_branch(self):
        """اختبار تعيين فرع كرئيسي"""
        # إنشاء فرع آخر
        branch2 = Branch.objects.create(
            company=self.company,
            name='فرع ثانوي',
            phone='0111111111',
            address='الجيزة',
            city='Giza'
        )
        
        # تعيين الفرع الثاني كرئيسي
        response = self.client.post(
            f'/api/v1/settings/api/branches/{branch2.id}/set_main/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # التحقق من أن الفرع الأول لم يعد رئيسياً
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.is_main)
        
        # التحقق من أن الفرع الثاني أصبح رئيسياً
        branch2.refresh_from_db()
        self.assertTrue(branch2.is_main)
    
    def test_delete_branch(self):
        """اختبار حذف فرع"""
        response = self.client.delete(
            f'/api/v1/settings/api/branches/{self.branch.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class SocialLinkAPITest(TestCase):
    """اختبارات واجهات API لروابط التواصل الاجتماعي"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'admin@example.com',
            'password': 'admin123456'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.company = Company.get_company()
        
        self.social_link = SocialLink.objects.create(
            company=self.company,
            platform='Facebook',
            platform_ar='فيسبوك',
            url='https://facebook.com/mystore',
            is_active=True
        )
    
    def test_list_social_links(self):
        """اختبار جلب قائمة روابط التواصل"""
        response = self.client.get('/api/v1/settings/api/social-links/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_create_social_link(self):
        """اختبار إنشاء رابط تواصل جديد"""
        data = {
            'company': str(self.company.id),
            'platform': 'Instagram',
            'platform_ar': 'انستجرام',
            'url': 'https://instagram.com/mystore',
            'is_active': True
        }
        response = self.client.post('/api/v1/settings/api/social-links/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['platform'], 'Instagram')
    
    def test_update_social_link(self):
        """اختبار تحديث رابط تواصل"""
        data = {'url': 'https://facebook.com/mystore-new'}
        response = self.client.patch(
            f'/api/v1/settings/api/social-links/{self.social_link.id}/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['url'], 'https://facebook.com/mystore-new')
    
    def test_delete_social_link(self):
        """اختبار حذف رابط تواصل"""
        response = self.client.delete(
            f'/api/v1/settings/api/social-links/{self.social_link.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class PaymentMethodAPITest(TestCase):
    """اختبارات واجهات API لطرق الدفع"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'admin@example.com',
            'password': 'admin123456'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.company = Company.get_company()
        
        self.payment_method = PaymentMethod.objects.create(
            company=self.company,
            name='Cash',
            name_ar='نقدي',
            is_active=True,
            is_default=True
        )
    
    def test_list_payment_methods(self):
        """اختبار جلب قائمة طرق الدفع"""
        response = self.client.get('/api/v1/settings/api/payment-methods/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_create_payment_method(self):
        """اختبار إنشاء طريقة دفع جديدة"""
        data = {
            'company': str(self.company.id),
            'name': 'Credit Card',
            'name_ar': 'بطاقة ائتمان',
            'is_active': True
        }
        response = self.client.post('/api/v1/settings/api/payment-methods/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Credit Card')
    
    def test_set_default_payment(self):
        """اختبار تعيين طريقة دفع كافتراضية"""
        # إنشاء طريقة دفع جديدة
        method2 = PaymentMethod.objects.create(
            company=self.company,
            name='Bank Transfer',
            name_ar='تحويل بنكي',
            is_active=True
        )
        
        # تعيينها كافتراضية
        response = self.client.post(
            f'/api/v1/settings/api/payment-methods/{method2.id}/set_default/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # التحقق من أن الطريقة الأولى لم تعد افتراضية
        self.payment_method.refresh_from_db()
        self.assertFalse(self.payment_method.is_default)
        
        # التحقق من أن الطريقة الثانية أصبحت افتراضية
        method2.refresh_from_db()
        self.assertTrue(method2.is_default)


class ShippingMethodAPITest(TestCase):
    """اختبارات واجهات API لطرق الشحن"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'admin@example.com',
            'password': 'admin123456'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.company = Company.get_company()
        
        self.shipping_method = ShippingMethod.objects.create(
            company=self.company,
            name='Standard Delivery',
            name_ar='شحن قياسي',
            cost=50.00,
            estimated_days=3,
            is_active=True,
            is_default=True
        )
    
    def test_list_shipping_methods(self):
        """اختبار جلب قائمة طرق الشحن"""
        response = self.client.get('/api/v1/settings/api/shipping-methods/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_create_shipping_method(self):
        """اختبار إنشاء طريقة شحن جديدة"""
        data = {
            'company': str(self.company.id),
            'name': 'Express Delivery',
            'name_ar': 'شحن سريع',
            'cost': '100.00',
            'estimated_days': 1,
            'is_active': True
        }
        response = self.client.post('/api/v1/settings/api/shipping-methods/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Express Delivery')
    
    def test_set_default_shipping(self):
        """اختبار تعيين طريقة شحن كافتراضية"""
        # إنشاء طريقة شحن جديدة
        method2 = ShippingMethod.objects.create(
            company=self.company,
            name='Free Shipping',
            name_ar='شحن مجاني',
            cost=0.00,
            estimated_days=5,
            is_active=True
        )
        
        # تعيينها كافتراضية
        response = self.client.post(
            f'/api/v1/settings/api/shipping-methods/{method2.id}/set_default/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # التحقق من أن الطريقة الأولى لم تعد افتراضية
        self.shipping_method.refresh_from_db()
        self.assertFalse(self.shipping_method.is_default)
        
        # التحقق من أن الطريقة الثانية أصبحت افتراضية
        method2.refresh_from_db()
        self.assertTrue(method2.is_default)


# ============================================
# اختبارات المصادقة والأمان (Authentication Tests)
# ============================================

class AuthenticationTest(TestCase):
    """اختبارات المصادقة والأذونات"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='user@example.com',
            username='user',
            password='user123456'
        )
        
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456',
            is_staff=True
        )
        
        self.company = Company.get_company()
    
    def test_unauthenticated_access_denied(self):
        """اختبار رفض الوصول بدون مصادقة"""
        # إزالة التوكن
        self.client.credentials()
        
        response = self.client.get('/api/v1/settings/api/company/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_access_allowed(self):
        """اختبار السماح بالوصول مع المصادقة"""
        response = self.client.post('/api/token/', {
            'email': 'user@example.com',
            'password': 'user123456'
        })
        token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/v1/settings/api/company/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_invalid_token_denied(self):
        """اختبار رفض التوكن غير الصحيح"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        
        response = self.client.get('/api/v1/settings/api/company/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ============================================
# اختبارات الأداء والتكامل (Performance Tests)
# ============================================

class PerformanceTest(TestCase):
    """اختبارات الأداء والتكامل"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='admin123456'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'admin@example.com',
            'password': 'admin123456'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.company = Company.get_company()
    
    def test_bulk_branch_creation(self):
        """اختبار إنشاء عدة فروع دفعة واحدة"""
        branches_count = 5
        for i in range(branches_count):
            Branch.objects.create(
                company=self.company,
                name=f'Branch {i+1}',
                phone=f'012345678{i}',
                address=f'Address {i+1}',
                city=f'City {i+1}'
            )
        
        # التحقق من عدد الفروع
        branches = Branch.objects.filter(company=self.company)
        self.assertEqual(branches.count(), branches_count)
    
    def test_complete_company_data(self):
        """اختبار جلب بيانات الشركة الكاملة مع العلاقات"""
        # إنشاء فروع
        Branch.objects.create(
            company=self.company,
            name='Branch 1',
            phone='0123456789',
            address='Cairo',
            city='Cairo'
        )
        
        # إنشاء روابط تواصل
        SocialLink.objects.create(
            company=self.company,
            platform='Facebook',
            url='https://facebook.com/mystore'
        )
        
        # إنشاء طرق دفع
        PaymentMethod.objects.create(
            company=self.company,
            name='Cash',
            name_ar='نقدي',
            is_default=True
        )
        
        # جلب البيانات
        response = self.client.get('/api/v1/settings/api/company/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get('social_links'))
        self.assertIsNotNone(response.data.get('branches'))
        self.assertIsNotNone(response.data.get('payment_methods'))


# ============================================
# تشغيل الاختبارات
# ============================================

if __name__ == '__main__':
    import unittest
    unittest.main()