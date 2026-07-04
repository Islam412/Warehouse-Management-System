from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'settings_app'

router = DefaultRouter()
router.register(r'branches', api.BranchViewSet, basename='branch')
router.register(r'social-links', api.SocialLinkViewSet, basename='social-link')
router.register(r'payment-methods', api.PaymentMethodViewSet, basename='payment-method')
router.register(r'shipping-methods', api.ShippingMethodViewSet, basename='shipping-method')

urlpatterns = [
    # Company endpoints
    path('api/company/', api.CompanyViewSet.as_view({
        'get': 'list',
        'put': 'update',
        'patch': 'partial_update'
    }), name='company'),
    path('api/company/upload-logo/', api.CompanyViewSet.as_view({
        'post': 'upload_logo'
    }), name='upload-logo'),
    path('api/company/upload-cover/', api.CompanyViewSet.as_view({
        'post': 'upload_cover'
    }), name='upload-cover'),
    
    # Settings endpoints
    path('api/settings/', api.SettingsViewSet.as_view({
        'get': 'list',
        'put': 'update',
        'patch': 'update'
    }), name='settings'),
    path('api/settings/reset/', api.SettingsViewSet.as_view({
        'post': 'reset_defaults'
    }), name='reset-settings'),
    
    # Router endpoints
    path('api/', include(router.urls)),
]