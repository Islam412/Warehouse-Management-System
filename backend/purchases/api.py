from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from decimal import Decimal
from .models import PurchaseOrder, PurchaseItem
from .serializers import (
    PurchaseOrderSerializer, PurchaseOrderCreateSerializer,
    PurchaseItemSerializer, PurchaseReceiveSerializer
)
from inventory.models import Stock, StockMovement

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة أوامر الشراء"""
    queryset = PurchaseOrder.objects.all().select_related('supplier', 'warehouse', 'created_by')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'warehouse', 'status']
    search_fields = ['order_number', 'supplier__name', 'supplier__phone']
    ordering_fields = ['order_date', 'total', 'expected_date']
    ordering = ['-order_date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PurchaseOrderCreateSerializer
        return PurchaseOrderSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def receive(self, request, pk=None):
        """استلام أمر الشراء"""
        order = self.get_object()
        
        if order.status == 'received':
            return Response(
                {"error": "Order already received"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status == 'cancelled':
            return Response(
                {"error": "Cannot receive cancelled order"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # الحصول على بيانات الاستلام
        items_data = request.data.get('items', [])
        
        if not items_data:
            return Response(
                {"error": "No items to receive"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        received_items = []
        
        for item_data in items_data:
            item_id = item_data.get('item_id')
            received_qty = Decimal(str(item_data.get('received_quantity', 0)))
            
            try:
                item = PurchaseItem.objects.get(id=item_id, order=order)
            except PurchaseItem.DoesNotExist:
                return Response(
                    {"error": f"Item {item_id} not found in this order"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if received_qty <= 0:
                return Response(
                    {"error": f"Invalid quantity for {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if received_qty > item.remaining_quantity:
                return Response(
                    {"error": f"Cannot receive more than {item.remaining_quantity} for {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # تحديث الكمية المستلمة
            item.received_quantity += received_qty
            item.save()
            
            # تحديث المخزون
            stock, created = Stock.objects.get_or_create(
                product=item.product,
                warehouse=order.warehouse,
                defaults={'quantity': 0}
            )
            old_quantity = stock.quantity
            stock.quantity += received_qty
            stock.save()
            
            # تسجيل حركة المخزون
            StockMovement.objects.create(
                product=item.product,
                warehouse=order.warehouse,
                movement_type='purchase',
                quantity=received_qty,
                previous_quantity=old_quantity,
                new_quantity=stock.quantity,
                reference_id=order.id,
                reference_type='PurchaseOrder',
                notes=f"استلام من أمر شراء {order.order_number}",
                created_by=request.user
            )
            
            received_items.append({
                'product': item.product.name,
                'quantity': received_qty
            })
        
        # تحديث حالة الطلب
        order.status = 'received'
        order.received_date = timezone.now()
        order.save()
        
        return Response({
            'message': f'Order {order.order_number} received successfully',
            'received_items': received_items
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """إلغاء أمر الشراء"""
        order = self.get_object()
        
        if order.status == 'received':
            return Response(
                {"error": "Cannot cancel received order"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        return Response({
            'message': f'Order {order.order_number} cancelled successfully'
        }, status=status.HTTP_200_OK)

class PurchaseItemViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة بنود الشراء"""
    queryset = PurchaseItem.objects.all().select_related('order', 'product')
    serializer_class = PurchaseItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['order', 'product']
    search_fields = ['product__name', 'product__sku']
    ordering = ['-order__order_date']
