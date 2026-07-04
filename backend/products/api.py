from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from .models import Category, Brand, Unit, Product, ProductImage
from .serializers import (
    CategorySerializer, BrandSerializer, UnitSerializer,
    ProductSerializer, ProductDetailSerializer, ProductImageSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الفئات"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'parent']
    search_fields = ['name', 'name_ar', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class BrandViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة العلامات التجارية"""
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'name_ar', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class UnitViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة وحدات القياس"""
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'name_ar', 'symbol']
    ordering = ['name']

class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المنتجات"""
    queryset = Product.objects.filter(is_deleted=False).select_related('category', 'brand', 'unit', 'created_by')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'unit', 'is_active', 'has_stock', 'is_featured']
    search_fields = ['name', 'name_ar', 'sku', 'barcode', 'description']
    ordering_fields = ['name', 'selling_price', 'purchase_price', 'created_at', 'updated_at']
    ordering = ['-created_at']
    lookup_field = 'pk'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Soft Delete - بدلاً من الحذف الفعلي"""
        instance = self.get_object()
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """البحث المتقدم في المنتجات"""
        query = request.query_params.get('q', '')
        category = request.query_params.get('category')
        brand = request.query_params.get('brand')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        products = Product.objects.filter(is_deleted=False)
        
        if query:
            products = products.filter(
                Q(name__icontains=query) |
                Q(name_ar__icontains=query) |
                Q(sku__icontains=query) |
                Q(barcode__icontains=query) |
                Q(brand__name__icontains=query) |
                Q(category__name__icontains=query)
            )
        
        if category:
            products = products.filter(category_id=category)
        
        if brand:
            products = products.filter(brand_id=brand)
        
        if min_price:
            products = products.filter(selling_price__gte=min_price)
        
        if max_price:
            products = products.filter(selling_price__lte=max_price)
        
        products = products[:50]
        serializer = self.get_serializer(products, many=True)
        return Response({
            'count': products.count(),
            'results': serializer.data
        })

class ProductImageViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة صور المنتج"""
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'is_primary']
