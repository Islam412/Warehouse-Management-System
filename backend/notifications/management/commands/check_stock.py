"""
فحص المخزون وإنشاء إشعارات للمنتجات المنخفضة والنافدة
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models
from inventory.models import Stock
from notifications.models import Notification
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class Command(BaseCommand):
    help = 'فحص المخزون وإرسال إشعارات للمنتجات المنخفضة والنافدة'

    def handle(self, *args, **options):
        self.stdout.write('🔍 جاري فحص المخزون...')
        
        # ✅ الحصول على جميع المستخدمين المشرفين
        admins = User.objects.filter(is_superuser=True)
        
        if not admins.exists():
            self.stdout.write('❌ لا يوجد مستخدم مشرف')
            return

        created_count = 0
        threshold_days = getattr(settings, 'NOTIFICATION_STOCK_THRESHOLD_DAYS', 3)

        # ============================================
        # 1. المنتجات التي أوشكت على النفاذ
        # ============================================
        low_stock_items = Stock.objects.filter(
            quantity__lte=models.F('min_quantity'),
            quantity__gt=0
        ).select_related('product', 'warehouse')
        
        for stock in low_stock_items:
            days_left = int(stock.quantity / 2) if stock.quantity > 0 else 0
            
            # ✅ إرسال إشعار لجميع المشرفين
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Product',
                    reference_id=stock.product.id,
                    notification_type='stock_alert',
                    created_at__date=timezone.now().date(),
                    user=admin
                )
                
                if not existing.exists():
                    priority = 'urgent' if stock.quantity <= stock.min_quantity / 2 else 'high'
                    
                    Notification.objects.create(
                        title=f'⚠️ مخزون منخفض: {stock.product.name}',
                        message=f'الكمية المتبقية: {stock.quantity} (الحد الأدنى: {stock.min_quantity}) - ينفذ خلال {days_left} يوم في مخزن {stock.warehouse.name}',
                        notification_type='stock_alert',
                        priority=priority,
                        user=admin,
                        reference_type='Product',
                        reference_id=stock.product.id,
                        extra_data={
                            'product_id': str(stock.product.id),
                            'product_name': stock.product.name,
                            'sku': stock.product.sku,
                            'quantity': float(stock.quantity),
                            'min_quantity': float(stock.min_quantity),
                            'warehouse': stock.warehouse.name,
                            'days_left': days_left,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Stock alert: {stock.product.name} - {stock.quantity}')

        # ============================================
        # 2. المنتجات التي نفدت تماماً
        # ============================================
        out_of_stock = Stock.objects.filter(
            quantity=0
        ).select_related('product', 'warehouse')
        
        for stock in out_of_stock:
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Product',
                    reference_id=stock.product.id,
                    notification_type='stock_alert',
                    created_at__date=timezone.now().date(),
                    user=admin
                )
                
                if not existing.exists():
                    Notification.objects.create(
                        title=f'❌ نفد المنتج: {stock.product.name}',
                        message=f'المنتج {stock.product.name} نفد تماماً من مخزن {stock.warehouse.name}. يرجى إعادة الطلب فوراً.',
                        notification_type='stock_alert',
                        priority='urgent',
                        user=admin,
                        reference_type='Product',
                        reference_id=stock.product.id,
                        extra_data={
                            'product_id': str(stock.product.id),
                            'product_name': stock.product.name,
                            'sku': stock.product.sku,
                            'warehouse': stock.warehouse.name,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Out of stock: {stock.product.name}')

        # ============================================
        # 3. المنتجات التي تجاوزت الحد الأقصى (مخزون زائد)
        # ============================================
        over_stock = Stock.objects.filter(
            max_quantity__gt=0,
            quantity__gt=models.F('max_quantity')
        ).select_related('product', 'warehouse')
        
        for stock in over_stock:
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Product',
                    reference_id=stock.product.id,
                    notification_type='warning',
                    created_at__date=timezone.now().date(),
                    user=admin
                )
                
                if not existing.exists():
                    Notification.objects.create(
                        title=f'📦 مخزون زائد: {stock.product.name}',
                        message=f'الكمية: {stock.quantity} (الحد الأقصى: {stock.max_quantity}) في مخزن {stock.warehouse.name}',
                        notification_type='warning',
                        priority='low',
                        user=admin,
                        reference_type='Product',
                        reference_id=stock.product.id,
                        extra_data={
                            'product_id': str(stock.product.id),
                            'product_name': stock.product.name,
                            'sku': stock.product.sku,
                            'quantity': float(stock.quantity),
                            'max_quantity': float(stock.max_quantity),
                            'warehouse': stock.warehouse.name,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Over stock: {stock.product.name} - {stock.quantity}')

        self.stdout.write(f'✅ تم إنشاء {created_count} إشعار(إشعارات) للمخزون')