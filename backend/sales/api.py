from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import timedelta
from .models import Invoice, InvoiceItem, Payment, Return
from .serializers import (
    InvoiceSerializer, InvoiceCreateSerializer, 
    InvoiceItemSerializer, PaymentSerializer, ReturnSerializer
)
from products.models import Product
from inventory.models import Stock
from inventory.models import StockMovement

class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الفواتير"""
    queryset = Invoice.objects.all().select_related('customer', 'created_by')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'status']
    search_fields = ['invoice_number', 'customer__name', 'customer__phone']
    ordering_fields = ['date', 'total', 'due_date']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_payment(self, request, pk=None):
        """إضافة دفعة للفاتورة"""
        invoice = self.get_object()
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'cash')
        reference = request.data.get('reference', '')
        notes = request.data.get('notes', '')
        
        if not amount:
            return Response(
                {"error": "Amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
        except ValueError:
            return Response(
                {"error": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if amount <= 0:
            return Response(
                {"error": "Amount must be greater than 0"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if amount > invoice.remaining_amount:
            return Response(
                {"error": f"Amount exceeds remaining balance: {invoice.remaining_amount}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment = Payment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_method=payment_method,
            reference=reference,
            notes=notes,
            created_by=request.user
        )
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_return(self, request, pk=None):
        """إضافة مرتجع للفاتورة"""
        invoice = self.get_object()
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        amount = request.data.get('amount')
        reason = request.data.get('reason', '')
        
        if not all([product_id, quantity, amount]):
            return Response(
                {"error": "product_id, quantity, and amount are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # إنشاء المرتجع
        return_obj = Return.objects.create(
            invoice=invoice,
            product=product,
            quantity=quantity,
            amount=amount,
            reason=reason,
            created_by=request.user
        )
        
        # تحديث المخزون (زيادة)
        stock = Stock.objects.filter(product=product, warehouse=request.data.get('warehouse_id'))
        if stock.exists():
            stock = stock.first()
            stock.quantity += quantity
            stock.save()
        
        serializer = ReturnSerializer(return_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """جلب الفواتير المتأخرة"""
        today = timezone.now().date()
        invoices = self.get_queryset().filter(
            status__in=['confirmed', 'partially_paid'],
            due_date__lt=today
        )
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """جلب فواتير اليوم"""
        today = timezone.now().date()
        invoices = self.get_queryset().filter(date__date=today)
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)

class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المدفوعات"""
    queryset = Payment.objects.all().select_related('invoice', 'invoice__customer', 'created_by')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method']
    search_fields = ['invoice__invoice_number', 'invoice__customer__name']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

class ReturnViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المرتجعات"""
    queryset = Return.objects.all().select_related('invoice', 'product', 'created_by')
    serializer_class = ReturnSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['invoice', 'product']
    search_fields = ['invoice__invoice_number', 'product__name']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
