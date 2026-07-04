from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import datetime, date, timedelta
from decimal import Decimal
import uuid
import json
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
    
    def _prepare_filters(self, filters):
        """تحويل الفلاتر إلى JSON serializable"""
        prepared = {}
        for key, value in filters.items():
            if isinstance(value, datetime):
                prepared[key] = value.isoformat()
            elif isinstance(value, date):
                prepared[key] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                prepared[key] = str(value)
            elif isinstance(value, Decimal):
                prepared[key] = float(value)
            else:
                prepared[key] = value
        return prepared
    
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
            sale_date=TruncDate('date')
        ).values('sale_date').annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('-sale_date')[:30]
        
        # تحويل التاريخ إلى string
        daily_sales_list = []
        for item in daily_sales:
            daily_sales_list.append({
                'date': item['sale_date'].isoformat() if item['sale_date'] else None,
                'total': float(item['total']) if item['total'] else 0,
                'count': item['count']
            })
        
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
                'total_amount': float(total_amount),
                'total_paid': float(total_paid),
                'total_remaining': float(total_remaining),
            },
            'daily_sales': daily_sales_list,
            'customer_sales': list(customer_sales),
            'product_sales': list(product_sales),
        }
        
        # تسجيل التقرير
        prepared_filters = self._prepare_filters(filters)
        ReportLog.objects.create(
            report_type='sales',
            title=f'تقرير المبيعات - {timezone.now().strftime("%Y-%m-%d")}',
            filters=prepared_filters,
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
        
        supplier_purchases = queryset.values(
            'supplier__id', 'supplier__name'
        ).annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('-total')[:10]
        
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
                'total_amount': float(total_amount),
            },
            'supplier_purchases': list(supplier_purchases),
            'product_purchases': list(product_purchases),
        }
        
        prepared_filters = self._prepare_filters(filters)
        ReportLog.objects.create(
            report_type='purchases',
            title=f'تقرير المشتريات - {timezone.now().strftime("%Y-%m-%d")}',
            filters=prepared_filters,
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
        
        total_items = queryset.count()
        total_quantity = queryset.aggregate(Sum('quantity'))['quantity__sum'] or 0
        total_value = sum(float(stock.quantity * stock.product.purchase_price) for stock in queryset)
        
        low_stock = queryset.filter(quantity__lte=F('min_quantity')).values(
            'product__id', 'product__name', 'product__sku',
            'quantity', 'min_quantity'
        )[:20]
        
        high_value = queryset.order_by('-quantity')[:20]
        high_value_data = [{
            'product_id': str(stock.product.id),
            'product_name': stock.product.name,
            'sku': stock.product.sku,
            'quantity': float(stock.quantity),
            'value': float(stock.quantity * stock.product.purchase_price)
        } for stock in high_value]
        
        recent_movements = StockMovement.objects.all().select_related(
            'product', 'warehouse', 'created_by'
        ).order_by('-created_at')[:50]
        
        movement_data = [{
            'product': movement.product.name,
            'warehouse': movement.warehouse.name,
            'type': movement.get_movement_type_display(),
            'quantity': float(movement.quantity),
            'created_at': movement.created_at.isoformat()
        } for movement in recent_movements]
        
        data = {
            'summary': {
                'total_items': total_items,
                'total_quantity': float(total_quantity),
                'total_value': float(total_value),
            },
            'low_stock': list(low_stock),
            'high_value': high_value_data,
            'recent_movements': movement_data[:20],
        }
        
        prepared_filters = self._prepare_filters(filters)
        ReportLog.objects.create(
            report_type='inventory',
            title=f'تقرير المخزون - {timezone.now().strftime("%Y-%m-%d")}',
            filters=prepared_filters,
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
        
        total_revenue = queryset.aggregate(Sum('total'))['total__sum'] or 0
        
        cost_of_goods = Decimal(0)
        for invoice in queryset:
            for item in invoice.items.all():
                cost_of_goods += item.quantity * item.product.purchase_price
        
        gross_profit = total_revenue - cost_of_goods
        
        product_summary = {}
        for invoice in queryset:
            for item in invoice.items.all():
                revenue = item.total
                cost = item.quantity * item.product.purchase_price
                profit = revenue - cost
                if item.product.name not in product_summary:
                    product_summary[item.product.name] = {
                        'revenue': Decimal(0),
                        'cost': Decimal(0),
                        'profit': Decimal(0)
                    }
                product_summary[item.product.name]['revenue'] += revenue
                product_summary[item.product.name]['cost'] += cost
                product_summary[item.product.name]['profit'] += profit
        
        product_summary_list = [
            {
                'product': name,
                'revenue': float(data['revenue']),
                'cost': float(data['cost']),
                'profit': float(data['profit']),
                'margin': float((data['profit'] / data['revenue'] * 100)) if data['revenue'] > 0 else 0
            }
            for name, data in product_summary.items()
        ]
        product_summary_list.sort(key=lambda x: x['profit'], reverse=True)
        
        data = {
            'summary': {
                'total_revenue': float(total_revenue),
                'cost_of_goods': float(cost_of_goods),
                'gross_profit': float(gross_profit),
                'profit_margin': float(gross_profit / total_revenue * 100) if total_revenue > 0 else 0,
                'invoice_count': queryset.count(),
            },
            'product_profits': product_summary_list[:20],
        }
        
        prepared_filters = self._prepare_filters(filters)
        ReportLog.objects.create(
            report_type='profit_loss',
            title=f'تقرير الأرباح والخسائر - {timezone.now().strftime("%Y-%m-%d")}',
            filters=prepared_filters,
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
        
        total_customers = queryset.count()
        vip_customers = queryset.filter(is_vip=True).count()
        
        top_customers = []
        for customer in queryset:
            total_spent = customer.total_purchases
            if total_spent > 0:
                top_customers.append({
                    'id': str(customer.id),
                    'name': customer.name,
                    'phone': customer.phone,
                    'total_spent': float(total_spent),
                    'total_invoices': customer.total_invoices,
                    'outstanding_balance': float(customer.outstanding_balance),
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
        
        prepared_filters = self._prepare_filters(filters)
        ReportLog.objects.create(
            report_type='customers',
            title=f'تقرير العملاء - {timezone.now().strftime("%Y-%m-%d")}',
            filters=prepared_filters,
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
        
        top_suppliers = []
        for supplier in queryset:
            total_purchases = supplier.total_purchases
            if total_purchases > 0:
                top_suppliers.append({
                    'id': str(supplier.id),
                    'name': supplier.name,
                    'phone': supplier.phone,
                    'total_purchases': float(total_purchases),
                    'order_count': supplier.orders.count(),
                })
        top_suppliers.sort(key=lambda x: x['total_purchases'], reverse=True)
        
        data = {
            'summary': {
                'total_suppliers': total_suppliers,
            },
            'top_suppliers': top_suppliers[:20],
        }
        
        prepared_filters = self._prepare_filters(filters)
        ReportLog.objects.create(
            report_type='suppliers',
            title=f'تقرير الموردين - {timezone.now().strftime("%Y-%m-%d")}',
            filters=prepared_filters,
            created_by=request.user
        )
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """جلب سجل التقارير"""
        queryset = ReportLog.objects.all().select_related('created_by')
        serializer = ReportLogSerializer(queryset[:50], many=True)
        return Response(serializer.data)
