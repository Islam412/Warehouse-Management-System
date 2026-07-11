"""
فحص التحصيلات المستحقة من العملاء
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from sales.models import Invoice
from customers.models import Customer
from notifications.models import Notification
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class Command(BaseCommand):
    help = 'فحص التحصيلات المستحقة من العملاء'

    def handle(self, *args, **options):
        self.stdout.write('🔍 جاري فحص التحصيلات المستحقة من العملاء...')
        
        # ✅ الحصول على جميع المستخدمين المشرفين
        admins = User.objects.filter(is_superuser=True)
        
        if not admins.exists():
            self.stdout.write('❌ لا يوجد مستخدم مشرف')
            return

        today = timezone.now().date()
        created_count = 0
        threshold_days = getattr(settings, 'NOTIFICATION_COLLECTION_THRESHOLD_DAYS', 3)

        # ============================================
        # 1. الفواتير المستحقة (قبل 3 أيام)
        # ============================================
        due_invoices = Invoice.objects.filter(
            status__in=['confirmed', 'partially_paid'],
            due_date__isnull=False,
            due_date__gte=today,
            due_date__lte=today + timedelta(days=threshold_days),
            remaining_amount__gt=0
        ).select_related('customer')
        
        for invoice in due_invoices:
            days_left = (invoice.due_date - today).days
            
            # ✅ إرسال إشعار لجميع المشرفين
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Invoice',
                    reference_id=invoice.id,
                    notification_type='collection_due',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    priority = 'urgent' if days_left <= 1 else 'high' if days_left <= 2 else 'medium'
                    
                    Notification.objects.create(
                        title=f'💰 موعد تحصيل من {invoice.customer.name}',
                        message=f'يوجد مبلغ {invoice.remaining_amount} ج.م مستحق من العميل {invoice.customer.name} خلال {days_left} أيام',
                        notification_type='collection_due',
                        priority=priority,
                        user=admin,
                        due_date=invoice.due_date,
                        reference_type='Invoice',
                        reference_id=invoice.id,
                        extra_data={
                            'invoice_number': invoice.invoice_number,
                            'customer': invoice.customer.name,
                            'customer_phone': invoice.customer.phone,
                            'remaining_amount': float(invoice.remaining_amount),
                            'due_date': str(invoice.due_date),
                            'days_left': days_left,
                            'total': float(invoice.total),
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Collection due: {invoice.customer.name} - {invoice.remaining_amount} ج.م')

        # ============================================
        # 2. الفواتير المتأخرة (تجاوزت تاريخ الاستحقاق)
        # ============================================
        overdue_invoices = Invoice.objects.filter(
            status__in=['confirmed', 'partially_paid'],
            due_date__isnull=False,
            due_date__lt=today,
            remaining_amount__gt=0
        ).select_related('customer')
        
        for invoice in overdue_invoices:
            days_overdue = (today - invoice.due_date).days
            
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Invoice',
                    reference_id=invoice.id,
                    notification_type='collection_due',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    priority = 'urgent' if days_overdue > 7 or invoice.remaining_amount > 1000 else 'high'
                    
                    Notification.objects.create(
                        title=f'⚠️ فاتورة متأخرة: {invoice.invoice_number}',
                        message=f'فاتورة {invoice.invoice_number} للعميل {invoice.customer.name} متأخرة {days_overdue} يوم. المبلغ المستحق: {invoice.remaining_amount} ج.م',
                        notification_type='collection_due',
                        priority=priority,
                        user=admin,
                        due_date=invoice.due_date,
                        reference_type='Invoice',
                        reference_id=invoice.id,
                        extra_data={
                            'invoice_number': invoice.invoice_number,
                            'customer': invoice.customer.name,
                            'customer_phone': invoice.customer.phone,
                            'remaining_amount': float(invoice.remaining_amount),
                            'due_date': str(invoice.due_date),
                            'days_overdue': days_overdue,
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  ⚠️ Overdue invoice: {invoice.invoice_number} - {days_overdue} يوم')

        # ============================================
        # 3. العملاء الذين لديهم رصيد كبير (تنبيه مسبق)
        # ============================================
        high_balance_customers = Customer.objects.filter(
            is_active=True,
            balance__lt=-1000
        )
        
        for customer in high_balance_customers:
            for admin in admins:
                existing = Notification.objects.filter(
                    reference_type='Customer',
                    reference_id=customer.id,
                    notification_type='collection_due',
                    created_at__date=today,
                    user=admin
                )
                
                if not existing.exists():
                    Notification.objects.create(
                        title=f'💳 مديونية كبيرة للعميل {customer.name}',
                        message=f'العميل {customer.name} لديه مديونية {abs(customer.balance)} ج.م. يرجى متابعة التحصيل.',
                        notification_type='collection_due',
                        priority='high',
                        user=admin,
                        reference_type='Customer',
                        reference_id=customer.id,
                        extra_data={
                            'customer': customer.name,
                            'customer_phone': customer.phone,
                            'balance': float(customer.balance),
                        }
                    )
                    created_count += 1
                    self.stdout.write(f'  💳 High balance customer: {customer.name} - {customer.balance} ج.م')

        self.stdout.write(f'✅ تم إنشاء {created_count} إشعار(إشعارات) للتحصيلات')