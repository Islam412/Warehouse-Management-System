from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

app_name = 'finance'

router = DefaultRouter()
router.register(r'accounts', api.AccountViewSet, basename='account')
router.register(r'journal-entries', api.JournalEntryViewSet, basename='journal-entry')
router.register(r'cash-transactions', api.CashTransactionViewSet, basename='cash-transaction')
router.register(r'expenses', api.ExpenseViewSet, basename='expense')
router.register(r'incomes', api.IncomeViewSet, basename='income')
router.register(r'closings', api.DailyClosingViewSet, basename='closing')

urlpatterns = [
    path('api/', include(router.urls)),
]
