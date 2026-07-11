"""
فحص المدفوعات المستحقة للموردين والشركات
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.db import models
from purchases.models import PurchaseOrder
from suppliers.models import Supplier
from notifications.models import Notification
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.conf import settings

User = get_user_model()


class Command(BaseCommand):
    help = 'فحص المدفوعات المستحقة للموردين والشركات'

    def handle(self, *args, **options):
        self.stdout.write('🔍 جاري فحص المدفوعات المستحقة...')
        
        # ✅ الحصول على جميع المستخدمين المشرفين
        admins = User.objects.filter(is_superuser=True)
        
        if not admins.exists():
            self.stdout.write('❌ لا يوجد مستخدم مشرف')
            return

        today = timezone.now().date()
        created_count = 0
        threshold_days = getattr(settings, 'NOTIFICATION_PAYMENT_THRESHOLD_DAYS', 7)

        # ============================================
        # 1. المدفوعات المستحقة للموردين (بناءً على الرصيد)
        # ============================================
        suppliers = Supplier.objects.filter(
            is_active=True,
            balance__gt=0  # الموردين الذين لديهم رصيد مستحق لهم
        )
        
        for supplier in suppliers:
            due_amount = supplier.balance
            
            if due_amount > 0:
                # ✅ إرسال إشعار لجميع المشرفين
                for admin in admins:
                    existing = Notification.objects.filter(
                        reference_type='Supplier',
                        reference_id=supplier.id,
                        notification_type='payment_due',
                        created_at__date=today,
                        user=admin
                    )
                    
                    if not existing.exists():
                        priority = 'urgent' if due_amount > 10000 else 'high' if due_amount > 5000 else 'medium'
                        
                        Notification.objects.create(
                            title=f'💵 موعد دفع للمورد {supplier.name}',
                            message=f'يوجد مبلغ {due_amount} ج.م مستحق الدفع للمورد {supplier.name}. الرجاء تسوية المستحقات.',
                            notification_type='payment_due',
                            priority=priority,
                            user=admin,
                            due_date=today + timedelta(days=threshold_days),
                            reference_type='Supplier',
                            reference_id=supplier.id,
                            extra_data={
                                'supplier': supplier.name,
                                'supplier_phone': supplier.phone,
                                'due_amount': float(due_amount),
                                'days_left': threshold_days,
                            }
                        )
                        created_count += 1
                        self.stdout.write(f'  ✅ Payment due: {supplier.name} - {due_amount} ج.م')

        # ============================================
        # 2. المدفوعات المستحقة للشركات الخارجية
        # ============================================
        external_companies = Supplier.objects.filter(
            is_active=True,
            balance__gt=0,
            name__icontains='شركة'
        )
        
        for company in external_companies:
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Supplier',
                    reference_id=company.id,
                    notification_type='payment_due',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    Notification.objects.create(
                        title=f'🏢 موعد دفع للشركة {company.name}',
                        message=f'يوجد مبلغ {company.balance} ج.م مستحق الدفع للشركة {company.name}',
                        notification_type='payment_due',
                        priority='medium',
                        user=admin,
                        due_date=today + timedelta(days=threshold_days),
                        reference_type='Supplier',
                        reference_id=company.id,
                        extra_data={
                            'supplier': company.name,
                            'due_amount': float(company.balance),
                            'days_left': threshold_days,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Company payment due: {company.name} - {company.balance} ج.م')

        # ============================================
        # 3. إشعارات المدفوعات المستحقة من المشتريات
        # ============================================
        for supplier in Supplier.objects.filter(is_active=True):
            total_purchases = PurchaseOrder.objects.filter(
                supplier=supplier,
                status='received'
            ).aggregate(total=models.Sum('total'))['total'] or Decimal(0)
            
            if total_purchases > 0:
                for admin in admins:
                    existing = Notification.objects.filter(
                        reference_type='Supplier',
                        reference_id=supplier.id,
                        notification_type='payment_due',
                        created_at__date=today,
                        user=admin
                    )
                    
                    if not existing.exists():
                        due_date = today + timedelta(days=threshold_days)
                        
                        Notification.objects.create(
                            title=f'💰 مستحقات المورد {supplier.name}',
                            message=f'إجمالي المشتريات المستحقة للمورد {supplier.name}: {total_purchases} ج.م',
                            notification_type='payment_due',
                            priority='medium',
                            user=admin,
                            due_date=due_date,
                            reference_type='Supplier',
                            reference_id=supplier.id,
                            extra_data={
                                'supplier': supplier.name,
                                'total_purchases': float(total_purchases),
                                'days_left': threshold_days,
                            }
                        )
                        created_count += 1
                        self.stdout.write(f'  ✅ Supplier purchases due: {supplier.name} - {total_purchases} ج.م')

        self.stdout.write(f'✅ تم إنشاء {created_count} إشعار(إشعارات) للمدفوعات')