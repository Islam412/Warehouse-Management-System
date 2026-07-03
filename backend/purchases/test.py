"""
اختبارات تطبيق المشتريات
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from products.models import Category, Brand, Unit, Product
from suppliers.models import Supplier
from inventory.models import Warehouse, Stock
from purchases.models import PurchaseOrder, PurchaseItem

User = get_user_model()

class PurchaseOrderModelTest(TestCase):
    """اختبارات نموذج أمر الشراء"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.supplier = Supplier.objects.create(
            name='Test Supplier',
            phone='123456789'
        )
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        self.order = PurchaseOrder.objects.create(
            order_number='PO-001',
            supplier=self.supplier,
            warehouse=self.warehouse,
            expected_date=datetime.now().date() + timedelta(days=7),
            created_by=self.user
        )
    
    def test_create_order(self):
        """اختبار إنشاء أمر شراء"""
        self.assertEqual(self.order.order_number, 'PO-001')
        self.assertEqual(self.order.status, 'draft')
    
    def test_order_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.order), 'PO-001 - Test Supplier')

class PurchasesAPITest(TestCase):
    """اختبارات واجهات API للمشتريات"""
    
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
        
        self.supplier = Supplier.objects.create(
            name='Test Supplier',
            phone='123456789'
        )
        
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
            purchase_price=Decimal('50.00'),
            selling_price=Decimal('80.00'),
            created_by=self.user
        )
    
    def test_create_purchase_order(self):
        """اختبار إنشاء أمر شراء جديد"""
        expected_date = (datetime.now().date() + timedelta(days=7)).isoformat()
        data = {
            'supplier': str(self.supplier.id),
            'warehouse': str(self.warehouse.id),
            'expected_date': expected_date,
            'items': [
                {
                    'product': str(self.product.id),
                    'quantity': '10',
                    'unit_price': '50.00'
                }
            ]
        }
        response = self.client.post('/api/v1/purchases/api/orders/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_orders(self):
        """اختبار جلب قائمة أوامر الشراء"""
        response = self.client.get('/api/v1/purchases/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_receive_order(self):
        """اختبار استلام أمر الشراء"""
        # إنشاء أمر شراء
        order = PurchaseOrder.objects.create(
            order_number='PO-002',
            supplier=self.supplier,
            warehouse=self.warehouse,
            expected_date=datetime.now().date() + timedelta(days=7),
            created_by=self.user
        )
        
        # إنشاء بند
        item = PurchaseItem.objects.create(
            order=order,
            product=self.product,
            quantity=10,
            unit_price=50.00
        )
        
        data = {
            'items': [
                {
                    'item_id': str(item.id),
                    'received_quantity': '5'
                }
            ]
        }
        response = self.client.post(f'/api/v1/purchases/api/orders/{order.id}/receive/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_cancel_order(self):
        """اختبار إلغاء أمر الشراء"""
        order = PurchaseOrder.objects.create(
            order_number='PO-003',
            supplier=self.supplier,
            warehouse=self.warehouse,
            expected_date=datetime.now().date() + timedelta(days=7),
            created_by=self.user
        )
        
        response = self.client.post(f'/api/v1/purchases/api/orders/{order.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')
