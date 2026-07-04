from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'suppliers'

router = DefaultRouter()
router.register(r'suppliers', api.SupplierViewSet, basename='supplier')

urlpatterns = [
    path('api/', include(router.urls)),
]