from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'purchases'

router = DefaultRouter()
router.register(r'orders', api.PurchaseOrderViewSet, basename='purchase-order')
router.register(r'items', api.PurchaseItemViewSet, basename='purchase-item')

urlpatterns = [
    path('api/', include(router.urls)),
]
