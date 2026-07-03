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

