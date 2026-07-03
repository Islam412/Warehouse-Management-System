from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'reports'

router = DefaultRouter()
router.register(r'reports', api.ReportViewSet, basename='report')

urlpatterns = [
    path('api/', include(router.urls)),
]
