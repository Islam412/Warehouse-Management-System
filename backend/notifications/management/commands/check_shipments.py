"""
فحص الشحنات وإنشاء إشعارات لمواعيد الاستلام والتسليم
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models
from datetime import timedelta
from purchases.models import PurchaseOrder
from notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'فحص الشحنات وإرسال إشعارات لمواعيد الاستلام والتسليم'

    def handle(self, *args, **options):
        self.stdout.write('🔍 جاري فحص الشحنات...')
        
        today = timezone.now().date()
        # ✅ الحصول على جميع المستخدمين المشرفين
        admins = User.objects.filter(is_superuser=True)
        
        if not admins.exists():
            self.stdout.write('❌ لا يوجد مستخدم مشرف')
            return

        created_count = 0

        # ============================================
        # 1. إشعارات موعد استلام الشحنة (قبل 3 أيام)
        # ============================================
        shipment_due = PurchaseOrder.objects.filter(
            status__in=['ordered', 'draft'],
            expected_date__isnull=False,
            expected_date__gte=today,
            expected_date__lte=today + timedelta(days=3),
        ).select_related('supplier')
        
        for order in shipment_due:
            days_left = (order.expected_date - today).days
            
            # ✅ إرسال إشعار لجميع المشرفين
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='PurchaseOrder',
                    reference_id=order.id,
                    notification_type='shipment_due',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    priority = 'urgent' if days_left <= 1 else 'high' if days_left <= 2 else 'medium'
                    
                    Notification.objects.create(
                        title=f'🚚 موعد استلام شحنة {order.order_number}',
                        message=f'شحنة من {order.supplier.name} ستصل خلال {days_left} أيام (تاريخ الاستلام: {order.expected_date})',
                        notification_type='shipment_due',
                        priority=priority,
                        user=admin,
                        due_date=order.expected_date,
                        reference_type='PurchaseOrder',
                        reference_id=order.id,
                        extra_data={
                            'order_number': order.order_number,
                            'supplier': order.supplier.name,
                            'expected_date': str(order.expected_date),
                            'days_left': days_left,
                            'total': float(order.total) if order.total else 0,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Shipment due: {order.order_number} - {days_left} أيام')

        # ============================================
        # 2. إشعارات تسليم الشحنة (عند الاستلام)
        # ============================================
        received_shipments = PurchaseOrder.objects.filter(
            status='received',
            received_date__date=today
        ).select_related('supplier')
        
        for order in received_shipments:
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='PurchaseOrder',
                    reference_id=order.id,
                    notification_type='shipment_received',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    Notification.objects.create(
                        title=f'✅ تم تسليم شحنة {order.order_number}',
                        message=f'تم تسليم شحنة {order.order_number} من {order.supplier.name} بنجاح',
                        notification_type='shipment_received',
                        priority='high',
                        user=admin,
                        due_date=order.received_date,
                        reference_type='PurchaseOrder',
                        reference_id=order.id,
                        extra_data={
                            'order_number': order.order_number,
                            'supplier': order.supplier.name,
                            'received_date': str(order.received_date),
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Shipment received: {order.order_number}')

        # ============================================
        # 3. الشحنات المتأخرة (تجاوزت تاريخ الاستلام)
        # ============================================
        overdue_shipments = PurchaseOrder.objects.filter(
            status__in=['ordered', 'draft'],
            expected_date__isnull=False,
            expected_date__lt=today,
        ).select_related('supplier')
        
        for order in overdue_shipments:
            days_overdue = (today - order.expected_date).days
            
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='PurchaseOrder',
                    reference_id=order.id,
                    notification_type='shipment_due',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    Notification.objects.create(
                        title=f'⚠️ شحنة متأخرة: {order.order_number}',
                        message=f'شحنة من {order.supplier.name} متأخرة {days_overdue} يوم. تاريخ الاستلام المتوقع: {order.expected_date}',
                        notification_type='shipment_due',
                        priority='urgent',
                        user=admin,
                        due_date=order.expected_date,
                        reference_type='PurchaseOrder',
                        reference_id=order.id,
                        extra_data={
                            'order_number': order.order_number,
                            'supplier': order.supplier.name,
                            'expected_date': str(order.expected_date),
                            'days_overdue': days_overdue,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ⚠️ Overdue shipment: {order.order_number} - {days_overdue} يوم')

        self.stdout.write(f'✅ تم إنشاء {created_count} إشعار(إشعارات) للشحنات')