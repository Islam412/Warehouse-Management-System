"""
اختبارات تطبيق التقارير
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from products.models import Category, Brand, Unit, Product
from customers.models import Customer
from suppliers.models import Supplier
from inventory.models import Warehouse, Stock, StockMovement
from sales.models import Invoice, InvoiceItem, Payment
from purchases.models import PurchaseOrder, PurchaseItem
from reports.models import ReportLog

User = get_user_model()

class ReportLogModelTest(TestCase):
    """اختبارات نموذج سجل التقارير"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.report_log = ReportLog.objects.create(
            report_type='sales',
            title='تقرير المبيعات',
            filters={'date_from': '2024-01-01'},
            format='json',
            created_by=self.user
        )
    
    def test_create_report_log(self):
        """اختبار إنشاء سجل تقرير"""
        self.assertEqual(self.report_log.report_type, 'sales')
        self.assertEqual(self.report_log.title, 'تقرير المبيعات')
        self.assertEqual(self.report_log.format, 'json')
    
    def test_report_log_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('مبيعات', str(self.report_log))

class ReportsAPITest(TestCase):
    """اختبارات واجهات API للتقارير"""
    
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
        
        # إنشاء بيانات للاختبار
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
        
        self.customer = Customer.objects.create(
            name='Test Customer',
            phone='123456789',
            created_by=self.user
        )
        
        self.supplier = Supplier.objects.create(
            name='Test Supplier',
            phone='987654321',
            created_by=self.user
        )
        
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        
        # إنشاء فاتورة
        self.invoice = Invoice.objects.create(
            invoice_number='INV-001',
            customer=self.customer,
            due_date=datetime.now().date() + timedelta(days=30),
            total=Decimal('160.00'),
            paid_amount=Decimal('100.00'),
            remaining_amount=Decimal('60.00'),
            status='partially_paid',
            created_by=self.user
        )
        
        InvoiceItem.objects.create(
            invoice=self.invoice,
            product=self.product,
            quantity=2,
            unit_price=Decimal('80.00'),
            total=Decimal('160.00')
        )
        
        # إنشاء أمر شراء
        self.purchase = PurchaseOrder.objects.create(
            order_number='PO-001',
            supplier=self.supplier,
            warehouse=self.warehouse,
            expected_date=datetime.now().date() + timedelta(days=7),
            total=Decimal('100.00'),
            status='received',
            created_by=self.user
        )
        
        PurchaseItem.objects.create(
            order=self.purchase,
            product=self.product,
            quantity=2,
            unit_price=Decimal('50.00'),
            total=Decimal('100.00')
        )
        
        # إنشاء مخزون
        self.stock = Stock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=50,
            min_quantity=10
        )
    
    def test_sales_report(self):
        """اختبار تقرير المبيعات"""
        data = {
            'date_from': (datetime.now() - timedelta(days=30)).date().isoformat(),
            'date_to': datetime.now().date().isoformat()
        }
        response = self.client.post('/api/v1/reports/api/reports/sales/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('daily_sales', response.data)
        self.assertIn('customer_sales', response.data)
        self.assertIn('product_sales', response.data)
    
    def test_purchases_report(self):
        """اختبار تقرير المشتريات"""
        data = {
            'date_from': (datetime.now() - timedelta(days=30)).date().isoformat(),
            'date_to': datetime.now().date().isoformat()
        }
        response = self.client.post('/api/v1/reports/api/reports/purchases/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('supplier_purchases', response.data)
        self.assertIn('product_purchases', response.data)
    
    def test_inventory_report(self):
        """اختبار تقرير المخزون"""
        data = {}
        response = self.client.post('/api/v1/reports/api/reports/inventory/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('low_stock', response.data)
        self.assertIn('high_value', response.data)
    
    def test_profit_loss_report(self):
        """اختبار تقرير الأرباح والخسائر"""
        data = {
            'date_from': (datetime.now() - timedelta(days=30)).date().isoformat(),
            'date_to': datetime.now().date().isoformat()
        }
        response = self.client.post('/api/v1/reports/api/reports/profit_loss/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('product_profits', response.data)
    
    def test_customers_report(self):
        """اختبار تقرير العملاء"""
        data = {}
        response = self.client.post('/api/v1/reports/api/reports/customers/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('top_customers', response.data)
    
    def test_suppliers_report(self):
        """اختبار تقرير الموردين"""
        data = {}
        response = self.client.post('/api/v1/reports/api/reports/suppliers/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('top_suppliers', response.data)
    
    def test_report_logs(self):
        """اختبار جلب سجل التقارير"""
        # إنشاء بعض سجلات التقارير
        ReportLog.objects.create(
            report_type='sales',
            title='تقرير المبيعات 1',
            created_by=self.user
        )
        ReportLog.objects.create(
            report_type='purchases',
            title='تقرير المشتريات 1',
            created_by=self.user
        )
        
        response = self.client.get('/api/v1/reports/api/reports/logs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_report_filters(self):
        """اختبار فلاتر التقارير"""
        data = {
            'date_from': (datetime.now() - timedelta(days=30)).date().isoformat(),
            'date_to': datetime.now().date().isoformat(),
            'status': 'confirmed',
            'customer': str(self.customer.id)
        }
        response = self.client.post('/api/v1/reports/api/reports/sales/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_report_without_filters(self):
        """اختبار التقارير بدون فلاتر"""
        response = self.client.post('/api/v1/reports/api/reports/sales/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
