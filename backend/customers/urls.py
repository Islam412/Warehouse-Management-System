from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'customers'

router = DefaultRouter()
router.register(r'customers', api.CustomerViewSet, basename='customer')

urlpatterns = [
    path('api/', include(router.urls)),
]
