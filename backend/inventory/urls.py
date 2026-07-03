from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'inventory'

router = DefaultRouter()
router.register(r'warehouses', api.WarehouseViewSet, basename='warehouse')
router.register(r'stocks', api.StockViewSet, basename='stock')
router.register(r'movements', api.StockMovementViewSet, basename='movement')

urlpatterns = [
    path('api/', include(router.urls)),
]
