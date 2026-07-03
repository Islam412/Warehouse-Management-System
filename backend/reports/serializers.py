from rest_framework import serializers
from .models import ReportLog

class ReportLogSerializer(serializers.ModelSerializer):
    """Serializer لسجل التقارير"""
    report_type_display = serializers.ReadOnlyField(source='get_report_type_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = ReportLog
        fields = ['id', 'report_type', 'report_type_display', 'title', 
                  'filters', 'file_path', 'format', 'created_by', 
                  'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReportFilterSerializer(serializers.Serializer):
    """Serializer لفلاتر التقارير"""
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    status = serializers.CharField(required=False)
    category = serializers.UUIDField(required=False)
    brand = serializers.UUIDField(required=False)
    customer = serializers.UUIDField(required=False)
    supplier = serializers.UUIDField(required=False)
    warehouse = serializers.UUIDField(required=False)
