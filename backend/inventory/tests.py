"""
اختبارات تطبيق المخزون
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from products.models import Category, Brand, Unit, Product
from inventory.models import Warehouse, Stock, StockMovement

User = get_user_model()

# ============== اختبارات النماذج ==============
class WarehouseModelTest(TestCase):
    """اختبارات نموذج المخزن"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            name_ar='المخزن الرئيسي',
            location='الطابق الأول',
            manager=self.user
        )
    
    def test_create_warehouse(self):
        """اختبار إنشاء مخزن جديد"""
        self.assertEqual(self.warehouse.name, 'المخزن الرئيسي')
        self.assertTrue(self.warehouse.is_active)
    
    def test_warehouse_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.warehouse), 'المخزن الرئيسي')

class StockModelTest(TestCase):
    """اختبارات نموذج المخزون"""
    
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
            category=self.category,
            brand=self.brand,
            unit=self.unit,
            sku='SKU001',
            purchase_price=50.00,
            selling_price=80.00,
            created_by=self.user
        )
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        self.stock = Stock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=100,
            min_quantity=10,
            max_quantity=200
        )
    
    def test_create_stock(self):
        """اختبار إنشاء مخزون جديد"""
        self.assertEqual(self.stock.quantity, 100)
        self.assertEqual(self.stock.min_quantity, 10)
        self.assertEqual(self.stock.max_quantity, 200)
    
    def test_available_quantity(self):
        """اختبار الكمية المتاحة"""
        self.stock.reserved_quantity = 20
        self.assertEqual(self.stock.available_quantity, 80)
    
    def test_is_low_stock(self):
        """اختبار حالة المخزون المنخفض"""
        self.stock.quantity = 5
        self.assertTrue(self.stock.is_low_stock)
    
    def test_is_over_stock(self):
        """اختبار حالة المخزون الزائد"""
        self.stock.quantity = 250
        self.assertTrue(self.stock.is_over_stock)

class StockMovementModelTest(TestCase):
    """اختبارات نموذج حركة المخزون"""
    
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
            category=self.category,
            brand=self.brand,
            unit=self.unit,
            sku='SKU001',
            purchase_price=50.00,
            selling_price=80.00,
            created_by=self.user
        )
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        self.movement = StockMovement.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            movement_type='purchase',
            quantity=50,
            previous_quantity=0,
            new_quantity=50,
            created_by=self.user
        )
    
    def test_create_movement(self):
        """اختبار إنشاء حركة مخزون"""
        self.assertEqual(self.movement.quantity, 50)
        self.assertEqual(self.movement.previous_quantity, 0)
        self.assertEqual(self.movement.new_quantity, 50)
    
    def test_movement_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('شراء', str(self.movement))

# ============== اختبارات API ==============
class InventoryAPITest(TestCase):
    """اختبارات واجهات API للمخزون"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        
        self.category = Category.objects.create(name='صنابير')
        self.brand = Brand.objects.create(name='Ideal')
        self.unit = Unit.objects.create(name='قطعة')
        self.product = Product.objects.create(
            name='قلب حنفية',
            category=self.category,
            brand=self.brand,
            unit=self.unit,
            sku='SKU001',
            purchase_price=50.00,
            selling_price=80.00,
            created_by=self.user
        )
        
        self.stock = Stock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=100,
            min_quantity=10,
            max_quantity=200
        )
    
    def test_list_warehouses(self):
        """اختبار جلب قائمة المخازن"""
        response = self.client.get('/api/v1/inventory/api/warehouses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_warehouse(self):
        """اختبار إنشاء مخزن جديد"""
        data = {
            'name': 'مخزن فرعي',
            'name_ar': 'مخزن فرعي',
            'location': 'الطابق الثاني',
            'manager': self.user.id
        }
        response = self.client.post('/api/v1/inventory/api/warehouses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_stocks(self):
        """اختبار جلب قائمة المخزون"""
        response = self.client.get('/api/v1/inventory/api/stocks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_low_stock(self):
        """اختبار جلب المنتجات منخفضة المخزون"""
        response = self.client.get('/api/v1/inventory/api/stocks/low_stock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_adjust_stock(self):
        """اختبار تعديل المخزون"""
        data = {
            'product_id': str(self.product.id),
            'warehouse_id': str(self.warehouse.id),
            'quantity': 50,
            'movement_type': 'purchase',
            'notes': 'شراء جديد'
        }
        response = self.client.post('/api/v1/inventory/api/movements/adjust_stock/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_movements(self):
        """اختبار جلب قائمة الحركات"""
        response = self.client.get('/api/v1/inventory/api/movements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
