"""
مهام Celery للإشعارات الذكية
"""

from celery import shared_task
from django.core.management import call_command
from django.utils import timezone
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def check_shipments():
    """فحص الشحنات كل 6 ساعات"""
    logger.info("🔍 Running check_shipments task...")
    try:
        call_command('check_shipments')
        logger.info("✅ check_shipments completed")
    except Exception as e:
        logger.error(f"❌ check_shipments failed: {e}")
        raise
    return "check_shipments completed"


@shared_task
def check_stock():
    """فحص المخزون كل ساعة"""
    logger.info("🔍 Running check_stock task...")
    try:
        call_command('check_stock')
        logger.info("✅ check_stock completed")
    except Exception as e:
        logger.error(f"❌ check_stock failed: {e}")
        raise
    return "check_stock completed"


@shared_task
def check_collections():
    """فحص التحصيلات كل 6 ساعات"""
    logger.info("🔍 Running check_collections task...")
    try:
        call_command('check_collections')
        logger.info("✅ check_collections completed")
    except Exception as e:
        logger.error(f"❌ check_collections failed: {e}")
        raise
    return "check_collections completed"


@shared_task
def check_payments():
    """فحص المدفوعات كل 6 ساعات"""
    logger.info("🔍 Running check_payments task...")
    try:
        call_command('check_payments')
        logger.info("✅ check_payments completed")
    except Exception as e:
        logger.error(f"❌ check_payments failed: {e}")
        raise
    return "check_payments completed"


@shared_task
def run_all_checks():
    """تشغيل جميع الفحوصات معاً"""
    logger.info("🔍 Running all checks...")
    
    # تشغيل جميع الفحوصات
    check_shipments.delay()
    check_stock.delay()
    check_collections.delay()
    check_payments.delay()
    
    logger.info("✅ All checks queued")
    return "All checks queued"


@shared_task
def send_notification_email(notification_id):
    """إرسال إشعار عبر البريد الإلكتروني"""
    from .models import Notification
    
    try:
        notification = Notification.objects.get(id=notification_id)
        # يمكن إضافة منطق إرسال البريد هنا
        # send_mail(notification.title, notification.message, ...)
        notification.mark_as_sent()
        logger.info(f"📧 Email sent for notification {notification_id}")
    except Notification.DoesNotExist:
        logger.error(f"❌ Notification {notification_id} not found")
    
    return f"Email sent for {notification_id}"


@shared_task
def send_push_notification(notification_id):
    """إرسال إشعار عبر التطبيق"""
    from .models import Notification
    
    try:
        notification = Notification.objects.get(id=notification_id)
        # يمكن إضافة منطق إرسال Push Notification هنا
        # push_service.send_message(...)
        notification.mark_as_sent()
        logger.info(f"📱 Push notification sent for {notification_id}")
    except Notification.DoesNotExist:
        logger.error(f"❌ Notification {notification_id} not found")
    
    return f"Push sent for {notification_id}"