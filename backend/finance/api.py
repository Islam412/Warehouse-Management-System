from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Account, JournalEntry, JournalLine, CashTransaction, Expense, Income, DailyClosing
from .serializers import (
    AccountSerializer, JournalEntrySerializer, JournalEntryCreateSerializer,
    JournalLineSerializer, CashTransactionSerializer, ExpenseSerializer,
    IncomeSerializer, DailyClosingSerializer
)

class AccountViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الحسابات"""
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_type', 'is_active', 'parent']
    search_fields = ['code', 'name', 'name_ar']
    ordering_fields = ['code', 'name', 'balance']
    ordering = ['code']
    
    @action(detail=True, methods=['post'])
    def update_balance(self, request, pk=None):
        """تحديث رصيد الحساب"""
        account = self.get_object()
        amount = request.data.get('amount')
        
        if not amount:
            return Response(
                {"error": "Amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = Decimal(str(amount))
        except:
            return Response(
                {"error": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        account.balance += amount
        account.save()
        
        return Response({
            'message': 'Balance updated successfully',
            'new_balance': account.balance
        })

class JournalEntryViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة قيد اليومية"""
    queryset = JournalEntry.objects.all().select_related('created_by')
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'reference_type']
    search_fields = ['entry_number', 'description']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return JournalEntryCreateSerializer
        return JournalEntrySerializer
    
    def create(self, request, *args, **kwargs):
        """إنشاء قيد يومية وإرجاع البيانات الكاملة"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        journal_entry = serializer.save()
        
        # إرجاع البيانات الكاملة باستخدام JournalEntrySerializer
        output_serializer = JournalEntrySerializer(journal_entry)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

class CashTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المعاملات النقدية"""
    queryset = CashTransaction.objects.all().select_related('created_by')
    serializer_class = CashTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'date']
    search_fields = ['description']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']

class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المصروفات"""
    queryset = Expense.objects.all().select_related('created_by')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'date', 'payment_method']
    search_fields = ['description', 'reference']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']

class IncomeViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الإيرادات"""
    queryset = Income.objects.all().select_related('created_by')
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'date', 'payment_method']
    search_fields = ['description', 'reference']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']

class DailyClosingViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الإغلاق اليومي"""
    queryset = DailyClosing.objects.all().select_related('created_by')
    serializer_class = DailyClosingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']
    ordering = ['-date']
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def create_today(self, request):
        """إنشاء إغلاق لليوم الحالي"""
        today = timezone.now().date()
        
        # التحقق من وجود إغلاق لهذا اليوم
        if DailyClosing.objects.filter(date=today).exists():
            return Response(
                {"error": "Closing already exists for today"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # حساب البيانات
        from sales.models import Invoice
        
        # مبيعات اليوم
        today_sales = Invoice.objects.filter(date__date=today)
        total_sales = today_sales.aggregate(Sum('total'))['total__sum'] or 0
        
        # مصروفات اليوم
        today_expenses = Expense.objects.filter(date=today)
        total_expenses = today_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # إيرادات اليوم
        today_incomes = Income.objects.filter(date=today)
        total_incomes = today_incomes.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # المعاملات النقدية اليوم
        today_cash = CashTransaction.objects.filter(date=today)
        cash_in = today_cash.filter(transaction_type='cash_in').aggregate(Sum('amount'))['amount__sum'] or 0
        cash_out = today_cash.filter(transaction_type='cash_out').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # الرصيد الافتتاحي (آخر إغلاق)
        last_closing = DailyClosing.objects.order_by('-date').first()
        opening_balance = last_closing.closing_balance if last_closing else 0
        
        # إنشاء الإغلاق
        closing = DailyClosing.objects.create(
            date=today,
            opening_balance=opening_balance,
            cash_in=cash_in,
            cash_out=cash_out,
            total_sales=total_sales,
            total_expenses=total_expenses,
            total_income=total_incomes,
            notes=request.data.get('notes', ''),
            created_by=request.user
        )
        
        # حساب صافي الربح
        closing.calculate_profit()
        
        serializer = self.get_serializer(closing)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """ملخص مالي"""
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        # إحصائيات الشهر الحالي
        expenses = Expense.objects.filter(date__gte=start_of_month, date__lte=today)
        incomes = Income.objects.filter(date__gte=start_of_month, date__lte=today)
        
        total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        total_incomes = incomes.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # مصروفات حسب الفئة
        expenses_by_category = expenses.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        # إيرادات حسب الفئة
        incomes_by_category = incomes.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        # الإغلاقات السابقة
        last_closing = DailyClosing.objects.order_by('-date').first()
        
        data = {
            'summary': {
                'total_expenses': total_expenses,
                'total_incomes': total_incomes,
                'net_income': total_incomes - total_expenses,
                'last_closing_balance': last_closing.closing_balance if last_closing else 0,
            },
            'expenses_by_category': expenses_by_category,
            'incomes_by_category': incomes_by_category,
        }
        
        return Response(data)
