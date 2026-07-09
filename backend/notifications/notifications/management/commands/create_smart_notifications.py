"""
سكربت لإنشاء إشعارات ذكية تلقائياً
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.db import models
from notifications.models import Notification
from sales.models import Invoice
from customers.models import Customer
from suppliers.models import Supplier
from inventory.models import Stock
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create smart notifications'

    def handle(self, *args, **options):
        self.stdout.write('🔔 Creating smart notifications...')
        
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            self.stdout.write('❌ No admin user found')
            return
        
        # 1. إشعارات الدفع المستحقة (للموردين)
        self.create_payment_due_notifications(admin)
        
        # 2. إشعارات التحصيل المستحقة (من العملاء)
        self.create_collection_due_notifications(admin)
        
        # 3. إشعارات الشحنات
        self.create_shipment_notifications(admin)
        
        # 4. إشعارات المخزون المنخفض
        self.create_stock_alert_notifications(admin)
        
        self.stdout.write(self.style.SUCCESS('✅ Smart notifications created successfully!'))
    
    def create_payment_due_notifications(self, user):
        """إشعارات الدفع المستحقة للموردين"""
        suppliers = Supplier.objects.filter(is_active=True, balance__gt=0)[:5]
        
        for supplier in suppliers:
            notification = Notification.objects.create(
                title=f'💰 موعد دفع مستحق للمورد {supplier.name}',
                message=f'يوجد مبلغ {supplier.balance} ج.م مستحق الدفع للمورد {supplier.name} خلال 3 أيام',
                notification_type='payment_due',
                priority='high',
                user=user,
                due_date=timezone.now() + timedelta(days=3),
                extra_data={
                    'supplier_id': str(supplier.id),
                    'amount': float(supplier.balance),
                    'days_left': 3,
                }
            )
            self.stdout.write(f'  ✅ Payment due: {supplier.name} - {supplier.balance} ج.م')
    
    def create_collection_due_notifications(self, user):
        """إشعارات التحصيل المستحقة من العملاء"""
        customers = Customer.objects.filter(is_active=True, balance__gt=0)[:5]
        
        for customer in customers:
            notification = Notification.objects.create(
                title=f'💵 موعد تحصيل من العميل {customer.name}',
                message=f'يوجد مبلغ {customer.balance} ج.م مستحق التحصيل من العميل {customer.name} خلال 5 أيام',
                notification_type='collection_due',
                priority='high',
                user=user,
                due_date=timezone.now() + timedelta(days=5),
                extra_data={
                    'customer_id': str(customer.id),
                    'amount': float(customer.balance),
                    'days_left': 5,
                }
            )
            self.stdout.write(f'  ✅ Collection due: {customer.name} - {customer.balance} ج.م')
    
    def create_shipment_notifications(self, user):
        """إشعارات الشحنات"""
        # محاكاة - في الحقيقة ستجيب من قاعدة البيانات
        shipments = [
            {'name': 'شحنة PO-001', 'supplier': 'مورد إسلام الأول', 'days': 2},
            {'name': 'شحنة PO-002', 'supplier': 'شركة النيل للتجارة', 'days': 5},
        ]
        
        for shipment in shipments:
            notification = Notification.objects.create(
                title=f'🚚 موعد استلام شحنة {shipment["name"]}',
                message=f'شحنة من {shipment["supplier"]} ستصل خلال {shipment["days"]} أيام',
                notification_type='shipment_due',
                priority='medium',
                user=user,
                due_date=timezone.now() + timedelta(days=shipment['days']),
                extra_data={
                    'shipment': shipment['name'],
                    'supplier': shipment['supplier'],
                    'days_left': shipment['days'],
                }
            )
            self.stdout.write(f'  ✅ Shipment: {shipment["name"]} - {shipment["days"]} أيام')
    
    def create_stock_alert_notifications(self, user):
        """إشعارات المخزون المنخفض"""
        low_stock_items = Stock.objects.filter(quantity__lte=models.F('min_quantity'))[:5]
        
        for stock in low_stock_items:
            notification = Notification.objects.create(
                title=f'⚠️ مخزون منخفض: {stock.product.name}',
                message=f'الكمية المتبقية: {stock.quantity} - الحد الأدنى: {stock.min_quantity}',
                notification_type='stock_alert',
                priority='urgent',
                user=user,
                extra_data={
                    'product_id': str(stock.product.id),
                    'product_name': stock.product.name,
                    'quantity': float(stock.quantity),
                    'min_quantity': float(stock.min_quantity),
                }
            )
            self.stdout.write(f'  ✅ Stock alert: {stock.product.name} - {stock.quantity}')
