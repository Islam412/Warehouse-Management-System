"""
اختبارات تطبيق المالية
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from finance.models import Account, JournalEntry, JournalLine, CashTransaction, Expense, Income, DailyClosing
from sales.models import Invoice
from customers.models import Customer
from products.models import Category, Brand, Unit, Product

User = get_user_model()

class AccountModelTest(TestCase):
    """اختبارات نموذج الحساب"""
    
    def setUp(self):
        self.account = Account.objects.create(
            code='1000',
            name='Cash',
            name_ar='النقدية',
            account_type='asset',
            balance=Decimal('1000.00')
        )
    
    def test_create_account(self):
        """اختبار إنشاء حساب"""
        self.assertEqual(self.account.code, '1000')
        self.assertEqual(self.account.balance, Decimal('1000.00'))
        self.assertTrue(self.account.is_active)
    
    def test_account_str(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.account), '1000 - Cash')
    
    def test_account_hierarchy(self):
        """اختبار التسلسل الهرمي للحسابات"""
        child = Account.objects.create(
            code='1001',
            name='Petty Cash',
            name_ar='الصندوق',
            account_type='asset',
            parent=self.account
        )
        self.assertEqual(child.parent, self.account)
        self.assertEqual(child.full_path, 'Cash > Petty Cash')

class JournalEntryModelTest(TestCase):
    """اختبارات نموذج قيد اليومية"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.account1 = Account.objects.create(
            code='1000',
            name='Cash',
            account_type='asset',
            balance=Decimal('1000.00')
        )
        self.account2 = Account.objects.create(
            code='4000',
            name='Sales Revenue',
            account_type='revenue'
        )
        self.journal_entry = JournalEntry.objects.create(
            entry_number='JE-001',
            description='بيع نقدي',
            created_by=self.user
        )
        JournalLine.objects.create(
            journal_entry=self.journal_entry,
            account=self.account1,
            debit=Decimal('100.00')
        )
        JournalLine.objects.create(
            journal_entry=self.journal_entry,
            account=self.account2,
            credit=Decimal('100.00')
        )
    
    def test_create_journal_entry(self):
        """اختبار إنشاء قيد يومية"""
        self.assertEqual(self.journal_entry.entry_number, 'JE-001')
        self.assertTrue(self.journal_entry.is_balanced)
    
    def test_journal_entry_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('بيع نقدي', str(self.journal_entry))
    
    def test_journal_entry_totals(self):
        """اختبار إجمالي المدين والدائن"""
        self.assertEqual(self.journal_entry.total_debit, Decimal('100.00'))
        self.assertEqual(self.journal_entry.total_credit, Decimal('100.00'))

class ExpenseModelTest(TestCase):
    """اختبارات نموذج المصروف"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.expense = Expense.objects.create(
            category='rent',
            amount=Decimal('500.00'),
            date=datetime.now().date(),
            description='إيجار المكتب',
            payment_method='cash',
            created_by=self.user
        )
    
    def test_create_expense(self):
        """اختبار إنشاء مصروف"""
        self.assertEqual(self.expense.category, 'rent')
        self.assertEqual(self.expense.amount, Decimal('500.00'))
    
    def test_expense_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('إيجار', str(self.expense))

class IncomeModelTest(TestCase):
    """اختبارات نموذج الإيراد"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.income = Income.objects.create(
            category='sales',
            amount=Decimal('1000.00'),
            date=datetime.now().date(),
            description='مبيعات اليوم',
            payment_method='cash',
            created_by=self.user
        )
    
    def test_create_income(self):
        """اختبار إنشاء إيراد"""
        self.assertEqual(self.income.category, 'sales')
        self.assertEqual(self.income.amount, Decimal('1000.00'))
    
    def test_income_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('مبيعات', str(self.income))

class DailyClosingModelTest(TestCase):
    """اختبارات نموذج الإغلاق اليومي"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.closing = DailyClosing.objects.create(
            date=datetime.now().date(),
            opening_balance=Decimal('1000.00'),
            cash_in=Decimal('500.00'),
            cash_out=Decimal('200.00'),
            total_sales=Decimal('1500.00'),
            total_expenses=Decimal('300.00'),
            total_income=Decimal('500.00'),
            created_by=self.user
        )
        self.closing.calculate_profit()
    
    def test_create_closing(self):
        """اختبار إنشاء إغلاق يومي"""
        self.assertEqual(self.closing.opening_balance, Decimal('1000.00'))
        self.assertEqual(self.closing.closing_balance, Decimal('1300.00'))  # 1000 + 500 - 200
    
    def test_closing_profit(self):
        """اختبار حساب صافي الربح"""
        # (total_income + cash_in) - (total_expenses + cash_out)
        # (500 + 500) - (300 + 200) = 1000 - 500 = 500
        self.assertEqual(self.closing.net_profit, Decimal('500.00'))

class FinanceAPITest(TestCase):
    """اختبارات واجهات API للمالية"""
    
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
        
        # إنشاء بيانات أساسية
        self.account = Account.objects.create(
            code='1000',
            name='Cash',
            account_type='asset',
            balance=Decimal('1000.00')
        )
        
        self.account2 = Account.objects.create(
            code='4000',
            name='Sales Revenue',
            account_type='revenue'
        )
    
    def test_list_accounts(self):
        """اختبار جلب قائمة الحسابات"""
        response = self.client.get('/api/v1/finance/api/accounts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_create_account(self):
        """اختبار إنشاء حساب جديد"""
        data = {
            'code': '2000',
            'name': 'Accounts Payable',
            'name_ar': 'الدائنون',
            'account_type': 'liability',
            'balance': '0.00'
        }
        response = self.client.post('/api/v1/finance/api/accounts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], '2000')
    
    def test_update_balance(self):
        """اختبار تحديث رصيد الحساب"""
        data = {'amount': '500.00'}
        response = self.client.post(f'/api/v1/finance/api/accounts/{self.account.id}/update_balance/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_balance'], '1500.00')
    
    def test_create_journal_entry(self):
        """اختبار إنشاء قيد يومية"""
        data = {
            'date': datetime.now().date().isoformat(),
            'description': 'اختبار قيد',
            'lines': [
                {
                    'account': str(self.account.id),
                    'debit': '100.00'
                },
                {
                    'account': str(self.account2.id),
                    'credit': '100.00'
                }
            ]
        }
        response = self.client.post('/api/v1/finance/api/journal-entries/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('JE-', response.data['entry_number'])
    
    def test_list_journal_entries(self):
        """اختبار جلب قائمة قيد اليومية"""
        # إنشاء قيد أولاً
        entry = JournalEntry.objects.create(
            entry_number='JE-001',
            description='قيد اختبار',
            created_by=self.user
        )
        response = self.client.get('/api/v1/finance/api/journal-entries/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_expense(self):
        """اختبار إنشاء مصروف"""
        data = {
            'category': 'rent',
            'amount': '500.00',
            'date': datetime.now().date().isoformat(),
            'description': 'إيجار المكتب',
            'payment_method': 'cash'
        }
        response = self.client.post('/api/v1/finance/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'rent')
    
    def test_list_expenses(self):
        """اختبار جلب قائمة المصروفات"""
        response = self.client.get('/api/v1/finance/api/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_income(self):
        """اختبار إنشاء إيراد"""
        data = {
            'category': 'sales',
            'amount': '1000.00',
            'date': datetime.now().date().isoformat(),
            'description': 'مبيعات اليوم',
            'payment_method': 'cash'
        }
        response = self.client.post('/api/v1/finance/api/incomes/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'sales')
    
    def test_list_incomes(self):
        """اختبار جلب قائمة الإيرادات"""
        response = self.client.get('/api/v1/finance/api/incomes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_cash_transaction(self):
        """اختبار إنشاء معاملة نقدية"""
        data = {
            'transaction_type': 'cash_in',
            'amount': '1000.00',
            'date': datetime.now().date().isoformat(),
            'description': 'إيداع نقدي'
        }
        response = self.client.post('/api/v1/finance/api/cash-transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['transaction_type'], 'cash_in')
    
    def test_list_cash_transactions(self):
        """اختبار جلب قائمة المعاملات النقدية"""
        response = self.client.get('/api/v1/finance/api/cash-transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_today_closing(self):
        """اختبار إنشاء إغلاق اليوم"""
        response = self.client.post('/api/v1/finance/api/closings/create_today/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['date'], datetime.now().date().isoformat())
    
    def test_closing_summary(self):
        """اختبار جلب الملخص المالي"""
        response = self.client.get('/api/v1/finance/api/closings/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('expenses_by_category', response.data)
        self.assertIn('incomes_by_category', response.data)
    
    def test_list_closings(self):
        """اختبار جلب قائمة الإغلاق اليومي"""
        response = self.client.get('/api/v1/finance/api/closings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
