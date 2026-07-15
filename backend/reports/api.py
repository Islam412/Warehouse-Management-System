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
        """تقرير المبيعات - مع التفاصيل الكاملة"""
        try:
            serializer = ReportFilterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            filters = serializer.validated_data
            queryset = Invoice.objects.all().select_related('customer', 'created_by')
            
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
            total_remaining = float(total_amount) - float(total_paid)
            
            # ✅ تفاصيل الفواتير
            invoice_details = []
            for invoice in queryset[:50]:
                invoice_details.append({
                    'id': str(invoice.id),
                    'invoice_number': invoice.invoice_number,
                    'customer': invoice.customer.name,
                    'date': invoice.date.isoformat(),
                    'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                    'subtotal': float(invoice.subtotal),
                    'discount': float(invoice.discount),
                    'tax': float(invoice.tax),
                    'total': float(invoice.total),
                    'paid_amount': float(invoice.paid_amount),
                    'remaining': float(invoice.remaining_amount),
                    'status': invoice.status,
                    'status_display': invoice.get_status_display(),
                    'items_count': invoice.items.count(),
                    'created_by': invoice.created_by.username if invoice.created_by else None,
                })
            
            # ✅ تفاصيل بنود الفواتير
            invoice_items = InvoiceItem.objects.filter(
                invoice__in=queryset
            ).select_related('product', 'invoice', 'invoice__customer')[:100]
            
            item_details = []
            for item in invoice_items:
                item_details.append({
                    'invoice_number': item.invoice.invoice_number,
                    'customer': item.invoice.customer.name,
                    'product': item.product.name,
                    'product_sku': item.product.sku,
                    'quantity': float(item.quantity),
                    'unit_price': float(item.unit_price),
                    'total': float(item.total),
                    'discount': float(item.discount),
                    'tax': float(item.tax),
                })
            
            # المبيعات اليومية
            daily_sales = queryset.annotate(
                sale_date=TruncDate('date')
            ).values('sale_date').annotate(
                total=Sum('total'),
                count=Count('id')
            ).order_by('-sale_date')[:30]
            
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
            
            # ✅ المبيعات حسب الشهر
            monthly_sales = queryset.annotate(
                month=TruncMonth('date')
            ).values('month').annotate(
                total=Sum('total'),
                count=Count('id')
            ).order_by('-month')[:12]
            
            monthly_data = []
            for item in monthly_sales:
                monthly_data.append({
                    'month': item['month'].strftime('%Y-%m') if item['month'] else None,
                    'total': float(item['total']),
                    'count': item['count'],
                })
            
            data = {
                'summary': {
                    'total_invoices': total_invoices,
                    'total_amount': float(total_amount),
                    'total_paid': float(total_paid),
                    'total_remaining': float(total_remaining),
                    'average_invoice': float(total_amount / total_invoices) if total_invoices > 0 else 0,
                },
                'invoice_details': invoice_details,
                'item_details': item_details,
                'daily_sales': daily_sales_list,
                'customer_sales': list(customer_sales),
                'product_sales': list(product_sales),
                'monthly_sales': monthly_data,
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
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def purchases(self, request):
        """تقرير المشتريات - مع التفاصيل الكاملة"""
        try:
            serializer = ReportFilterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            filters = serializer.validated_data
            queryset = PurchaseOrder.objects.all().select_related('supplier', 'warehouse', 'created_by')
            
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
            
            # ✅ تفاصيل أوامر الشراء
            order_details = []
            for order in queryset[:50]:
                order_details.append({
                    'id': str(order.id),
                    'order_number': order.order_number,
                    'supplier': order.supplier.name,
                    'warehouse': order.warehouse.name,
                    'order_date': order.order_date.isoformat(),
                    'expected_date': order.expected_date.isoformat() if order.expected_date else None,
                    'received_date': order.received_date.isoformat() if order.received_date else None,
                    'status': order.status,
                    'status_display': order.get_status_display(),
                    'subtotal': float(order.subtotal),
                    'discount': float(order.discount),
                    'tax': float(order.tax),
                    'total': float(order.total),
                    'items_count': order.items.count(),
                    'created_by': order.created_by.username if order.created_by else None,
                })
            
            # ✅ تفاصيل بنود المشتريات
            purchase_items = PurchaseItem.objects.filter(
                order__in=queryset
            ).select_related('product', 'order', 'order__supplier')[:100]
            
            item_details = []
            for item in purchase_items:
                item_details.append({
                    'order_number': item.order.order_number,
                    'supplier': item.order.supplier.name,
                    'product': item.product.name,
                    'product_sku': item.product.sku,
                    'quantity': float(item.quantity),
                    'unit_price': float(item.unit_price),
                    'total': float(item.total),
                    'discount': float(item.discount),
                    'tax': float(item.tax),
                    'received_quantity': float(item.received_quantity),
                    'remaining': float(item.quantity - item.received_quantity),
                })
            
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
            
            # ✅ المشتريات حسب الشهر
            monthly_purchases = queryset.annotate(
                month=TruncMonth('order_date')
            ).values('month').annotate(
                total=Sum('total'),
                count=Count('id')
            ).order_by('-month')[:12]
            
            monthly_data = []
            for item in monthly_purchases:
                monthly_data.append({
                    'month': item['month'].strftime('%Y-%m') if item['month'] else None,
                    'total': float(item['total']),
                    'count': item['count'],
                })
            
            data = {
                'summary': {
                    'total_orders': total_orders,
                    'total_amount': float(total_amount),
                    'average_order': float(total_amount / total_orders) if total_orders > 0 else 0,
                },
                'order_details': order_details,
                'item_details': item_details,
                'supplier_purchases': list(supplier_purchases),
                'product_purchases': list(product_purchases),
                'monthly_purchases': monthly_data,
            }
            
            prepared_filters = self._prepare_filters(filters)
            ReportLog.objects.create(
                report_type='purchases',
                title=f'تقرير المشتريات - {timezone.now().strftime("%Y-%m-%d")}',
                filters=prepared_filters,
                created_by=request.user
            )
            
            return Response(data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def inventory(self, request):
        """تقرير المخزون - مع التفاصيل الكاملة"""
        try:
            serializer = ReportFilterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            filters = serializer.validated_data
            queryset = Stock.objects.all().select_related('product', 'product__category', 'product__brand', 'warehouse')
            
            if filters.get('warehouse'):
                queryset = queryset.filter(warehouse_id=filters['warehouse'])
            if filters.get('category'):
                queryset = queryset.filter(product__category_id=filters['category'])
            if filters.get('brand'):
                queryset = queryset.filter(product__brand_id=filters['brand'])
            
            # إحصائيات عامة
            total_items = queryset.count()
            total_quantity = queryset.aggregate(Sum('quantity'))['quantity__sum'] or 0
            total_value = sum(float(stock.quantity * stock.product.purchase_price) for stock in queryset)
            
            # ✅ تفاصيل المخزون - جميع المنتجات مع كمياتها
            stock_details = []
            for stock in queryset[:100]:
                stock_details.append({
                    'product_id': str(stock.product.id),
                    'product_name': stock.product.name,
                    'product_sku': stock.product.sku,
                    'category': stock.product.category.name if stock.product.category else None,
                    'brand': stock.product.brand.name if stock.product.brand else None,
                    'warehouse': stock.warehouse.name,
                    'quantity': float(stock.quantity),
                    'min_quantity': float(stock.min_quantity),
                    'max_quantity': float(stock.max_quantity),
                    'purchase_price': float(stock.product.purchase_price),
                    'selling_price': float(stock.product.selling_price),
                    'total_value': float(stock.quantity * stock.product.purchase_price),
                })
            
            # ✅ المنتجات منخفضة المخزون
            low_stock = queryset.filter(quantity__lte=F('min_quantity')).values(
                'product__id', 'product__name', 'product__sku',
                'quantity', 'min_quantity'
            )[:20]
            
            # ✅ المنتجات الأعلى قيمة
            high_value = queryset.order_by('-quantity')[:20]
            high_value_data = [{
                'product_id': str(stock.product.id),
                'product_name': stock.product.name,
                'sku': stock.product.sku,
                'quantity': float(stock.quantity),
                'value': float(stock.quantity * stock.product.purchase_price)
            } for stock in high_value]
            
            # ✅ توزيع المخزون حسب الفئة
            category_distribution = queryset.values(
                'product__category__name'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_value=Sum(F('quantity') * F('product__purchase_price'))
            ).order_by('-total_value')
            
            # ✅ توزيع المخزون حسب العلامة التجارية
            brand_distribution = queryset.values(
                'product__brand__name'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_value=Sum(F('quantity') * F('product__purchase_price'))
            ).order_by('-total_value')
            
            # ✅ حركات المخزون الأخيرة
            recent_movements = StockMovement.objects.all().select_related(
                'product', 'warehouse', 'created_by'
            ).order_by('-created_at')[:30]
            
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
                    'average_value': float(total_value / total_items) if total_items > 0 else 0,
                },
                'stock_details': stock_details,
                'low_stock': list(low_stock),
                'high_value': high_value_data,
                'category_distribution': list(category_distribution),
                'brand_distribution': list(brand_distribution),
                'recent_movements': movement_data,
            }
            
            prepared_filters = self._prepare_filters(filters)
            ReportLog.objects.create(
                report_type='inventory',
                title=f'تقرير المخزون - {timezone.now().strftime("%Y-%m-%d")}',
                filters=prepared_filters,
                created_by=request.user
            )
            
            return Response(data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def profit_loss(self, request):
        """تقرير الأرباح والخسائر"""
        try:
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
            
            # حساب تكلفة البضاعة
            cost_of_goods = Decimal(0)
            product_costs = {}
            
            for invoice in queryset:
                for item in invoice.items.all():
                    cost = item.quantity * item.product.purchase_price
                    cost_of_goods += cost
                    
                    if item.product.name not in product_costs:
                        product_costs[item.product.name] = {
                            'revenue': Decimal(0),
                            'cost': Decimal(0),
                            'profit': Decimal(0),
                            'quantity': Decimal(0),
                        }
                    product_costs[item.product.name]['revenue'] += item.total
                    product_costs[item.product.name]['cost'] += cost
                    product_costs[item.product.name]['profit'] += item.total - cost
                    product_costs[item.product.name]['quantity'] += item.quantity
            
            gross_profit = total_revenue - cost_of_goods
            
            # ✅ تفاصيل المنتجات
            product_profit_list = []
            for name, data in product_costs.items():
                product_profit_list.append({
                    'product': name,
                    'quantity': float(data['quantity']),
                    'revenue': float(data['revenue']),
                    'cost': float(data['cost']),
                    'profit': float(data['profit']),
                    'margin': float((data['profit'] / data['revenue'] * 100)) if data['revenue'] > 0 else 0,
                })
            product_profit_list.sort(key=lambda x: x['profit'], reverse=True)
            
            data = {
                'summary': {
                    'total_revenue': float(total_revenue),
                    'cost_of_goods': float(cost_of_goods),
                    'gross_profit': float(gross_profit),
                    'profit_margin': float(gross_profit / total_revenue * 100) if total_revenue > 0 else 0,
                    'invoice_count': queryset.count(),
                },
                'product_profits': product_profit_list[:20],
            }
            
            prepared_filters = self._prepare_filters(filters)
            ReportLog.objects.create(
                report_type='profit_loss',
                title=f'تقرير الأرباح والخسائر - {timezone.now().strftime("%Y-%m-%d")}',
                filters=prepared_filters,
                created_by=request.user
            )
            
            return Response(data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def customers(self, request):
        """تقرير العملاء - مع التفاصيل"""
        try:
            serializer = ReportFilterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            filters = serializer.validated_data
            queryset = Customer.objects.filter(is_active=True)
            
            total_customers = queryset.count()
            vip_customers = queryset.filter(is_vip=True).count()
            
            # ✅ تفاصيل العملاء
            customer_details = []
            for customer in queryset[:50]:
                customer_details.append({
                    'id': str(customer.id),
                    'name': customer.name,
                    'phone': customer.phone,
                    'email': customer.email,
                    'address': customer.address,
                    'balance': float(customer.balance),
                    'is_vip': customer.is_vip,
                    'total_purchases': float(customer.total_purchases or 0),
                    'total_invoices': customer.total_invoices,
                    'outstanding_balance': float(customer.outstanding_balance or 0),
                })
            
            # أفضل العملاء
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
                'customer_details': customer_details,
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
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def suppliers(self, request):
        """تقرير الموردين - مع التفاصيل"""
        try:
            serializer = ReportFilterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            filters = serializer.validated_data
            queryset = Supplier.objects.filter(is_active=True)
            
            total_suppliers = queryset.count()
            
            # ✅ تفاصيل الموردين
            supplier_details = []
            for supplier in queryset[:50]:
                supplier_details.append({
                    'id': str(supplier.id),
                    'name': supplier.name,
                    'phone': supplier.phone,
                    'email': supplier.email,
                    'address': supplier.address,
                    'balance': float(supplier.balance),
                    'total_purchases': float(supplier.total_purchases or 0),
                    'order_count': supplier.orders.count(),
                })
            
            # أفضل الموردين
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
                'supplier_details': supplier_details,
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
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """جلب سجل التقارير"""
        queryset = ReportLog.objects.all().select_related('created_by')
        serializer = ReportLogSerializer(queryset[:50], many=True)
        return Response(serializer.data)