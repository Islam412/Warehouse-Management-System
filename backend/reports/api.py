from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from .models import ReportLog
from .serializers import ReportLogSerializer, ReportFilterSerializer
from sales.models import Invoice, InvoiceItem, Payment
from purchases.models import PurchaseOrder, PurchaseItem
from inventory.models import Stock, StockMovement
from products.models import Product, Category, Brand
from customers.models import Customer
from suppliers.models import Supplier

class ReportViewSet(viewsets.ViewSet):
    """ViewSet لإدارة التقارير"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    @action(detail=False, methods=['post'])
    def sales(self, request):
        """تقرير المبيعات"""
        serializer = ReportFilterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = serializer.validated_data
        queryset = Invoice.objects.all()
        
        # تطبيق الفلاتر
        if filters.get('date_from'):
            queryset = queryset.filter(date__date__gte=filters['date_from'])
        if filters.get('date_to'):
            queryset = queryset.filter(date__date__lte=filters['date_to'])
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        if filters.get('customer'):
            queryset = queryset.filter(customer_id=filters['customer'])
        
        # إحصائيات المبيعات
        total_invoices = queryset.count()
        total_amount = queryset.aggregate(Sum('total'))['total__sum'] or 0
        total_paid = queryset.aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0
        total_remaining = total_amount - total_paid
        
        # المبيعات اليومية
        daily_sales = queryset.annotate(
            date=TruncDate('date')
        ).values('date').annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('-date')[:30]
        
        # المبيعات حسب العميل
        customer_sales = queryset.values(
            'customer__id', 'customer__name'
        ).annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('-total')[:10]
        
        # المبيعات حسب المنتج
        product_sales = InvoiceItem.objects.filter(
            invoice__in=queryset
        ).values(
            'product__id', 'product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_amount=Sum('total')
        ).order_by('-total_amount')[:10]
        
        data = {
            'summary': {
                'total_invoices': total_invoices,
                'total_amount': total_amount,
                'total_paid': total_paid,
                'total_remaining': total_remaining,
            },
            'daily_sales': daily_sales,
            'customer_sales': customer_sales,
            'product_sales': product_sales,
        }
        
        # تسجيل التقرير
        ReportLog.objects.create(
            report_type='sales',
            title=f'تقرير المبيعات - {timezone.now().strftime("%Y-%m-%d")}',
            filters=filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def purchases(self, request):
        """تقرير المشتريات"""
        serializer = ReportFilterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = serializer.validated_data
        queryset = PurchaseOrder.objects.all()
        
        if filters.get('date_from'):
            queryset = queryset.filter(order_date__date__gte=filters['date_from'])
        if filters.get('date_to'):
            queryset = queryset.filter(order_date__date__lte=filters['date_to'])
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        if filters.get('supplier'):
            queryset = queryset.filter(supplier_id=filters['supplier'])
        
        total_orders = queryset.count()
        total_amount = queryset.aggregate(Sum('total'))['total__sum'] or 0
        
        # المشتريات حسب المورد
        supplier_purchases = queryset.values(
            'supplier__id', 'supplier__name'
        ).annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('-total')[:10]
        
        # المشتريات حسب المنتج
        product_purchases = PurchaseItem.objects.filter(
            order__in=queryset
        ).values(
            'product__id', 'product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_amount=Sum('total')
        ).order_by('-total_amount')[:10]
        
        data = {
            'summary': {
                'total_orders': total_orders,
                'total_amount': total_amount,
            },
            'supplier_purchases': supplier_purchases,
            'product_purchases': product_purchases,
        }
        
        ReportLog.objects.create(
            report_type='purchases',
            title=f'تقرير المشتريات - {timezone.now().strftime("%Y-%m-%d")}',
            filters=filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def inventory(self, request):
        """تقرير المخزون"""
        serializer = ReportFilterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = serializer.validated_data
        queryset = Stock.objects.all().select_related('product', 'warehouse')
        
        if filters.get('warehouse'):
            queryset = queryset.filter(warehouse_id=filters['warehouse'])
        if filters.get('category'):
            queryset = queryset.filter(product__category_id=filters['category'])
        if filters.get('brand'):
            queryset = queryset.filter(product__brand_id=filters['brand'])
        
        # إحصائيات المخزون
        total_items = queryset.count()
        total_quantity = queryset.aggregate(Sum('quantity'))['quantity__sum'] or 0
        total_value = sum(stock.quantity * stock.product.purchase_price for stock in queryset)
        
        # المنتجات منخفضة المخزون
        low_stock = queryset.filter(quantity__lte=F('min_quantity')).values(
            'product__id', 'product__name', 'product__sku',
            'quantity', 'min_quantity'
        )[:20]
        
        # المنتجات الأكثر قيمة
        high_value = queryset.order_by('-quantity')[:20]
        high_value_data = [{
            'product_id': str(stock.product.id),
            'product_name': stock.product.name,
            'sku': stock.product.sku,
            'quantity': stock.quantity,
            'value': stock.quantity * stock.product.purchase_price
        } for stock in high_value]
        
        # حركات المخزون الأخيرة
        recent_movements = StockMovement.objects.all().select_related(
            'product', 'warehouse', 'created_by'
        ).order_by('-created_at')[:50]
        
        movement_data = [{
            'product': movement.product.name,
            'warehouse': movement.warehouse.name,
            'type': movement.get_movement_type_display(),
            'quantity': movement.quantity,
            'created_at': movement.created_at
        } for movement in recent_movements]
        
        data = {
            'summary': {
                'total_items': total_items,
                'total_quantity': total_quantity,
                'total_value': total_value,
            },
            'low_stock': low_stock,
            'high_value': high_value_data,
            'recent_movements': movement_data[:20],
        }
        
        ReportLog.objects.create(
            report_type='inventory',
            title=f'تقرير المخزون - {timezone.now().strftime("%Y-%m-%d")}',
            filters=filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def profit_loss(self, request):
        """تقرير الأرباح والخسائر"""
        serializer = ReportFilterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = serializer.validated_data
        queryset = Invoice.objects.filter(status__in=['paid', 'confirmed'])
        
        if filters.get('date_from'):
            queryset = queryset.filter(date__date__gte=filters['date_from'])
        if filters.get('date_to'):
            queryset = queryset.filter(date__date__lte=filters['date_to'])
        
        # حساب الإيرادات
        total_revenue = queryset.aggregate(Sum('total'))['total__sum'] or 0
        
        # حساب تكلفة البضاعة المباعة
        cost_of_goods = 0
        for invoice in queryset:
            for item in invoice.items.all():
                cost_of_goods += item.quantity * item.product.purchase_price
        
        # حساب الأرباح
        gross_profit = total_revenue - cost_of_goods
        
        # الأرباح حسب المنتج
        product_profits = []
        for invoice in queryset:
            for item in invoice.items.all():
                revenue = item.total
                cost = item.quantity * item.product.purchase_price
                profit = revenue - cost
                product_profits.append({
                    'product': item.product.name,
                    'revenue': revenue,
                    'cost': cost,
                    'profit': profit,
                    'margin': (profit / revenue * 100) if revenue > 0 else 0
                })
        
        # تجميع الأرباح حسب المنتج
        product_summary = {}
        for p in product_profits:
            if p['product'] not in product_summary:
                product_summary[p['product']] = {'revenue': 0, 'cost': 0, 'profit': 0}
            product_summary[p['product']]['revenue'] += p['revenue']
            product_summary[p['product']]['cost'] += p['cost']
            product_summary[p['product']]['profit'] += p['profit']
        
        product_summary_list = [
            {
                'product': name,
                'revenue': data['revenue'],
                'cost': data['cost'],
                'profit': data['profit'],
                'margin': (data['profit'] / data['revenue'] * 100) if data['revenue'] > 0 else 0
            }
            for name, data in product_summary.items()
        ]
        product_summary_list.sort(key=lambda x: x['profit'], reverse=True)
        
        data = {
            'summary': {
                'total_revenue': total_revenue,
                'cost_of_goods': cost_of_goods,
                'gross_profit': gross_profit,
                'profit_margin': (gross_profit / total_revenue * 100) if total_revenue > 0 else 0,
                'invoice_count': queryset.count(),
            },
            'product_profits': product_summary_list[:20],
        }
        
        ReportLog.objects.create(
            report_type='profit_loss',
            title=f'تقرير الأرباح والخسائر - {timezone.now().strftime("%Y-%m-%d")}',
            filters=filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def customers(self, request):
        """تقرير العملاء"""
        serializer = ReportFilterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = serializer.validated_data
        queryset = Customer.objects.filter(is_active=True)
        
        # إحصائيات العملاء
        total_customers = queryset.count()
        vip_customers = queryset.filter(is_vip=True).count()
        
        # العملاء الأكثر إنفاقاً
        top_customers = []
        for customer in queryset:
            total_spent = customer.total_purchases
            if total_spent > 0:
                top_customers.append({
                    'id': str(customer.id),
                    'name': customer.name,
                    'phone': customer.phone,
                    'total_spent': total_spent,
                    'total_invoices': customer.total_invoices,
                    'outstanding_balance': customer.outstanding_balance,
                })
        top_customers.sort(key=lambda x: x['total_spent'], reverse=True)
        
        data = {
            'summary': {
                'total_customers': total_customers,
                'vip_customers': vip_customers,
                'active_customers': total_customers,
            },
            'top_customers': top_customers[:20],
        }
        
        ReportLog.objects.create(
            report_type='customers',
            title=f'تقرير العملاء - {timezone.now().strftime("%Y-%m-%d")}',
            filters=filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def suppliers(self, request):
        """تقرير الموردين"""
        serializer = ReportFilterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = serializer.validated_data
        queryset = Supplier.objects.filter(is_active=True)
        
        total_suppliers = queryset.count()
        
        # الموردين الأكثر تعاملاً
        top_suppliers = []
        for supplier in queryset:
            total_purchases = supplier.total_purchases
            if total_purchases > 0:
                top_suppliers.append({
                    'id': str(supplier.id),
                    'name': supplier.name,
                    'phone': supplier.phone,
                    'total_purchases': total_purchases,
                    'order_count': supplier.orders.count(),
                })
        top_suppliers.sort(key=lambda x: x['total_purchases'], reverse=True)
        
        data = {
            'summary': {
                'total_suppliers': total_suppliers,
            },
            'top_suppliers': top_suppliers[:20],
        }
        
        ReportLog.objects.create(
            report_type='suppliers',
            title=f'تقرير الموردين - {timezone.now().strftime("%Y-%m-%d")}',
            filters=filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """جلب سجل التقارير"""
        queryset = ReportLog.objects.all().select_related('created_by')
        serializer = ReportLogSerializer(queryset[:50], many=True)
        return Response(serializer.data)
