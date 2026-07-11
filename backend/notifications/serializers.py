from rest_framework import serializers
from .models import Notification, NotificationPreference, NotificationLog

class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.ReadOnlyField(source='get_notification_type_display')
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'notification_type_display',
            'user', 'is_read', 'is_sent', 'reference_type', 'reference_id',
            'extra_data', 'due_date', 'created_at', 'read_at', 'sent_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'sent_at']

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['title', 'message', 'notification_type', 'user', 'reference_type', 
                  'reference_id', 'extra_data', 'due_date']
        read_only_fields = ['user']
    
    def create(self, validated_data):
        if 'user' not in validated_data:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'enable_notifications', 'enable_email', 'enable_push',
                  'stock_alert', 'payment_due', 'collection_due', 'order_received',
                  'system_updates', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class NotificationLogSerializer(serializers.ModelSerializer):
    channel_display = serializers.ReadOnlyField(source='get_channel_display')
    
    class Meta:
        model = NotificationLog
        fields = ['id', 'notification', 'channel', 'channel_display', 'status',
                  'response', 'error', 'created_at', 'sent_at']
        read_only_fields = ['id', 'created_at']