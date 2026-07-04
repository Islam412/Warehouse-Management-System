"""
اختبارات تطبيق Dashboard - لوحة التحكم الشاملة
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
import json

from products.models import Category, Brand, Unit, Product
from customers.models import Customer
from suppliers.models import Supplier
from inventory.models import Warehouse, Stock, StockMovement
from sales.models import Invoice, InvoiceItem, Payment, Return
from purchases.models import PurchaseOrder, PurchaseItem
from finance.models import Expense, Income, Account
from dashboard.models import DashboardWidget

User = get_user_model()


class DashboardSummaryAPITest(TestCase):
    """اختبارات واجهة الملخص العام"""
    
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
            name='عميل تجريبي',
            phone='0123456789',
            created_by=self.user
        )
        
        self.supplier = Supplier.objects.create(
            name='مورد تجريبي',
            phone='9876543210',
            created_by=self.user
        )
        
        self.warehouse = Warehouse.objects.create(
            name='المخزن الرئيسي',
            manager=self.user
        )
        
        self.invoice = Invoice.objects.create(
            invoice_number='INV-001',
            customer=self.customer,
            due_date=timezone.now().date() + timedelta(days=30),
            total=Decimal('160.00'),
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
        
        self.purchase = PurchaseOrder.objects.create(
            order_number='PO-001',
            supplier=self.supplier,
            warehouse=self.warehouse,
            expected_date=timezone.now().date() + timedelta(days=7),
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
        
        self.stock = Stock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=50,
            min_quantity=10
        )
        
        self.expense = Expense.objects.create(
            category='rent',
            amount=Decimal('500.00'),
            date=timezone.now().date(),
            description='إيجار المكتب',
            created_by=self.user
        )
        
        self.income = Income.objects.create(
            category='sales',
            amount=Decimal('200.00'),
            date=timezone.now().date(),
            description='إيراد إضافي',
            created_by=self.user
        )
    
    def test_get_summary_authenticated(self):
        """اختبار جلب الملخص العام مع المصادقة"""
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sales', response.data)
        self.assertIn('finance', response.data)
        self.assertIn('inventory', response.data)
        self.assertIn('customers', response.data)
        self.assertIn('suppliers', response.data)
    
    def test_get_summary_unauthenticated(self):
        """اختبار رفض الوصول بدون مصادقة"""
        self.client.credentials()
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_sales_data(self):
        """اختبار بيانات المبيعات"""
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['sales']['today']['count'], 1)
        self.assertGreaterEqual(response.data['sales']['month']['total'], 0)
    
    def test_finance_data(self):
        """اختبار بيانات المالية"""
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('finance', response.data)
        self.assertIn('receivables', response.data['finance'])
        self.assertIn('payables', response.data['finance'])
    
    def test_inventory_data(self):
        """اختبار بيانات المخزون"""
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('inventory', response.data)
        self.assertIn('total_products', response.data['inventory'])
    
    def test_customers_data(self):
        """اختبار بيانات العملاء"""
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('customers', response.data)
        self.assertIn('total', response.data['customers'])
    
    def test_overdue_invoices(self):
        """اختبار الفواتير المتأخرة"""
        overdue_invoice = Invoice.objects.create(
            invoice_number='INV-OVERDUE',
            customer=self.customer,
            due_date=timezone.now().date() - timedelta(days=5),
            total=Decimal('200.00'),
            remaining_amount=Decimal('200.00'),
            status='confirmed',
            created_by=self.user
        )
        
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['overdue']['count'], 1)
    
    def test_returns_data(self):
        """اختبار بيانات المرتجعات"""
        return_item = Return.objects.create(
            invoice=self.invoice,
            product=self.product,
            quantity=1,
            amount=Decimal('80.00'),
            reason='عيوب في المنتج',
            created_by=self.user
        )
        
        response = self.client.get('/api/v1/dashboard/api/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('returns', response.data)


class DashboardSalesChartAPITest(TestCase):
    """اختبارات الرسوم البيانية للمبيعات"""
    
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
            name='عميل تجريبي',
            phone='0123456789',
            created_by=self.user
        )
    
    def test_sales_chart_month(self):
        """اختبار الرسم البياني للمبيعات - شهري"""
        response = self.client.get('/api/v1/dashboard/api/chart/sales/?period=month')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('labels', response.data)
        self.assertIn('sales', response.data)
        # ✅ إصلاح: 30 يوم
        self.assertEqual(len(response.data['labels']), 30)
    
    def test_sales_chart_week(self):
        """اختبار الرسم البياني للمبيعات - أسبوعي"""
        response = self.client.get('/api/v1/dashboard/api/chart/sales/?period=week')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # ✅ إصلاح: 7 أيام
        self.assertEqual(len(response.data['labels']), 7)
    
    def test_sales_chart_year(self):
        """اختبار الرسم البياني للمبيعات - سنوي"""
        response = self.client.get('/api/v1/dashboard/api/chart/sales/?period=year')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # ✅ إصلاح: 365 يوم
        self.assertEqual(len(response.data['labels']), 365)


class DashboardComparisonAPITest(TestCase):
    """اختبارات المقارنات"""
    
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
        
        self.category1 = Category.objects.create(name='صنابير')
        self.category2 = Category.objects.create(name='خلاطات')
        
        self.brand1 = Brand.objects.create(name='Ideal')
        self.brand2 = Brand.objects.create(name='Grohe')
        
        self.unit = Unit.objects.create(name='قطعة')
        
        self.product1 = Product.objects.create(
            name='قلب حنفية',
            category=self.category1,
            brand=self.brand1,
            unit=self.unit,
            sku='SKU001',
            purchase_price=Decimal('50.00'),
            selling_price=Decimal('80.00'),
            created_by=self.user
        )
        
        self.product2 = Product.objects.create(
            name='خلاط مطبخ',
            category=self.category2,
            brand=self.brand2,
            unit=self.unit,
            sku='SKU002',
            purchase_price=Decimal('100.00'),
            selling_price=Decimal('150.00'),
            created_by=self.user
        )
        
        self.customer = Customer.objects.create(
            name='عميل تجريبي',
            phone='0123456789',
            created_by=self.user
        )
    
    def test_category_comparison(self):
        """اختبار مقارنة الفئات"""
        response = self.client.get('/api/v1/dashboard/api/comparison/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('categories', response.data)
    
    def test_brand_comparison(self):
        """اختبار مقارنة العلامات التجارية"""
        response = self.client.get('/api/v1/dashboard/api/comparison/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('brands', response.data)
    
    def test_price_ranges(self):
        """اختبار نطاقات الأسعار"""
        response = self.client.get('/api/v1/dashboard/api/comparison/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('price_ranges', response.data)
    
    def test_most_demanded(self):
        """اختبار المنتجات الأكثر طلباً"""
        response = self.client.get('/api/v1/dashboard/api/comparison/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('most_demanded', response.data)


class DashboardWidgetsAPITest(TestCase):
    """اختبارات عناصر لوحة التحكم"""
    
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
        
        self.widget = DashboardWidget.objects.create(
            user=self.user,
            title='ملخص المبيعات',
            widget_type='summary',
            config={'show_chart': True},
            order=1
        )
    
    def test_list_widgets(self):
        """اختبار جلب عناصر لوحة التحكم"""
        response = self.client.get('/api/v1/dashboard/api/widgets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_create_widget(self):
        """اختبار إنشاء عنصر جديد - ✅ إصلاح: استخدام format='json'"""
        data = {
            'title': 'عنصر جديد',
            'widget_type': 'chart',
            'config': {'type': 'bar'},
            'order': 2
        }
        response = self.client.post('/api/v1/dashboard/api/widgets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
    
    def test_update_widget(self):
        """اختبار تحديث عنصر"""
        data = {'title': 'عنصر محدث'}
        response = self.client.put(
            f'/api/v1/dashboard/api/widgets/{self.widget.id}/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_delete_widget(self):
        """اختبار حذف عنصر"""
        response = self.client.delete(
            f'/api/v1/dashboard/api/widgets/{self.widget.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DashboardModelTest(TestCase):
    """اختبارات نموذج DashboardWidget"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        
        self.widget = DashboardWidget.objects.create(
            user=self.user,
            title='عنصر اختبار',
            widget_type='summary',
            config={'test': True},
            order=1
        )
    
    def test_create_widget(self):
        """اختبار إنشاء عنصر"""
        self.assertEqual(self.widget.title, 'عنصر اختبار')
        self.assertEqual(self.widget.widget_type, 'summary')
        self.assertTrue(self.widget.is_active)
    
    def test_widget_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('عنصر اختبار', str(self.widget))
    
    def test_widget_ordering(self):
        """اختبار ترتيب العناصر"""
        widget2 = DashboardWidget.objects.create(
            user=self.user,
            title='عنصر ثاني',
            widget_type='chart',
            order=0
        )
        
        widgets = DashboardWidget.objects.filter(user=self.user)
        self.assertEqual(widgets[0], widget2)
        self.assertEqual(widgets[1], self.widget)