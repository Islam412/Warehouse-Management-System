from rest_framework import serializers
from .models import Supplier

class SupplierSerializer(serializers.ModelSerializer):
    """Serializer للموردين"""
    total_purchases = serializers.ReadOnlyField()
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'name_ar', 'email', 'phone', 'phone2',
            'address', 'balance', 'tax_number', 'notes',
            'is_active', 'total_purchases',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class SupplierCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء مورد جديد"""
    
    class Meta:
        model = Supplier
        fields = [
            'name', 'name_ar', 'email', 'phone', 'phone2',
            'address', 'balance', 'tax_number', 'notes', 'is_active'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SupplierBalanceUpdateSerializer(serializers.Serializer):
    """Serializer لتحديث رصيد المورد"""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value == 0:
            raise serializers.ValidationError("المبلغ لا يمكن أن يكون صفراً")
        return value