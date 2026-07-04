from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from accounts.models import User
from customers.models import Customer
from suppliers.models import Supplier
from sales.models import Invoice
from purchases.models import PurchaseOrder

class Account(models.Model):
    """الحسابات المالية"""
    ACCOUNT_TYPES = (
        ('asset', 'أصل'),
        ('liability', 'خصم'),
        ('equity', 'حقوق ملكية'),
        ('revenue', 'إيراد'),
        ('expense', 'مصروف'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, verbose_name="كود الحساب")
    name = models.CharField(max_length=200, verbose_name="اسم الحساب")
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name="اسم الحساب بالعربية")
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, verbose_name="نوع الحساب")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='children', verbose_name="الحساب الرئيسي")
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="الرصيد")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts'
        verbose_name = "حساب"
        verbose_name_plural = "الحسابات"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    @property
    def children_count(self):
        return self.children.count()

class JournalEntry(models.Model):
    """قيد اليومية"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entry_number = models.CharField(max_length=20, unique=True, verbose_name="رقم القيد")
    date = models.DateField(auto_now_add=True, verbose_name="التاريخ")
    description = models.TextField(verbose_name="الوصف")
    reference_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="نوع المرجع")
    reference_id = models.UUIDField(blank=True, null=True, verbose_name="معرف المرجع")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='journal_entries')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'journal_entries'
        verbose_name = "قيد يومية"
        verbose_name_plural = "قيد اليومية"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.entry_number} - {self.description[:50]}"
    
    @property
    def total_debit(self):
        return sum(entry.debit for entry in self.lines.all())
    
    @property
    def total_credit(self):
        return sum(entry.credit for entry in self.lines.all())
    
    @property
    def is_balanced(self):
        return self.total_debit == self.total_credit

class JournalLine(models.Model):
    """تفاصيل قيد اليومية"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_lines')
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="مدين")
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="دائن")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    
    class Meta:
        db_table = 'journal_lines'
        verbose_name = "تفصيل قيد"
        verbose_name_plural = "تفاصيل القيد"
    
    def __str__(self):
        return f"{self.journal_entry.entry_number} - {self.account.name}"
    
    def save(self, *args, **kwargs):
        # التأكد من أن المدين أو الدائن فقط له قيمة
        if self.debit > 0 and self.credit > 0:
            raise ValueError("لا يمكن أن يكون المدين والدائن معاً أكبر من صفر")
        super().save(*args, **kwargs)

class CashTransaction(models.Model):
    """المعاملات النقدية"""
    TRANSACTION_TYPES = (
        ('cash_in', 'إيداع نقدي'),
        ('cash_out', 'سحب نقدي'),
        ('transfer', 'تحويل'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, verbose_name="نوع المعاملة")
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="المبلغ")
    date = models.DateField(auto_now_add=True, verbose_name="التاريخ")
    description = models.TextField(verbose_name="الوصف")
    reference_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="نوع المرجع")
    reference_id = models.UUIDField(blank=True, null=True, verbose_name="معرف المرجع")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='cash_transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cash_transactions'
        verbose_name = "معاملة نقدية"
        verbose_name_plural = "المعاملات النقدية"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount}"

class Expense(models.Model):
    """المصروفات"""
    EXPENSE_CATEGORIES = (
        ('rent', 'إيجار'),
        ('utilities', 'مرافق'),
        ('salaries', 'رواتب'),
        ('supplies', 'مستلزمات'),
        ('maintenance', 'صيانة'),
        ('transport', 'نقل'),
        ('marketing', 'تسويق'),
        ('other', 'أخرى'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=20, choices=EXPENSE_CATEGORIES, verbose_name="الفئة")
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="المبلغ")
    date = models.DateField(verbose_name="التاريخ")
    description = models.TextField(verbose_name="الوصف")
    payment_method = models.CharField(max_length=20, default='cash', verbose_name="طريقة الدفع")
    reference = models.CharField(max_length=100, blank=True, null=True, verbose_name="المرجع")
    invoice = models.FileField(upload_to='expenses/', blank=True, null=True, verbose_name="الفاتورة")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='expenses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expenses'
        verbose_name = "مصروف"
        verbose_name_plural = "المصروفات"
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.amount} - {self.date}"

class Income(models.Model):
    """الإيرادات"""
    INCOME_CATEGORIES = (
        ('sales', 'مبيعات'),
        ('services', 'خدمات'),
        ('interest', 'فوائد'),
        ('other', 'أخرى'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=20, choices=INCOME_CATEGORIES, verbose_name="الفئة")
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="المبلغ")
    date = models.DateField(verbose_name="التاريخ")
    description = models.TextField(verbose_name="الوصف")
    payment_method = models.CharField(max_length=20, default='cash', verbose_name="طريقة الدفع")
    reference = models.CharField(max_length=100, blank=True, null=True, verbose_name="المرجع")
    invoice = models.FileField(upload_to='incomes/', blank=True, null=True, verbose_name="الفاتورة")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='incomes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'incomes'
        verbose_name = "إيراد"
        verbose_name_plural = "الإيرادات"
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.amount} - {self.date}"

class DailyClosing(models.Model):
    """الإغلاق اليومي"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True, verbose_name="التاريخ")
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="الرصيد الافتتاحي")
    cash_in = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="الإيداعات")
    cash_out = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="المسحوبات")
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="الرصيد الختامي")
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="إجمالي المبيعات")
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="إجمالي المصروفات")
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="إجمالي الإيرادات")
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="صافي الربح")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='closings')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'daily_closings'
        verbose_name = "إغلاق يومي"
        verbose_name_plural = "الإغلاق اليومي"
        ordering = ['-date']
    
    def __str__(self):
        return f"إغلاق {self.date} - {self.net_profit}"
    
    def calculate_profit(self):
        """حساب صافي الربح"""
        self.net_profit = (self.total_income + self.cash_in) - (self.total_expenses + self.cash_out)
        self.closing_balance = self.opening_balance + self.cash_in - self.cash_out
        self.save()
