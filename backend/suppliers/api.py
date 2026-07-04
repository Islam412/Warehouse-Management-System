from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q, Sum
from decimal import Decimal
from .models import Supplier
from .serializers import (
    SupplierSerializer, SupplierCreateSerializer,
    SupplierBalanceUpdateSerializer
)



class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الموردين"""
    queryset = Supplier.objects.all().select_related('created_by')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'name_ar', 'phone', 'email', 'tax_number']
    ordering_fields = ['name', 'balance', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SupplierCreateSerializer
        return SupplierSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def update_balance(self, request, pk=None):
        """تحديث رصيد المورد"""
        supplier = self.get_object()
        serializer = SupplierBalanceUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        amount = serializer.validated_data['amount']
        notes = serializer.validated_data.get('notes', '')
        
        # تحديث الرصيد
        supplier.balance += amount
        supplier.save()
        
        return Response({
            'message': 'تم تحديث الرصيد بنجاح',
            'old_balance': float(supplier.balance - amount),
            'new_balance': float(supplier.balance),
            'amount': float(amount),
            'notes': notes
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def top_suppliers(self, request):
        """جلب الموردين الأكثر تعاملاً"""
        suppliers = self.get_queryset().filter(is_active=True)
        # ترتيب حسب الرصيد (الأعلى أولاً)
        suppliers = suppliers.order_by('-balance')
        serializer = self.get_serializer(suppliers[:10], many=True)
        return Response(serializer.data)