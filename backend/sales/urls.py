from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'sales'

router = DefaultRouter()
router.register(r'invoices', api.InvoiceViewSet, basename='invoice')
router.register(r'payments', api.PaymentViewSet, basename='payment')
router.register(r'returns', api.ReturnViewSet, basename='return')

urlpatterns = [
    path('api/', include(router.urls)),
]
