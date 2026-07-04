from rest_framework import serializers
from .models import Account, JournalEntry, JournalLine, CashTransaction, Expense, Income, DailyClosing
from decimal import Decimal

class AccountSerializer(serializers.ModelSerializer):
    account_type_display = serializers.ReadOnlyField(source='get_account_type_display')
    full_path = serializers.ReadOnlyField()
    children_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Account
        fields = ['id', 'code', 'name', 'name_ar', 'account_type', 'account_type_display',
                  'parent', 'full_path', 'balance', 'is_active', 'notes',
                  'children_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class JournalLineSerializer(serializers.ModelSerializer):
    account_name = serializers.ReadOnlyField(source='account.name')
    account_code = serializers.ReadOnlyField(source='account.code')
    
    class Meta:
        model = JournalLine
        fields = ['id', 'account', 'account_name', 'account_code', 'debit', 'credit', 'description']
        read_only_fields = ['id']

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True, read_only=True)
    total_debit = serializers.ReadOnlyField()
    total_credit = serializers.ReadOnlyField()
    is_balanced = serializers.ReadOnlyField()
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = JournalEntry
        fields = ['id', 'entry_number', 'date', 'description', 'reference_type',
                  'reference_id', 'lines', 'total_debit', 'total_credit',
                  'is_balanced', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'entry_number', 'created_at']

class JournalEntryCreateSerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True, write_only=True)
    
    class Meta:
        model = JournalEntry
        fields = ['date', 'description', 'reference_type', 'reference_id', 'lines']
    
    def validate_lines(self, value):
        if not value:
            raise serializers.ValidationError("At least one line is required")
        
        total_debit = sum(Decimal(str(line.get('debit', 0))) for line in value)
        total_credit = sum(Decimal(str(line.get('credit', 0))) for line in value)
        
        if total_debit != total_credit:
            raise serializers.ValidationError("Total debit must equal total credit")
        
        return value
    
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        
        # إنشاء رقم قيد
        from django.utils import timezone
        today = timezone.now()
        count = JournalEntry.objects.filter(date__year=today.year, date__month=today.month).count() + 1
        entry_number = f"JE-{today.strftime('%Y%m')}-{str(count).zfill(4)}"
        
        journal_entry = JournalEntry.objects.create(
            entry_number=entry_number,
            **validated_data,
            created_by=self.context['request'].user
        )
        
        # إنشاء سطور القيد
        for line_data in lines_data:
            JournalLine.objects.create(
                journal_entry=journal_entry,
                **line_data
            )
        
        return journal_entry

class CashTransactionSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.ReadOnlyField(source='get_transaction_type_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = CashTransaction
        fields = ['id', 'transaction_type', 'transaction_type_display', 'amount',
                  'date', 'description', 'reference_type', 'reference_id',
                  'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.ReadOnlyField(source='get_category_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Expense
        fields = ['id', 'category', 'category_display', 'amount', 'date',
                  'description', 'payment_method', 'reference', 'invoice',
                  'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class IncomeSerializer(serializers.ModelSerializer):
    category_display = serializers.ReadOnlyField(source='get_category_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Income
        fields = ['id', 'category', 'category_display', 'amount', 'date',
                  'description', 'payment_method', 'reference', 'invoice',
                  'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class DailyClosingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = DailyClosing
        fields = ['id', 'date', 'opening_balance', 'cash_in', 'cash_out',
                  'closing_balance', 'total_sales', 'total_expenses',
                  'total_income', 'net_profit', 'notes', 'created_by',
                  'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']
