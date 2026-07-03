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

class StockMovementViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة حركات المخزون"""
    queryset = StockMovement.objects.all().select_related('product', 'warehouse', 'created_by')
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'warehouse', 'movement_type']
    search_fields = ['product__name', 'product__sku', 'notes']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def adjust_stock(self, request):
        """
        تعديل المخزون يدوياً
        expected data: {
            product_id, warehouse_id, quantity, movement_type, notes
        }
        """
        product_id = request.data.get('product_id')
        warehouse_id = request.data.get('warehouse_id')
        quantity = request.data.get('quantity')
        movement_type = request.data.get('movement_type', 'adjustment')
        notes = request.data.get('notes', '')
        
        if not all([product_id, warehouse_id, quantity]):
            return Response(
                {"error": "product_id, warehouse_id, and quantity are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = float(quantity)
        except ValueError:
            return Response(
                {"error": "quantity must be a number"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id)
            warehouse = Warehouse.objects.get(id=warehouse_id)
        except (Product.DoesNotExist, Warehouse.DoesNotExist):
            return Response(
                {"error": "Product or Warehouse not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # الحصول على المخزون الحالي أو إنشاؤه
        stock, created = Stock.objects.get_or_create(
            product=product,
            warehouse=warehouse,
            defaults={'quantity': 0}
        )
        
        previous_quantity = stock.quantity
        new_quantity = previous_quantity + quantity
        
        if new_quantity < 0:
            return Response(
                {"error": "Insufficient stock"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # تحديث المخزون
        stock.quantity = new_quantity
        stock.updated_by = request.user
        stock.save()
        
        # تسجيل الحركة
        movement = StockMovement.objects.create(
            product=product,
            warehouse=warehouse,
            movement_type=movement_type,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            notes=notes,
            created_by=request.user
        )
        
        serializer = StockMovementSerializer(movement)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
