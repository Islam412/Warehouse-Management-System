from rest_framework import serializers
from .models import Customer
from decimal import Decimal

class CustomerSerializer(serializers.ModelSerializer):
    """Serializer للعملاء"""
    outstanding_balance = serializers.ReadOnlyField()
    total_invoices = serializers.ReadOnlyField()
    total_purchases = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Customer
        fields = ['id', 'name', 'name_ar', 'email', 'phone', 'phone2', 'address',
                  'balance', 'credit_limit', 'outstanding_balance',
                  'total_invoices', 'total_purchases', 'total_paid',
                  'tax_number', 'notes', 'is_active', 'is_vip',
                  'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class CustomerCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء عميل جديد"""
    
    class Meta:
        model = Customer
        fields = ['name', 'name_ar', 'email', 'phone', 'phone2', 'address',
                  'balance', 'credit_limit', 'tax_number', 'notes', 
                  'is_active', 'is_vip']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class CustomerBalanceUpdateSerializer(serializers.Serializer):
    """Serializer لتحديث رصيد العميل"""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value == 0:
            raise serializers.ValidationError("Amount cannot be zero")
        return value
