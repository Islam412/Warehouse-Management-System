from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment, Return
from products.models import Product
from customers.models import Customer
from decimal import Decimal
from django.utils import timezone

class InvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer لبنود الفاتورة"""
    product_name = serializers.ReadOnlyField(source='product.name')
    product_sku = serializers.ReadOnlyField(source='product.sku')
    
    class Meta:
        model = InvoiceItem
        fields = ['id', 'product', 'product_name', 'product_sku',
                  'quantity', 'unit_price', 'total', 'discount', 'tax']
        read_only_fields = ['id', 'total']

class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer للفاتورة"""
    items = InvoiceItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.name')
    customer_phone = serializers.ReadOnlyField(source='customer.phone')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer', 'customer_name', 'customer_phone',
                  'date', 'due_date', 'subtotal', 'discount', 'tax', 'total',
                  'paid_amount', 'remaining_amount', 'status', 'status_display',
                  'is_overdue', 'notes', 'items', 'created_by', 'created_by_name',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'invoice_number', 'date', 'subtotal', 'total',
                           'paid_amount', 'remaining_amount', 'created_at', 'updated_at']

class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء فاتورة مع بنودها"""
    items = InvoiceItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = Invoice
        fields = ['customer', 'due_date', 'discount', 'tax', 'notes', 'items']
    
    def validate_items(self, value):
        """التحقق من وجود بنود"""
        if not value:
            raise serializers.ValidationError("At least one item is required")
        return value
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # إنشاء رقم فاتورة فريد
        today = timezone.now()
        year = today.strftime('%Y')
        month = today.strftime('%m')
        count = Invoice.objects.filter(date__year=year, date__month=month).count() + 1
        invoice_number = f"INV-{year}{month}-{str(count).zfill(4)}"
        
        # إنشاء الفاتورة
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            **validated_data,
            created_by=self.context['request'].user
        )
        
        # إنشاء بنود الفاتورة
        for item_data in items_data:
            InvoiceItem.objects.create(
                invoice=invoice,
                **item_data
            )
        
        # حساب الإجمالي
        invoice.calculate_total()
        
        return invoice

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer للمدفوعات"""
    invoice_number = serializers.ReadOnlyField(source='invoice.invoice_number')
    customer_name = serializers.ReadOnlyField(source='invoice.customer.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    payment_method_display = serializers.ReadOnlyField(source='get_payment_method_display')
    
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'invoice_number', 'customer_name',
                  'amount', 'payment_method', 'payment_method_display',
                  'reference', 'notes', 'created_by', 'created_by_name',
                  'created_at']
        read_only_fields = ['id', 'created_at']

class ReturnSerializer(serializers.ModelSerializer):
    """Serializer للمرتجعات"""
    invoice_number = serializers.ReadOnlyField(source='invoice.invoice_number')
    product_name = serializers.ReadOnlyField(source='product.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Return
        fields = ['id', 'invoice', 'invoice_number', 'product', 'product_name',
                  'quantity', 'amount', 'reason', 'created_by', 'created_by_name',
                  'created_at']
        read_only_fields = ['id', 'created_at']
