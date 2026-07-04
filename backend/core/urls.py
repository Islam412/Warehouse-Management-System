"""
URL configuration for core project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Duka API",
        default_version='v1',
        description="نظام إدارة المتاجر - API",
        terms_of_service="https://www.duka.com/terms/",
        contact=openapi.Contact(email="contact@duka.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Apps 
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/sales/', include('sales.urls')),
    path('api/v1/purchases/', include('purchases.urls')),
    path('api/v1/customers/', include('customers.urls')),
    path('api/v1/suppliers/', include('suppliers.urls')),
    path('api/v1/finance/', include('finance.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/settings/', include('settings.urls')),
    
    # Swagger/OpenAPI
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
