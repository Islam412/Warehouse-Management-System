from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Q, F, Avg, Max, Min, OuterRef, Subquery, Value
from django.db.models.functions import TruncMonth, TruncDate, TruncDay, Coalesce
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
import calendar

from sales.models import Invoice, InvoiceItem, Payment, Return
from purchases.models import PurchaseOrder, PurchaseItem
from inventory.models import Stock, StockMovement
from products.models import Product, Category, Brand
from customers.models import Customer
from suppliers.models import Supplier
from finance.models import Expense, Income, DailyClosing, Account
from .models import DashboardWidget


class DashboardSummaryView(APIView):
    """لوحة التحكم - ملخص عام شامل"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)
        last_month = start_of_month - timedelta(days=1)
        last_month_start = last_month.replace(day=1)

        # ============================================
        # 1. المبيعات (Sales)
        # ============================================
        sales_today = Invoice.objects.filter(date__date=today)
        sales_week = Invoice.objects.filter(date__date__gte=start_of_week, date__date__lte=today)
        sales_month = Invoice.objects.filter(date__date__gte=start_of_month, date__date__lte=today)
        sales_last_month = Invoice.objects.filter(date__date__gte=last_month_start, date__date__lte=last_month)
        sales_year = Invoice.objects.filter(date__date__gte=start_of_year, date__date__lte=today)

        sales_stats = {
            'today': {
                'count': sales_today.count(),
                'total': float(sales_today.aggregate(total=Sum('total'))['total'] or 0),
            },
            'week': {
                'count': sales_week.count(),
                'total': float(sales_week.aggregate(total=Sum('total'))['total'] or 0),
            },
            'month': {
                'count': sales_month.count(),
                'total': float(sales_month.aggregate(total=Sum('total'))['total'] or 0),
            },
            'last_month': {
                'count': sales_last_month.count(),
                'total': float(sales_last_month.aggregate(total=Sum('total'))['total'] or 0),
            },
            'year': {
                'count': sales_year.count(),
                'total': float(sales_year.aggregate(total=Sum('total'))['total'] or 0),
            },
            'month_change': self._calculate_change(
                float(sales_last_month.aggregate(total=Sum('total'))['total'] or 0),
                float(sales_month.aggregate(total=Sum('total'))['total'] or 0)
            ),
        }

        # ============================================
        # 2. المشتريات (Purchases)
        # ============================================
        purchases_today = PurchaseOrder.objects.filter(order_date__date=today, status='received')
        purchases_month = PurchaseOrder.objects.filter(order_date__date__gte=start_of_month, status='received')
        purchases_last_month = PurchaseOrder.objects.filter(order_date__date__gte=last_month_start, order_date__date__lte=last_month, status='received')

        purchases_stats = {
            'today': {
                'count': purchases_today.count(),
                'total': float(purchases_today.aggregate(total=Sum('total'))['total'] or 0),
            },
            'month': {
                'count': purchases_month.count(),
                'total': float(purchases_month.aggregate(total=Sum('total'))['total'] or 0),
            },
            'last_month': {
                'count': purchases_last_month.count(),
                'total': float(purchases_last_month.aggregate(total=Sum('total'))['total'] or 0),
            },
            'month_change': self._calculate_change(
                float(purchases_last_month.aggregate(total=Sum('total'))['total'] or 0),
                float(purchases_month.aggregate(total=Sum('total'))['total'] or 0)
            ),
        }

        # ============================================
        # 3. المالية (Finance)
        # ============================================
        expenses_month = Expense.objects.filter(date__gte=start_of_month, date__lte=today)
        incomes_month = Income.objects.filter(date__gte=start_of_month, date__lte=today)
        expenses_year = Expense.objects.filter(date__gte=start_of_year, date__lte=today)
        incomes_year = Income.objects.filter(date__gte=start_of_year, date__lte=today)

        receivables = Invoice.objects.filter(
            status__in=['confirmed', 'partially_paid']
        ).aggregate(total=Sum('remaining_amount'))['total'] or 0

        payables = PurchaseOrder.objects.filter(
            status='received'
        ).aggregate(total=Sum('total'))['total'] or 0

        instalments_receivable = Invoice.objects.filter(
            status='partially_paid'
        ).aggregate(total=Sum('remaining_amount'))['total'] or 0

        instalments_payable = PurchaseOrder.objects.filter(
            status='received'
        ).exclude(total=0).aggregate(total=Sum('total'))['total'] or 0

        finance_stats = {
            'month': {
                'expenses': float(expenses_month.aggregate(total=Sum('amount'))['total'] or 0),
                'income': float(incomes_month.aggregate(total=Sum('amount'))['total'] or 0),
                'sales': sales_stats['month']['total'],
                'profit': sales_stats['month']['total'] + float(incomes_month.aggregate(total=Sum('amount'))['total'] or 0) - float(expenses_month.aggregate(total=Sum('amount'))['total'] or 0),
            },
            'year': {
                'expenses': float(expenses_year.aggregate(total=Sum('amount'))['total'] or 0),
                'income': float(incomes_year.aggregate(total=Sum('amount'))['total'] or 0),
                'sales': sales_stats['year']['total'],
                'profit': sales_stats['year']['total'] + float(incomes_year.aggregate(total=Sum('amount'))['total'] or 0) - float(expenses_year.aggregate(total=Sum('amount'))['total'] or 0),
            },
            'receivables': float(receivables),
            'payables': float(payables),
            'instalments_receivable': float(instalments_receivable),
            'instalments_payable': float(instalments_payable),
        }

        # ============================================
        # 4. المنتجات (Products)
        # ============================================
        top_products = InvoiceItem.objects.filter(
            invoice__date__date__gte=start_of_month
        ).values(
            'product__id', 'product__name', 'product__sku'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total'),
            avg_price=Avg('unit_price')
        ).order_by('-total_quantity')[:10]

        # ============================================
        # 5. حركات المخزون (Stock Movements)
        # ============================================
        stock_in = StockMovement.objects.filter(
            movement_type__in=['purchase', 'return_sale', 'opening'],
            created_at__date__gte=start_of_month
        ).aggregate(total=Sum('quantity'))['total'] or 0

        stock_out = StockMovement.objects.filter(
            movement_type__in=['sale', 'damage', 'adjustment'],
            created_at__date__gte=start_of_month
        ).aggregate(total=Sum('quantity'))['total'] or 0

        stock_return = StockMovement.objects.filter(
            movement_type='return_purchase',
            created_at__date__gte=start_of_month
        ).aggregate(total=Sum('quantity'))['total'] or 0

        stock_damage = StockMovement.objects.filter(
            movement_type='damage',
            created_at__date__gte=start_of_month
        ).aggregate(total=Sum('quantity'))['total'] or 0

        inventory_stats = {
            'total_products': Product.objects.filter(is_active=True).count(),
            'low_stock': Stock.objects.filter(quantity__lte=F('min_quantity')).count(),
            'out_of_stock': Stock.objects.filter(quantity=0).count(),
            'stock_in': float(stock_in or 0),
            'stock_out': float(stock_out or 0),
            'stock_return': float(stock_return or 0),
            'stock_damage': float(stock_damage or 0),
            'total_value': float(Stock.objects.aggregate(
                total=Sum(F('quantity') * F('product__purchase_price'))
            )['total'] or 0),
        }

        # ============================================
        # 6. العملاء (Customers) - ✅ مصحح
        # ============================================
        top_customers = Customer.objects.filter(
            is_active=True
        ).values(
            'id', 'name', 'phone', 'is_vip'
        ).annotate(
            total_purchases=Sum('invoices__total'),
            invoice_count=Count('invoices')
        ).order_by('-total_purchases')[:10]

        # حساب outstanding balance لكل عميل
        customer_ids = [c['id'] for c in top_customers]
        outstanding_balances = {}
        for customer in Customer.objects.filter(id__in=customer_ids):
            outstanding_balances[str(customer.id)] = float(customer.outstanding_balance or 0)

        customers_stats = {
            'total': Customer.objects.filter(is_active=True).count(),
            'vip': Customer.objects.filter(is_vip=True, is_active=True).count(),
            'top_customers': [
                {
                    'id': str(c['id']),
                    'name': c['name'],
                    'phone': c['phone'],
                    'total_purchases': float(c['total_purchases'] or 0),
                    'invoice_count': c['invoice_count'] or 0,
                    'outstanding': outstanding_balances.get(str(c['id']), 0),
                }
                for c in top_customers
            ],
        }

        # ============================================
        # 7. الموردين (Suppliers) - ✅ مصحح
        # ============================================
        top_suppliers = Supplier.objects.filter(
            is_active=True
        ).values(
            'id', 'name', 'phone'
        ).annotate(
            total_purchases=Sum('orders__total'),
            order_count=Count('orders')
        ).order_by('-total_purchases')[:10]

        suppliers_stats = {
            'total': Supplier.objects.filter(is_active=True).count(),
            'top_suppliers': [
                {
                    'id': str(s['id']),
                    'name': s['name'],
                    'phone': s['phone'],
                    'total_purchases': float(s['total_purchases'] or 0),
                    'order_count': s['order_count'] or 0,
                }
                for s in top_suppliers
            ],
        }

        # ============================================
        # 8. الفواتير المتأخرة
        # ============================================
        overdue_invoices = Invoice.objects.filter(
            status__in=['confirmed', 'partially_paid'],
            due_date__lt=today
        )

        overdue_stats = {
            'count': overdue_invoices.count(),
            'total': float(overdue_invoices.aggregate(total=Sum('remaining_amount'))['total'] or 0),
            'invoices': [
                {
                    'id': str(inv.id),
                    'invoice_number': inv.invoice_number,
                    'customer': inv.customer.name,
                    'remaining': float(inv.remaining_amount),
                    'due_date': inv.due_date.strftime('%Y-%m-%d'),
                    'days_overdue': (today - inv.due_date).days,
                }
                for inv in overdue_invoices[:20]
            ],
        }

        # ============================================
        # 9. المرتجعات والتالف
        # ============================================
        returns_stats = {
            'month': {
                'count': Return.objects.filter(created_at__date__gte=start_of_month).count(),
                'amount': float(Return.objects.filter(created_at__date__gte=start_of_month).aggregate(total=Sum('amount'))['total'] or 0),
            },
            'damage': {
                'count': StockMovement.objects.filter(movement_type='damage', created_at__date__gte=start_of_month).count(),
                'quantity': float(StockMovement.objects.filter(movement_type='damage', created_at__date__gte=start_of_month).aggregate(total=Sum('quantity'))['total'] or 0),
            },
        }

        # ============================================
        # 10. الرسوم البيانية (Charts)
        # ============================================
        daily_sales = []
        for i in range(30):
            date = today - timedelta(days=i)
            day_sales = Invoice.objects.filter(date__date=date).aggregate(total=Sum('total'))['total'] or 0
            daily_sales.append({
                'date': date.strftime('%Y-%m-%d'),
                'sales': float(day_sales),
            })
        daily_sales.reverse()

        sales_by_category = InvoiceItem.objects.filter(
            invoice__date__date__gte=start_of_month
        ).values(
            'product__category__name'
        ).annotate(
            total=Sum('total')
        ).order_by('-total')[:10]

        sales_by_brand = InvoiceItem.objects.filter(
            invoice__date__date__gte=start_of_month
        ).values(
            'product__brand__name'
        ).annotate(
            total=Sum('total')
        ).order_by('-total')[:10]

        # ============================================
        # تجهيز الاستجابة النهائية
        # ============================================
        data = {
            'sales': sales_stats,
            'purchases': purchases_stats,
            'finance': finance_stats,
            'inventory': inventory_stats,
            'customers': customers_stats,
            'suppliers': suppliers_stats,
            'overdue': overdue_stats,
            'returns': returns_stats,
            'charts': {
                'daily_sales': daily_sales,
                'sales_by_category': list(sales_by_category),
                'sales_by_brand': list(sales_by_brand),
            },
            'products': {
                'top': list(top_products),
            },
            'last_updated': timezone.now().isoformat(),
        }

        return Response(data)

    def _calculate_change(self, old_value, new_value):
        """حساب نسبة التغير بين قيمتين"""
        if old_value == 0:
            return 100 if new_value > 0 else 0
        return round(((new_value - old_value) / old_value) * 100, 2)


class DashboardSalesChartView(APIView):
    """الرسوم البيانية للمبيعات"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        
        today = timezone.now().date()
        
        if period == 'day':
            days = 1
        elif period == 'week':
            days = 7
        elif period == 'year':
            days = 365
        else:  # month
            days = 30
        
        start_date = today - timedelta(days=days - 1)
        
        # المبيعات اليومية
        daily_data = Invoice.objects.filter(
            date__date__gte=start_date,
            date__date__lte=today
        ).extra(
            select={'day': "DATE(date)"}
        ).values('day').annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('day')
        
        # تجهيز البيانات للرسم البياني
        dates = []
        sales_data = []
        
        current = start_date
        while current <= today:
            dates.append(current.strftime('%Y-%m-%d'))
            sales_data.append(0)
            current += timedelta(days=1)
        
        for item in daily_data:
            if item['day']:
                # التحقق من نوع القيمة
                if isinstance(item['day'], str):
                    day_str = item['day']
                else:
                    day_str = item['day'].strftime('%Y-%m-%d')
                
                if day_str in dates:
                    idx = dates.index(day_str)
                    sales_data[idx] = float(item['total'] or 0)
        
        return Response({
            'labels': dates,
            'sales': sales_data,
            'total': sum(sales_data),
            'average': sum(sales_data) / len(sales_data) if sales_data else 0,
            'period': period,
        })


class DashboardComparisonView(APIView):
    """مقارنة بين الفئات والعلامات التجارية"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        # مقارنة الفئات (Categories)
        categories_data = Category.objects.filter(
            is_active=True
        ).annotate(
            total_sales=Sum('products__sales_items__total'),
            total_quantity=Sum('products__sales_items__quantity'),
            product_count=Count('products'),
            avg_price=Avg('products__selling_price'),
        ).order_by('-total_sales')
        
        categories_comparison = [
            {
                'name': cat.name,
                'name_ar': cat.name_ar or cat.name,
                'total_sales': float(cat.total_sales or 0),
                'total_quantity': float(cat.total_quantity or 0),
                'product_count': cat.product_count or 0,
                'avg_price': float(cat.avg_price or 0),
            }
            for cat in categories_data[:10]
        ]
        
        # مقارنة العلامات التجارية (Brands)
        brands_data = Brand.objects.filter(
            is_active=True
        ).annotate(
            total_sales=Sum('products__sales_items__total'),
            total_quantity=Sum('products__sales_items__quantity'),
            product_count=Count('products'),
            avg_price=Avg('products__selling_price'),
        ).order_by('-total_sales')
        
        brands_comparison = [
            {
                'name': brand.name,
                'name_ar': brand.name_ar or brand.name,
                'total_sales': float(brand.total_sales or 0),
                'total_quantity': float(brand.total_quantity or 0),
                'product_count': brand.product_count or 0,
                'avg_price': float(brand.avg_price or 0),
            }
            for brand in brands_data[:10]
        ]
        
        # مقارنة الأسعار (Price Comparison)
        price_ranges = {
            'low': {'min': 0, 'max': 50, 'label': 'أقل من 50'},
            'medium': {'min': 50, 'max': 200, 'label': '50 - 200'},
            'high': {'min': 200, 'max': 500, 'label': '200 - 500'},
            'premium': {'min': 500, 'max': 1000000, 'label': 'أكثر من 500'},
        }
        
        price_comparison = []
        for key, range_data in price_ranges.items():
            products = Product.objects.filter(
                is_active=True,
                selling_price__gte=range_data['min'],
                selling_price__lt=range_data['max']
            )
            
            total_sales = InvoiceItem.objects.filter(
                product__in=products,
                invoice__date__date__gte=start_of_month
            ).aggregate(total=Sum('total'))['total'] or 0
            
            price_comparison.append({
                'range': range_data['label'],
                'product_count': products.count(),
                'total_sales': float(total_sales),
                'avg_price': float(products.aggregate(avg=Avg('selling_price'))['avg'] or 0),
            })
        
        # أفضل المنتجات حسب الطلب
        most_demanded = InvoiceItem.objects.filter(
            invoice__date__date__gte=start_of_month
        ).values(
            'product__id', 'product__name', 'product__sku',
            'product__category__name', 'product__brand__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total'),
            avg_price=Avg('unit_price')
        ).order_by('-total_quantity')[:20]
        
        return Response({
            'categories': categories_comparison,
            'brands': brands_comparison,
            'price_ranges': price_comparison,
            'most_demanded': [
                {
                    'id': str(item['product__id']),
                    'name': item['product__name'],
                    'sku': item['product__sku'],
                    'category': item['product__category__name'],
                    'brand': item['product__brand__name'],
                    'quantity': float(item['total_quantity'] or 0),
                    'revenue': float(item['total_revenue'] or 0),
                    'avg_price': float(item['avg_price'] or 0),
                }
                for item in most_demanded
            ],
        })


class DashboardWidgetsView(APIView):
    """إدارة عناصر لوحة التحكم"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        widgets = DashboardWidget.objects.filter(
            Q(user=request.user) | Q(user__isnull=True),
            is_active=True
        ).order_by('order')
        
        data = [
            {
                'id': str(w.id),
                'title': w.title,
                'widget_type': w.widget_type,
                'config': w.config,
                'order': w.order,
            }
            for w in widgets
        ]
        
        return Response(data)

    def post(self, request):
        """إنشاء عنصر جديد"""
        data = request.data
        widget = DashboardWidget.objects.create(
            user=request.user,
            title=data.get('title', 'عنصر جديد'),
            widget_type=data.get('widget_type', 'summary'),
            config=data.get('config', {}),
            order=data.get('order', 0),
        )
        
        return Response({
            'id': str(widget.id),
            'message': 'تم إنشاء العنصر بنجاح',
        }, status=status.HTTP_201_CREATED)

    def put(self, request, widget_id):
        """تحديث عنصر"""
        try:
            widget = DashboardWidget.objects.get(id=widget_id, user=request.user)
        except DashboardWidget.DoesNotExist:
            return Response(
                {'error': 'العنصر غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        if 'title' in data:
            widget.title = data['title']
        if 'config' in data:
            widget.config = data['config']
        if 'order' in data:
            widget.order = data['order']
        if 'is_active' in data:
            widget.is_active = data['is_active']
        widget.save()
        
        return Response({'message': 'تم تحديث العنصر بنجاح'})

    def delete(self, request, widget_id):
        """حذف عنصر"""
        try:
            widget = DashboardWidget.objects.get(id=widget_id, user=request.user)
            widget.delete()
            return Response({'message': 'تم حذف العنصر بنجاح'})
        except DashboardWidget.DoesNotExist:
            return Response(
                {'error': 'العنصر غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )