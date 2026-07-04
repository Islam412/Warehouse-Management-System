"""
اختبارات تطبيق الموردين
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from suppliers.models import Supplier

User = get_user_model()

class SupplierModelTest(TestCase):
    """اختبارات نموذج المورد"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.supplier = Supplier.objects.create(
            name='Test Supplier',
            name_ar='مورد تجريبي',
            phone='123456789',
            email='supplier@test.com',
            address='Test Address',
            balance=Decimal('100.00'),
            created_by=self.user
        )
    
    def test_create_supplier(self):
        """اختبار إنشاء مورد جديد"""
        self.assertEqual(self.supplier.name, 'Test Supplier')
        self.assertEqual(self.supplier.phone, '123456789')
        self.assertTrue(self.supplier.is_active)
    
    def test_supplier_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.supplier), 'Test Supplier')
    
    def test_supplier_total_purchases(self):
        """اختبار إجمالي المشتريات"""
        self.assertEqual(self.supplier.total_purchases, 0)

class SupplierAPITest(TestCase):
    """اختبارات واجهات API للموردين"""
    
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
            phone='123456789',
            balance=Decimal('100.00'),
            created_by=self.user
        )
    
    def test_create_supplier(self):
        """اختبار إنشاء مورد جديد"""
        data = {
            'name': 'New Supplier',
            'name_ar': 'مورد جديد',
            'phone': '987654321',
            'email': 'new@test.com',
            'address': 'New Address',
            'balance': '50.00'
        }
        response = self.client.post('/api/v1/suppliers/api/suppliers/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Supplier')
    
    def test_list_suppliers(self):
        """اختبار جلب قائمة الموردين"""
        response = self.client.get('/api/v1/suppliers/api/suppliers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_get_supplier_detail(self):
        """اختبار جلب تفاصيل المورد"""
        response = self.client.get(f'/api/v1/suppliers/api/suppliers/{self.supplier.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Supplier')
    
    def test_update_supplier(self):
        """اختبار تحديث المورد"""
        data = {'name': 'Updated Supplier', 'phone': '111111111'}
        response = self.client.patch(f'/api/v1/suppliers/api/suppliers/{self.supplier.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Supplier')
    
    def test_delete_supplier(self):
        """اختبار حذف المورد"""
        response = self.client.delete(f'/api/v1/suppliers/api/suppliers/{self.supplier.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_update_balance(self):
        """اختبار تحديث رصيد المورد"""
        data = {'amount': '50.00', 'notes': 'إضافة رصيد'}
        response = self.client.post(f'/api/v1/suppliers/api/suppliers/{self.supplier.id}/update_balance/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_balance'], Decimal('150.00'))
    
    def test_top_suppliers(self):
        """اختبار جلب الموردين الأكثر تعاملاً"""
        # إنشاء مورد آخر
        Supplier.objects.create(
            name='Another Supplier',
            phone='555555555',
            balance=Decimal('500.00'),
            created_by=self.user
        )
        response = self.client.get('/api/v1/suppliers/api/suppliers/top_suppliers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)