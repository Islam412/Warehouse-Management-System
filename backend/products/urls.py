from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'products'

router = DefaultRouter()
router.register(r'categories', api.CategoryViewSet, basename='category')
router.register(r'brands', api.BrandViewSet, basename='brand')
router.register(r'units', api.UnitViewSet, basename='unit')
router.register(r'products', api.ProductViewSet, basename='product')
router.register(r'images', api.ProductImageViewSet, basename='product-image')

urlpatterns = [
    path('api/', include(router.urls)),
]
