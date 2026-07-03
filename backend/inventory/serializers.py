from rest_framework import serializers
from .models import Warehouse, Stock, StockMovement
from products.models import Product

class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer للمخازن"""
    manager_name = serializers.ReadOnlyField(source='manager.username')
    stocks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'name_ar', 'location', 'manager', 'manager_name', 
                  'is_active', 'stocks_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_stocks_count(self, obj):
        return obj.stocks.count()

class StockSerializer(serializers.ModelSerializer):
    """Serializer للمخزون"""
    product_name = serializers.ReadOnlyField(source='product.name')
    product_sku = serializers.ReadOnlyField(source='product.sku')
    warehouse_name = serializers.ReadOnlyField(source='warehouse.name')
    available_quantity = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_over_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Stock
        fields = ['id', 'product', 'product_name', 'product_sku', 
                  'warehouse', 'warehouse_name', 'quantity', 'min_quantity', 
                  'max_quantity', 'reserved_quantity', 'available_quantity',
                  'is_low_stock', 'is_over_stock', 'last_updated', 'updated_by']
        read_only_fields = ['id', 'last_updated']


