from django.urls import path
from . import api

app_name = 'dashboard'

urlpatterns = [
    # الملخص العام
    path('api/summary/', api.DashboardSummaryView.as_view(), name='summary'),
    
    # الرسوم البيانية
    path('api/chart/sales/', api.DashboardSalesChartView.as_view(), name='sales-chart'),
    
    # المقارنات
    path('api/comparison/', api.DashboardComparisonView.as_view(), name='comparison'),
    
    # عناصر لوحة التحكم
    path('api/widgets/', api.DashboardWidgetsView.as_view(), name='widgets'),
    path('api/widgets/<uuid:widget_id>/', api.DashboardWidgetsView.as_view(), name='widget-detail'),
]