from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'notifications'

router = DefaultRouter()
router.register(r'notifications', api.NotificationViewSet, basename='notification')
router.register(r'preferences', api.NotificationPreferenceViewSet, basename='preference')
router.register(r'logs', api.NotificationLogViewSet, basename='log')

urlpatterns = [
    path('api/', include(router.urls)),
]
