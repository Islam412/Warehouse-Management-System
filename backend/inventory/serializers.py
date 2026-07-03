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

