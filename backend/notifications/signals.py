"""
إشارات تلقائية لإنشاء إشعارات عند حدوث أحداث مهمة
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from purchases.models import PurchaseOrder
from sales.models import Invoice, Payment
from inventory.models import Stock, StockMovement
from .models import Notification

User = get_user_model()


@receiver(post_save, sender=PurchaseOrder)
def create_purchase_order_notifications(sender, instance, created, **kwargs):
    """إنشاء إشعارات عند إنشاء أو تحديث طلبية شراء"""
    admin = User.objects.filter(is_superuser=True).first()
    
    if not admin:
        return
    
    # 1. عند إنشاء طلبية جديدة
    if created:
        Notification.objects.create(
            title=f'📦 طلبية شراء جديدة: {instance.order_number}',
            message=f'تم إنشاء طلبية شراء جديدة من {instance.supplier.name}. المبلغ الإجمالي: {instance.total} ج.م',
            notification_type='order_created',
            priority='medium',
            user=admin,
            due_date=instance.expected_date,
            reference_type='PurchaseOrder',
            reference_id=instance.id,
            extra_data={
                'order_number': instance.order_number,
                'supplier': instance.supplier.name,
                'total': float(instance.total),
                'status': instance.status,
            }
        )
    
    # 2. عند تغيير الحالة إلى 'received' (تم الاستلام)
    if instance.status == 'received' and instance.received_date:
        # التحقق من عدم وجود إشعار مسبق
        existing = Notification.objects.filter(
            reference_type='PurchaseOrder',
            reference_id=instance.id,
            notification_type='shipment_received'
        )
        
        if not existing.exists():
            Notification.objects.create(
                title=f'✅ تم استلام شحنة: {instance.order_number}',
                message=f'تم استلام طلبية الشراء {instance.order_number} من {instance.supplier.name} بنجاح. المبلغ الإجمالي: {instance.total} ج.م',
                notification_type='shipment_received',
                priority='high',
                user=admin,
                due_date=instance.received_date,
                reference_type='PurchaseOrder',
                reference_id=instance.id,
                extra_data={
                    'order_number': instance.order_number,
                    'supplier': instance.supplier.name,
                    'total': float(instance.total),
                    'received_date': str(instance.received_date),
                }
            )
    
    # 3. عند تغيير الحالة إلى 'cancelled' (ملغي)
    if instance.status == 'cancelled':
        Notification.objects.create(
            title=f'❌ تم إلغاء طلبية: {instance.order_number}',
            message=f'تم إلغاء طلبية الشراء {instance.order_number} من {instance.supplier.name}',
            notification_type='warning',
            priority='medium',
            user=admin,
            reference_type='PurchaseOrder',
            reference_id=instance.id,
            extra_data={
                'order_number': instance.order_number,
                'supplier': instance.supplier.name,
            }
        )


@receiver(post_save, sender=Invoice)
def create_invoice_notifications(sender, instance, created, **kwargs):
    """إنشاء إشعارات عند إنشاء أو تحديث فاتورة"""
    admin = User.objects.filter(is_superuser=True).first()
    
    if not admin:
        return
    
    # 1. عند إنشاء فاتورة جديدة
    if created and instance.status in ['confirmed', 'partially_paid']:
        Notification.objects.create(
            title=f'📄 فاتورة جديدة: {instance.invoice_number}',
            message=f'تم إنشاء فاتورة جديدة للعميل {instance.customer.name}. المبلغ الإجمالي: {instance.total} ج.م',
            notification_type='info',
            priority='medium',
            user=admin,
            due_date=instance.due_date,
            reference_type='Invoice',
            reference_id=instance.id,
            extra_data={
                'invoice_number': instance.invoice_number,
                'customer': instance.customer.name,
                'total': float(instance.total),
                'remaining': float(instance.remaining_amount),
                'status': instance.status,
            }
        )
    
    # 2. عند تغيير الحالة إلى 'paid' (مدفوعة)
    if instance.status == 'paid':
        existing = Notification.objects.filter(
            reference_type='Invoice',
            reference_id=instance.id,
            notification_type='success'
        )
        
        if not existing.exists():
            Notification.objects.create(
                title=f'✅ فاتورة مدفوعة: {instance.invoice_number}',
                message=f'تم دفع فاتورة {instance.invoice_number} للعميل {instance.customer.name} بالكامل',
                notification_type='success',
                priority='high',
                user=admin,
                reference_type='Invoice',
                reference_id=instance.id,
                extra_data={
                    'invoice_number': instance.invoice_number,
                    'customer': instance.customer.name,
                    'total': float(instance.total),
                    'paid_amount': float(instance.paid_amount),
                }
            )


@receiver(post_save, sender=Payment)
def create_payment_notification(sender, instance, created, **kwargs):
    """إنشاء إشعار عند إضافة دفعة جديدة"""
    if not created:
        return
    
    admin = User.objects.filter(is_superuser=True).first()
    
    if not admin:
        return
    
    invoice = instance.invoice
    
    Notification.objects.create(
        title=f'💰 دفعة جديدة على فاتورة {invoice.invoice_number}',
        message=f'تم استلام دفعة بقيمة {instance.amount} ج.م من العميل {invoice.customer.name}',
        notification_type='success',
        priority='medium',
        user=admin,
        reference_type='Payment',
        reference_id=instance.id,
        extra_data={
            'invoice_number': invoice.invoice_number,
            'customer': invoice.customer.name,
            'amount': float(instance.amount),
            'payment_method': instance.payment_method,
        }
    )


@receiver(post_save, sender=StockMovement)
def create_stock_movement_notification(sender, instance, created, **kwargs):
    """إنشاء إشعار عند حركة مخزون مهمة"""
    if not created:
        return
    
    admin = User.objects.filter(is_superuser=True).first()
    
    if not admin:
        return
    
    # فقط للحركات المهمة (نقص كبير في المخزون)
    if instance.movement_type == 'sale' and instance.quantity < -5:
        Notification.objects.create(
            title=f'📦 حركة مخزون: {instance.product.name}',
            message=f'تم بيع {abs(instance.quantity)} وحدة من {instance.product.name}. المخزون المتبقي: {instance.new_quantity}',
            notification_type='info',
            priority='low',
            user=admin,
            reference_type='StockMovement',
            reference_id=instance.id,
            extra_data={
                'product': instance.product.name,
                'quantity': float(instance.quantity),
                'new_quantity': float(instance.new_quantity),
                'movement_type': instance.movement_type,
            }
        )