"""
اختبارات تطبيق العملاء
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from customers.models import Customer

User = get_user_model()

class CustomerModelTest(TestCase):
    """اختبارات نموذج العميل"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.customer = Customer.objects.create(
            name='Test Customer',
            name_ar='عميل تجريبي',
            phone='123456789',
            email='customer@test.com',
            address='Test Address',
            balance=Decimal('100.00'),
            credit_limit=Decimal('1000.00'),
            is_vip=True,
            created_by=self.user
        )
    
    def test_create_customer(self):
        """اختبار إنشاء عميل جديد"""
        self.assertEqual(self.customer.name, 'Test Customer')
        self.assertEqual(self.customer.phone, '123456789')
        self.assertTrue(self.customer.is_active)
        self.assertTrue(self.customer.is_vip)
    
    def test_customer_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.customer), 'Test Customer')
    
    def test_customer_properties(self):
        """اختبار خصائص العميل"""
        self.assertEqual(self.customer.total_invoices, 0)
        self.assertEqual(self.customer.total_purchases, 0)
        self.assertEqual(self.customer.total_paid, 0)
        self.assertEqual(self.customer.outstanding_balance, 0)

class CustomerAPITest(TestCase):
    """اختبارات واجهات API للعملاء"""
    
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
        
        self.customer = Customer.objects.create(
            name='Test Customer',
            phone='123456789',
            balance=Decimal('100.00'),
            created_by=self.user
        )
    
    def test_create_customer(self):
        """اختبار إنشاء عميل جديد"""
        data = {
            'name': 'New Customer',
            'name_ar': 'عميل جديد',
            'phone': '987654321',
            'email': 'new@test.com',
            'address': 'New Address',
            'balance': '50.00',
            'credit_limit': '500.00',
            'is_vip': True
        }
        response = self.client.post('/api/v1/customers/api/customers/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Customer')
    
    def test_list_customers(self):
        """اختبار جلب قائمة العملاء"""
        response = self.client.get('/api/v1/customers/api/customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_get_customer_detail(self):
        """اختبار جلب تفاصيل العميل"""
        response = self.client.get(f'/api/v1/customers/api/customers/{self.customer.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Customer')
    
    def test_update_customer(self):
        """اختبار تحديث العميل"""
        data = {'name': 'Updated Customer', 'phone': '111111111'}
        response = self.client.patch(f'/api/v1/customers/api/customers/{self.customer.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Customer')
    
    def test_delete_customer(self):
        """اختبار حذف العميل"""
        response = self.client.delete(f'/api/v1/customers/api/customers/{self.customer.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_update_balance(self):
        """اختبار تحديث رصيد العميل"""
        data = {'amount': '50.00', 'notes': 'إضافة رصيد'}
        response = self.client.post(f'/api/v1/customers/api/customers/{self.customer.id}/update_balance/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # مقارنة Decimal مع Decimal
        self.assertEqual(response.data['new_balance'], Decimal('150.00'))
    
    def test_vip_customers(self):
        """اختبار جلب العملاء المميزين"""
        # إنشاء عميل مميز
        Customer.objects.create(
            name='VIP Customer',
            phone='555555555',
            is_vip=True,
            created_by=self.user
        )
        response = self.client.get('/api/v1/customers/api/customers/vip/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_top_spenders(self):
        """اختبار جلب العملاء الأكثر إنفاقاً"""
        response = self.client.get('/api/v1/customers/api/customers/top_spenders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
