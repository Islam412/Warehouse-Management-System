"""
اختبارات تطبيق المنتجات
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from products.models import Category, Brand, Unit, Product, ProductImage

User = get_user_model()

# ============== اختبارات النماذج ==============
class CategoryModelTest(TestCase):
    """اختبارات نموذج الفئة"""
    
    def setUp(self):
        self.category = Category.objects.create(
            name='صنابير',
            name_ar='صنابير',
            description='جميع أنواع الصنابير'
        )
    
    def test_create_category(self):
        """اختبار إنشاء فئة جديدة"""
        self.assertEqual(self.category.name, 'صنابير')
        self.assertEqual(self.category.name_ar, 'صنابير')
        self.assertTrue(self.category.is_active)
    
    def test_category_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.category), 'صنابير')
    
    def test_category_hierarchy(self):
        """اختبار التسلسل الهرمي للفئات"""
        sub_category = Category.objects.create(
            name='صنابير مطبخ',
            name_ar='صنابير مطبخ',
            parent=self.category
        )
        self.assertEqual(sub_category.parent, self.category)

class BrandModelTest(TestCase):
    """اختبارات نموذج العلامة التجارية"""
    
    def setUp(self):
        self.brand = Brand.objects.create(
            name='Ideal',
            name_ar='ايديال',
            description='شركة ايديال للصنابير'
        )
    
    def test_create_brand(self):
        """اختبار إنشاء علامة تجارية جديدة"""
        self.assertEqual(self.brand.name, 'Ideal')
        self.assertEqual(self.brand.name_ar, 'ايديال')
        self.assertTrue(self.brand.is_active)
    
    def test_brand_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.brand), 'Ideal')

class UnitModelTest(TestCase):
    """اختبارات نموذج وحدة القياس"""
    
    def setUp(self):
        self.unit = Unit.objects.create(
            name='قطعة',
            name_ar='قطعة',
            symbol='قطعة'
        )
    
    def test_create_unit(self):
        """اختبار إنشاء وحدة قياس جديدة"""
        self.assertEqual(self.unit.name, 'قطعة')
        self.assertTrue(self.unit.is_active)
    
    def test_unit_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.unit), 'قطعة')

class ProductModelTest(TestCase):
    """اختبارات نموذج المنتج"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.category = Category.objects.create(name='صنابير')
        self.brand = Brand.objects.create(name='Ideal')
        self.unit = Unit.objects.create(name='قطعة')
        
        self.product = Product.objects.create(
            name='قلب حنفية',
            name_ar='قلب حنفية',
            category=self.category,
            brand=self.brand,
            unit=self.unit,
            sku='SKU001',
            barcode='1234567890',
            purchase_price=Decimal('50.00'),
            selling_price=Decimal('80.00'),
            wholesale_price=Decimal('65.00'),
            size='1/2',
            color='Chrome',
            created_by=self.user
        )
    
    def test_create_product(self):
        """اختبار إنشاء منتج جديد"""
        self.assertEqual(self.product.name, 'قلب حنفية')
        self.assertEqual(self.product.sku, 'SKU001')
        self.assertEqual(self.product.selling_price, Decimal('80.00'))
        self.assertTrue(self.product.is_active)
    
    def test_product_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.product), 'قلب حنفية - Ideal')
    
    def test_product_profit_margin(self):
        """اختبار حساب هامش الربح"""
        self.assertEqual(self.product.profit_margin, 60.0)
    
    def test_product_sku_unique(self):
        """اختبار أن SKU فريد"""
        with self.assertRaises(Exception):
            Product.objects.create(
                name='منتج آخر',
                category=self.category,
                brand=self.brand,
                unit=self.unit,
                sku='SKU001',
                purchase_price=Decimal('30.00'),
                selling_price=Decimal('50.00')
            )

# ============== اختبارات API ==============
class ProductAPITest(TestCase):
    """اختبارات واجهات API للمنتجات"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        # الحصول على JWT Token
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.category = Category.objects.create(name='صنابير')
        self.brand = Brand.objects.create(name='Ideal')
        self.unit = Unit.objects.create(name='قطعة')
        
        self.product = Product.objects.create(
            name='قلب حنفية',
            category=self.category,
            brand=self.brand,
            unit=self.unit,
            sku='SKU005',
            purchase_price=50.00,
            selling_price=80.00,
            created_by=self.user
        )
    
    def test_list_categories(self):
        """اختبار جلب قائمة الفئات"""
        response = self.client.get('/api/v1/products/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_category(self):
        """اختبار إنشاء فئة جديدة"""
        data = {'name': 'خلاطات', 'name_ar': 'خلاطات', 'description': 'جميع أنواع الخلاطات'}
        response = self.client.post('/api/v1/products/api/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_brand(self):
        """اختبار إنشاء علامة تجارية جديدة"""
        data = {'name': 'Grohe', 'name_ar': 'جروهي', 'description': 'شركة جروهي'}
        response = self.client.post('/api/v1/products/api/brands/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_brands(self):
        """اختبار جلب قائمة العلامات التجارية"""
        response = self.client.get('/api/v1/products/api/brands/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_unit(self):
        """اختبار إنشاء وحدة قياس جديدة"""
        data = {'name': 'كيلو', 'name_ar': 'كيلو', 'symbol': 'كجم'}
        response = self.client.post('/api/v1/products/api/units/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_units(self):
        """اختبار جلب قائمة وحدات القياس"""
        response = self.client.get('/api/v1/products/api/units/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_product(self):
        """اختبار إنشاء منتج جديد"""
        data = {
            'name': 'خلاط مطبخ',
            'category': self.category.id,
            'brand': self.brand.id,
            'unit': self.unit.id,
            'sku': 'SKU006',
            'purchase_price': '100.00',
            'selling_price': '150.00'
        }
        response = self.client.post('/api/v1/products/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_products(self):
        """اختبار جلب قائمة المنتجات"""
        response = self.client.get('/api/v1/products/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_product_detail(self):
        """اختبار جلب تفاصيل المنتج"""
        response = self.client.get(f'/api/v1/products/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'قلب حنفية')
    
    def test_update_product(self):
        """اختبار تحديث المنتج"""
        data = {'name': 'قلب حنفية محدث', 'selling_price': '90.00'}
        response = self.client.patch(f'/api/v1/products/api/products/{self.product.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_delete_product(self):
        """اختبار حذف المنتج"""
        response = self.client.delete(f'/api/v1/products/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_search_products(self):
        """اختبار البحث عن المنتجات"""
        response = self.client.get('/api/v1/products/api/products/search/?q=قلب')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
