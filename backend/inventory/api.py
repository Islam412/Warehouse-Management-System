from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q
from .models import Warehouse, Stock, StockMovement
from .serializers import WarehouseSerializer, StockSerializer, StockMovementSerializer
from products.models import Product

class WarehouseViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المخازن"""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'manager']
    search_fields = ['name', 'name_ar', 'location']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class StockViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المخزون"""
    queryset = Stock.objects.all().select_related('product', 'warehouse', 'updated_by')
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'warehouse', 'product__category', 'product__brand']
    search_fields = ['product__name', 'product__sku', 'warehouse__name']
    ordering_fields = ['quantity', 'last_updated']
    ordering = ['-last_updated']
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """جلب المنتجات منخفضة المخزون"""
        stocks = self.get_queryset().filter(quantity__lte=models.F('min_quantity'))
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def over_stock(self, request):
        """جلب المنتجات زائدة عن الحد"""
        stocks = self.get_queryset().filter(
            max_quantity__gt=0,
            quantity__gte=models.F('max_quantity')
        )
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)

