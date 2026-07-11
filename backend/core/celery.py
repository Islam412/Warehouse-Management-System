"""
إعداد Celery للمشروع
"""

import os
from celery import Celery
from celery.schedules import crontab

# تعيين إعدادات Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# تحميل الإعدادات من Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# اكتشاف المهام من جميع التطبيقات
app.autodiscover_tasks()

# ============================================
# جدولة المهام (Celery Beat)
# ============================================
app.conf.beat_schedule = {
    # فحص المخزون كل ساعة (الأكثر أهمية)
    'check-stock-every-hour': {
        'task': 'notifications.tasks.check_stock',
        'schedule': crontab(minute=0),  # كل ساعة عند الدقيقة 0
    },
    # فحص الشحنات كل 6 ساعات
    'check-shipments-every-6-hours': {
        'task': 'notifications.tasks.check_shipments',
        'schedule': crontab(minute=0, hour='*/6'),  # كل 6 ساعات
    },
    # فحص التحصيلات كل 6 ساعات
    'check-collections-every-6-hours': {
        'task': 'notifications.tasks.check_collections',
        'schedule': crontab(minute=30, hour='*/6'),  # كل 6 ساعات
    },
    # فحص المدفوعات كل 6 ساعات
    'check-payments-every-6-hours': {
        'task': 'notifications.tasks.check_payments',
        'schedule': crontab(minute=0, hour='*/6'),  # كل 6 ساعات
    },
    # تشغيل جميع الفحوصات عند منتصف الليل
    'run-all-checks-at-midnight': {
        'task': 'notifications.tasks.run_all_checks',
        'schedule': crontab(minute=0, hour=0),  # منتصف الليل
    },
    # فحص التحصيلات عند الساعة 8 صباحاً
    'check-collections-at-8am': {
        'task': 'notifications.tasks.check_collections',
        'schedule': crontab(minute=0, hour=8),
    },
    # فحص المدفوعات عند الساعة 9 صباحاً
    'check-payments-at-9am': {
        'task': 'notifications.tasks.check_payments',
        'schedule': crontab(minute=0, hour=9),
    },
}

@app.task(bind=True)
def debug_task(self):
    """مهمة تصحيح للتأكد من عمل Celery"""
    print(f'Request: {self.request!r}')