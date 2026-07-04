from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from .models import Notification, NotificationPreference, NotificationLog
from .serializers import (
    NotificationSerializer, NotificationCreateSerializer,
    NotificationPreferenceSerializer, NotificationLogSerializer
)

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الإشعارات"""
    queryset = Notification.objects.all().select_related('user')
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_read', 'is_sent']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """عرض إشعارات المستخدم الحالي فقط"""
        return super().get_queryset().filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """تحديد إشعار كمقروء"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """تحديد جميع الإشعارات كمقروءة"""
        count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': f'{count} notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """عدد الإشعارات غير المقروءة"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """آخر 10 إشعارات"""
        notifications = self.get_queryset()[:10]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة تفضيلات الإشعارات"""
    queryset = NotificationPreference.objects.all().select_related('user')
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)
    
    def get_object(self):
        """الحصول على تفضيلات المستخدم الحالي"""
        preference, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
    
    def retrieve(self, request, *args, **kwargs):
        """جلب تفضيلات المستخدم الحالي"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """تحديث تفضيلات المستخدم الحالي"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet لعرض سجل الإشعارات (للقراءة فقط)"""
    queryset = NotificationLog.objects.all().select_related('notification', 'notification__user')
    serializer_class = NotificationLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['channel', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return super().get_queryset().filter(notification__user=self.request.user)
