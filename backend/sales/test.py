"""
اختبارات تطبيق المبيعات
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from products.models import Category, Brand, Unit, Product
from customers.models import Customer
from inventory.models import Warehouse, Stock
from sales.models import Invoice, InvoiceItem, Payment, Return

User = get_user_model()

class InvoiceModelTest(TestCase):
    """اختبارات نموذج الفاتورة"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.customer = Customer.objects.create(
            name='Test Customer',
            phone='123456789'
        )
        self.invoice = Invoice.objects.create(
            invoice_number='INV-001',
            customer=self.customer,
            due_date=datetime.now().date() + timedelta(days=30),
            created_by=self.user
        )
    
    def test_create_invoice(self):
        """اختبار إنشاء فاتورة"""
        self.assertEqual(self.invoice.invoice_number, 'INV-001')
        self.assertEqual(self.invoice.status, 'draft')
    
    def test_invoice_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.invoice), 'INV-001 - Test Customer')

class SalesAPITest(TestCase):
    """اختبارات واجهات API للمبيعات"""
    
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
            phone='123456789'
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
        
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        
        self.stock = Stock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=100
        )
    
    def test_create_invoice(self):
        """اختبار إنشاء فاتورة جديدة"""
        due_date = (datetime.now().date() + timedelta(days=30)).isoformat()
        data = {
            'customer': str(self.customer.id),
            'due_date': due_date,
            'items': [
                {
                    'product': str(self.product.id),
                    'quantity': '2',
                    'unit_price': '80.00'
                }
            ]
        }
        response = self.client.post('/api/v1/sales/api/invoices/', data, format='json')
        # طباعة الاستجابة لمعرفة الخطأ
        print("Response data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_invoices(self):
        """اختبار جلب قائمة الفواتير"""
        response = self.client.get('/api/v1/sales/api/invoices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_add_payment(self):
        """اختبار إضافة دفعة"""
        invoice = Invoice.objects.create(
            invoice_number='INV-002',
            customer=self.customer,
            due_date=datetime.now().date() + timedelta(days=30),
            total=Decimal('160.00'),
            remaining_amount=Decimal('160.00'),
            created_by=self.user
        )
        
        data = {'amount': '100', 'payment_method': 'cash'}
        response = self.client.post(f'/api/v1/sales/api/invoices/{invoice.id}/add_payment/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_overdue_invoices(self):
        """اختبار جلب الفواتير المتأخرة"""
        Invoice.objects.create(
            invoice_number='INV-003',
            customer=self.customer,
            due_date=datetime.now().date() - timedelta(days=5),
            status='confirmed',
            total=Decimal('100.00'),
            remaining_amount=Decimal('50.00'),
            created_by=self.user
        )
        response = self.client.get('/api/v1/sales/api/invoices/overdue/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_today_invoices(self):
        """اختبار جلب فواتير اليوم"""
        Invoice.objects.create(
            invoice_number='INV-004',
            customer=self.customer,
            due_date=datetime.now().date() + timedelta(days=30),
            created_by=self.user
        )
        response = self.client.get('/api/v1/sales/api/invoices/today/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
