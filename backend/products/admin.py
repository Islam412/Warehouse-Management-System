from django.contrib import admin
from .models import Category, Brand, Unit, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_ar', 'parent', 'is_active']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'name_ar']

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_ar', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'name_ar']

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_ar', 'symbol', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'name_ar']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'brand', 'category', 'selling_price', 'is_active']
    list_filter = ['is_active', 'brand', 'category', 'has_stock']
    search_fields = ['name', 'name_ar', 'sku', 'barcode']
    readonly_fields = ['id', 'created_at', 'updated_at']
