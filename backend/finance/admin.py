from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Account, JournalEntry, JournalLine, CashTransaction, Expense, Income, DailyClosing

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """إدارة الحسابات المالية"""
    list_display = ['code', 'name', 'name_ar', 'account_type_display', 'balance_display', 'is_active', 'children_count']
    list_filter = ['account_type', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'name_ar']
    list_editable = ['is_active']
    readonly_fields = ['id', 'created_at', 'updated_at', 'balance_display', 'full_path', 'children_count']
    ordering = ['code']
    
    fieldsets = (
        (_('معلومات الحساب'), {
            'fields': ('id', 'code', 'name', 'name_ar')
        }),
        (_('نوع الحساب'), {
            'fields': ('account_type', 'parent')
        }),
        (_('الرصيد'), {
            'fields': ('balance', 'balance_display')
        }),
        (_('حالة الحساب'), {
            'fields': ('is_active', 'notes')
        }),
        (_('معلومات النظام'), {
            'fields': ('full_path', 'children_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def account_type_display(self, obj):
        """عرض نوع الحساب بشكل منسق"""
        colors = {
            'asset': '#28a745',
            'liability': '#dc3545',
            'equity': '#6f42c1',
            'revenue': '#17a2b8',
            'expense': '#fd7e14',
        }
        color = colors.get(obj.account_type, '#6c757d')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, obj.get_account_type_display())
    account_type_display.short_description = _('نوع الحساب')
    
    def balance_display(self, obj):
        """عرض الرصيد بشكل منسق"""
        color = '#28a745' if obj.balance >= 0 else '#dc3545'
        return format_html('<span style="color: {}; font-weight: bold;">{:.2f} جنيه</span>', 
                          color, obj.balance)
    balance_display.short_description = _('الرصيد')
    
    actions = ['activate_accounts', 'deactivate_accounts']
    
    def activate_accounts(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'تم تفعيل {updated} حساب(حسابات).')
    activate_accounts.short_description = _('تفعيل الحسابات المحددة')
    
    def deactivate_accounts(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'تم إلغاء تفعيل {updated} حساب(حسابات).')
    deactivate_accounts.short_description = _('إلغاء تفعيل الحسابات المحددة')

class JournalLineInline(admin.TabularInline):
    """عرض سطور قيد اليومية"""
    model = JournalLine
    extra = 2
    fields = ['account', 'debit', 'credit', 'description']
    raw_id_fields = ['account']
    
    def get_extra(self, request, obj=None, **kwargs):
        if obj:
            return 0
        return 2

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    """إدارة قيد اليومية"""
    list_display = ['entry_number', 'date', 'description', 'total_debit_display', 
                   'total_credit_display', 'is_balanced_display', 'created_at']
    list_filter = ['date', 'reference_type', 'created_at']
    search_fields = ['entry_number', 'description', 'reference_id']
    readonly_fields = ['id', 'entry_number', 'created_at', 'total_debit', 'total_credit', 'is_balanced']
    inlines = [JournalLineInline]
    ordering = ['-date']
    date_hierarchy = 'date'
    
    fieldsets = (
        (_('معلومات القيد'), {
            'fields': ('id', 'entry_number', 'date', 'description')
        }),
        (_('المرجع'), {
            'fields': ('reference_type', 'reference_id')
        }),
        (_('المجاميع'), {
            'fields': ('total_debit', 'total_credit', 'is_balanced')
        }),
        (_('معلومات النظام'), {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_debit_display(self, obj):
        return format_html('<span style="color: #17a2b8; font-weight: bold;">{:.2f} جنيه</span>', obj.total_debit)
    total_debit_display.short_description = _('إجمالي المدين')
    
    def total_credit_display(self, obj):
        return format_html('<span style="color: #ffc107; font-weight: bold;">{:.2f} جنيه</span>', obj.total_credit)
    total_credit_display.short_description = _('إجمالي الدائن')
    
    def is_balanced_display(self, obj):
        if obj.is_balanced:
            return format_html('<span style="color: #28a745;">✅ متوازن</span>')
        return format_html('<span style="color: #dc3545;">❌ غير متوازن</span>')
    is_balanced_display.short_description = _('متوازن')
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """إدارة المصروفات"""
    list_display = ['category_display', 'amount_display', 'date', 'description_short', 'payment_method', 'invoice_link']
    list_filter = ['category', 'date', 'payment_method']
    search_fields = ['description', 'reference']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-date']
    date_hierarchy = 'date'
    
    fieldsets = (
        (_('معلومات المصروف'), {
            'fields': ('category', 'amount', 'date', 'description')
        }),
        (_('طريقة الدفع'), {
            'fields': ('payment_method', 'reference')
        }),
        (_('المرفقات'), {
            'fields': ('invoice',)
        }),
        (_('معلومات النظام'), {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def category_display(self, obj):
        return obj.get_category_display()
    category_display.short_description = _('الفئة')
    
    def amount_display(self, obj):
        return format_html('<span style="color: #dc3545; font-weight: bold;">{:.2f} جنيه</span>', obj.amount)
    amount_display.short_description = _('المبلغ')
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = _('الوصف')
    
    def invoice_link(self, obj):
        if obj.invoice:
            return format_html('<a href="{}" target="_blank">📎 عرض الفاتورة</a>', obj.invoice.url)
        return '-'
    invoice_link.short_description = _('الفاتورة')
    
    actions = ['delete_expenses']
    
    def delete_expenses(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'تم حذف {count} مصروف(مصروفات).')
    delete_expenses.short_description = _('حذف المصروفات المحددة')

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    """إدارة الإيرادات"""
    list_display = ['category_display', 'amount_display', 'date', 'description_short', 'payment_method', 'invoice_link']
    list_filter = ['category', 'date', 'payment_method']
    search_fields = ['description', 'reference']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-date']
    date_hierarchy = 'date'
    
    fieldsets = (
        (_('معلومات الإيراد'), {
            'fields': ('category', 'amount', 'date', 'description')
        }),
        (_('طريقة الدفع'), {
            'fields': ('payment_method', 'reference')
        }),
        (_('المرفقات'), {
            'fields': ('invoice',)
        }),
        (_('معلومات النظام'), {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def category_display(self, obj):
        return obj.get_category_display()
    category_display.short_description = _('الفئة')
    
    def amount_display(self, obj):
        return format_html('<span style="color: #28a745; font-weight: bold;">{:.2f} جنيه</span>', obj.amount)
    amount_display.short_description = _('المبلغ')
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = _('الوصف')
    
    def invoice_link(self, obj):
        if obj.invoice:
            return format_html('<a href="{}" target="_blank">📎 عرض الفاتورة</a>', obj.invoice.url)
        return '-'
    invoice_link.short_description = _('الفاتورة')

@admin.register(CashTransaction)
class CashTransactionAdmin(admin.ModelAdmin):
    """إدارة المعاملات النقدية"""
    list_display = ['transaction_type_display', 'amount_display', 'date', 'description_short']
    list_filter = ['transaction_type', 'date']
    search_fields = ['description', 'reference_id']
    readonly_fields = ['id', 'created_at']
    ordering = ['-date']
    date_hierarchy = 'date'
    
    fieldsets = (
        (_('معلومات المعاملة'), {
            'fields': ('transaction_type', 'amount', 'date', 'description')
        }),
        (_('المرجع'), {
            'fields': ('reference_type', 'reference_id')
        }),
        (_('معلومات النظام'), {
            'fields': ('id', 'created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def transaction_type_display(self, obj):
        colors = {
            'cash_in': '#28a745',
            'cash_out': '#dc3545',
            'transfer': '#17a2b8',
        }
        color = colors.get(obj.transaction_type, '#6c757d')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, obj.get_transaction_type_display())
    transaction_type_display.short_description = _('نوع المعاملة')
    
    def amount_display(self, obj):
        color = '#28a745' if obj.transaction_type == 'cash_in' else '#dc3545'
        return format_html('<span style="color: {}; font-weight: bold;">{:.2f} جنيه</span>', 
                          color, obj.amount)
    amount_display.short_description = _('المبلغ')
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = _('الوصف')

@admin.register(DailyClosing)
class DailyClosingAdmin(admin.ModelAdmin):
    """إدارة الإغلاق اليومي"""
    list_display = ['date', 'opening_balance_display', 'closing_balance_display', 'net_profit_display']
    list_filter = ['date', 'created_at']
    readonly_fields = ['id', 'created_at', 'closing_balance', 'net_profit']
    ordering = ['-date']
    date_hierarchy = 'date'
    
    fieldsets = (
        (_('معلومات الإغلاق'), {
            'fields': ('date', 'notes')
        }),
        (_('الرصيد'), {
            'fields': ('opening_balance', 'cash_in', 'cash_out', 'closing_balance')
        }),
        (_('المبيعات والمصروفات'), {
            'fields': ('total_sales', 'total_expenses', 'total_income', 'net_profit')
        }),
        (_('معلومات النظام'), {
            'fields': ('id', 'created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def opening_balance_display(self, obj):
        return format_html('<span style="font-weight: bold;">{:.2f} جنيه</span>', obj.opening_balance)
    opening_balance_display.short_description = _('الرصيد الافتتاحي')
    
    def closing_balance_display(self, obj):
        return format_html('<span style="font-weight: bold; color: #17a2b8;">{:.2f} جنيه</span>', obj.closing_balance)
    closing_balance_display.short_description = _('الرصيد الختامي')
    
    def net_profit_display(self, obj):
        color = '#28a745' if obj.net_profit >= 0 else '#dc3545'
        return format_html('<span style="color: {}; font-weight: bold;">{:.2f} جنيه</span>', 
                          color, obj.net_profit)
    net_profit_display.short_description = _('صافي الربح')
