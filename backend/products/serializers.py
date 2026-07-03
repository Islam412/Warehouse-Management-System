from rest_framework import serializers
from .models import Category, Brand, Unit, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    """Serializer للفئات"""
    products_count = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'name_ar', 'description', 'parent', 
                  'full_path', 'is_active', 'products_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_products_count(self, obj):
        return obj.products.count()

class BrandSerializer(serializers.ModelSerializer):
    """Serializer للعلامات التجارية"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'name_ar', 'logo', 'description', 
                  'is_active', 'products_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_products_count(self, obj):
        return obj.products.count()

class UnitSerializer(serializers.ModelSerializer):
    """Serializer لوحدات القياس"""
    class Meta:
        model = Unit
        fields = ['id', 'name', 'name_ar', 'symbol', 'is_active']
        read_only_fields = ['id']

class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer لصور المنتج"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'image_url', 'is_primary', 'alt_text', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class ProductSerializer(serializers.ModelSerializer):
    """Serializer للمنتجات"""
    profit_margin = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    brand_name = serializers.ReadOnlyField(source='brand.name')
    unit_name = serializers.ReadOnlyField(source='unit.name')
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'name_ar', 'description',
            'category', 'category_name', 'brand', 'brand_name',
            'unit', 'unit_name', 'sku', 'barcode',
            'purchase_price', 'selling_price', 'wholesale_price',
            'profit_margin', 'full_name',
            'size', 'color', 'weight',
            'is_active', 'is_featured', 'has_stock',
            'images', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ProductDetailSerializer(ProductSerializer):
    """Serializer تفصيلي للمنتج مع تفاصيل العلاقات"""
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    unit_detail = UnitSerializer(source='unit', read_only=True)
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + [
            'category_detail', 'brand_detail', 'unit_detail'
        ]
