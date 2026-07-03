from rest_framework import serializers
from .models import PurchaseOrder, PurchaseItem
from suppliers.models import Supplier
from products.models import Product
from decimal import Decimal
from django.utils import timezone

class PurchaseItemSerializer(serializers.ModelSerializer):
    """Serializer لبنود أمر الشراء"""
    product_name = serializers.ReadOnlyField(source='product.name')
    product_sku = serializers.ReadOnlyField(source='product.sku')
    remaining_quantity = serializers.ReadOnlyField()
    
    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'product_sku',
                  'quantity', 'unit_price', 'total', 'discount', 'tax',
                  'received_quantity', 'remaining_quantity']
        read_only_fields = ['id', 'total']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializer لأمر الشراء"""
    items = PurchaseItemSerializer(many=True, read_only=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    supplier_phone = serializers.ReadOnlyField(source='supplier.phone')
    warehouse_name = serializers.ReadOnlyField(source='warehouse.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'order_number', 'supplier', 'supplier_name', 'supplier_phone',
                  'warehouse', 'warehouse_name', 'order_date', 'expected_date',
                  'received_date', 'subtotal', 'discount', 'tax', 'total',
                  'status', 'status_display', 'notes', 'items',
                  'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'order_date', 'subtotal', 'total',
                           'created_at', 'updated_at']

class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء أمر شراء مع بنوده"""
    items = PurchaseItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['supplier', 'warehouse', 'expected_date', 'discount', 'tax', 'notes', 'items']
    
    def validate_items(self, value):
        """التحقق من وجود بنود"""
        if not value:
            raise serializers.ValidationError("At least one item is required")
        return value
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # إنشاء رقم أمر شراء فريد
        today = timezone.now()
        year = today.strftime('%Y')
        month = today.strftime('%m')
        count = PurchaseOrder.objects.filter(order_date__year=year, order_date__month=month).count() + 1
        order_number = f"PO-{year}{month}-{str(count).zfill(4)}"
        
        # إنشاء أمر الشراء
        order = PurchaseOrder.objects.create(
            order_number=order_number,
            **validated_data,
            created_by=self.context['request'].user
        )
        
        # إنشاء البنود
        for item_data in items_data:
            PurchaseItem.objects.create(
                order=order,
                **item_data
            )
        
        # حساب الإجمالي
        order.calculate_total()
        
        return order

class PurchaseReceiveSerializer(serializers.Serializer):
    """Serializer لاستلام المشتريات"""
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required")
        return value
