from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q, Sum
from decimal import Decimal
from .models import Customer
from .serializers import (
    CustomerSerializer, CustomerCreateSerializer, 
    CustomerBalanceUpdateSerializer
)

class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة العملاء"""
    queryset = Customer.objects.all().select_related('created_by')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_vip']
    search_fields = ['name', 'name_ar', 'phone', 'email', 'tax_number']
    ordering_fields = ['name', 'balance', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CustomerCreateSerializer
        return CustomerSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def partial_update(self, request, *args, **kwargs):
        """دعم التحديث الجزئي - مهم لـ Switches"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def update_balance(self, request, pk=None):
        """تحديث رصيد العميل"""
        customer = self.get_object()
        serializer = CustomerBalanceUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        amount = serializer.validated_data['amount']
        notes = serializer.validated_data.get('notes', '')
        
        customer.balance += amount
        customer.save()
        
        return Response({
            'message': 'Balance updated successfully',
            'old_balance': customer.balance - amount,
            'new_balance': customer.balance,
            'amount': amount,
            'notes': notes
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def vip(self, request):
        """جلب العملاء المميزين"""
        customers = self.get_queryset().filter(is_vip=True, is_active=True)
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_spenders(self, request):
        """جلب العملاء الأكثر إنفاقاً"""
        customers = self.get_queryset().filter(is_active=True)
        customers = customers.order_by('-balance')
        serializer = self.get_serializer(customers[:10], many=True)
        return Response(serializer.data)
