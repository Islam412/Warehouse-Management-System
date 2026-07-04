"""
اختبارات تطبيق الإشعارات
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timedelta
from notifications.models import Notification, NotificationPreference, NotificationLog

User = get_user_model()

class NotificationModelTest(TestCase):
    """اختبارات نموذج الإشعار"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.notification = Notification.objects.create(
            title='إشعار تجريبي',
            message='هذا إشعار تجريبي للاختبار',
            notification_type='info',
            user=self.user,
            link='/dashboard/'
        )
    
    def test_create_notification(self):
        """اختبار إنشاء إشعار"""
        self.assertEqual(self.notification.title, 'إشعار تجريبي')
        self.assertEqual(self.notification.user, self.user)
        self.assertFalse(self.notification.is_read)
        self.assertFalse(self.notification.is_sent)
    
    def test_notification_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('إشعار تجريبي', str(self.notification))
    
    def test_mark_as_read(self):
        """اختبار تحديد الإشعار كمقروء"""
        self.notification.mark_as_read()
        self.assertTrue(self.notification.is_read)
        self.assertIsNotNone(self.notification.read_at)
    
    def test_mark_as_sent(self):
        """اختبار تحديد الإشعار كمرسل"""
        self.notification.mark_as_sent()
        self.assertTrue(self.notification.is_sent)
        self.assertIsNotNone(self.notification.sent_at)

class NotificationPreferenceModelTest(TestCase):
    """اختبارات نموذج تفضيلات الإشعارات"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.preference = NotificationPreference.objects.create(
            user=self.user,
            enable_notifications=True,
            enable_email=True,
            enable_push=True,
            stock_alert=True,
            payment_due=True
        )
    
    def test_create_preference(self):
        """اختبار إنشاء تفضيلات"""
        self.assertEqual(self.preference.user, self.user)
        self.assertTrue(self.preference.enable_notifications)
        self.assertTrue(self.preference.stock_alert)
    
    def test_preference_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('testuser', str(self.preference))
    
    def test_preference_auto_create(self):
        """اختبار إنشاء تفضيلات تلقائياً"""
        new_user = User.objects.create_user(
            email='new@example.com',
            username='newuser',
            password='testpass'
        )
        # يجب أن يتم إنشاء التفضيلات تلقائياً عند الطلب
        preference, created = NotificationPreference.objects.get_or_create(user=new_user)
        self.assertTrue(created)
        self.assertTrue(preference.enable_notifications)

class NotificationLogModelTest(TestCase):
    """اختبارات نموذج سجل الإشعارات"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass'
        )
        self.notification = Notification.objects.create(
            title='إشعار تجريبي',
            message='هذا إشعار تجريبي',
            user=self.user
        )
        self.log = NotificationLog.objects.create(
            notification=self.notification,
            channel='email',
            status='pending'
        )
    
    def test_create_log(self):
        """اختبار إنشاء سجل إشعار"""
        self.assertEqual(self.log.notification, self.notification)
        self.assertEqual(self.log.channel, 'email')
        self.assertEqual(self.log.status, 'pending')
    
    def test_log_str(self):
        """اختبار طريقة __str__"""
        self.assertIn('إشعار تجريبي', str(self.log))

class NotificationsAPITest(TestCase):
    """اختبارات واجهات API للإشعارات"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # إنشاء بعض الإشعارات
        self.notification1 = Notification.objects.create(
            title='إشعار 1',
            message='رسالة الإشعار الأول',
            notification_type='info',
            user=self.user
        )
        self.notification2 = Notification.objects.create(
            title='إشعار 2',
            message='رسالة الإشعار الثاني',
            notification_type='warning',
            user=self.user,
            is_read=True
        )
        self.notification3 = Notification.objects.create(
            title='إشعار 3',
            message='رسالة الإشعار الثالث',
            notification_type='success',
            user=self.user
        )
    
    def test_list_notifications(self):
        """اختبار جلب قائمة الإشعارات"""
        response = self.client.get('/api/v1/notifications/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 3)
    
    def test_create_notification(self):
        """اختبار إنشاء إشعار جديد"""
        data = {
            'title': 'إشعار جديد',
            'message': 'هذا إشعار تم إنشاؤه عبر API',
            'notification_type': 'info',
            'link': '/test/'
        }
        response = self.client.post('/api/v1/notifications/api/notifications/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'إشعار جديد')
    
    def test_get_notification_detail(self):
        """اختبار جلب تفاصيل إشعار"""
        response = self.client.get(f'/api/v1/notifications/api/notifications/{self.notification1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'إشعار 1')
    
    def test_update_notification(self):
        """اختبار تحديث إشعار"""
        data = {'title': 'إشعار محدث'}
        response = self.client.patch(f'/api/v1/notifications/api/notifications/{self.notification1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'إشعار محدث')
    
    def test_delete_notification(self):
        """اختبار حذف إشعار"""
        response = self.client.delete(f'/api/v1/notifications/api/notifications/{self.notification1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_mark_read(self):
        """اختبار تحديد إشعار كمقروء"""
        response = self.client.post(f'/api/v1/notifications/api/notifications/{self.notification1.id}/mark_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification1.refresh_from_db()
        self.assertTrue(self.notification1.is_read)
    
    def test_mark_all_read(self):
        """اختبار تحديد جميع الإشعارات كمقروءة"""
        response = self.client.post('/api/v1/notifications/api/notifications/mark_all_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unread_count = Notification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)
    
    def test_unread_count(self):
        """اختبار عدد الإشعارات غير المقروءة"""
        response = self.client.get('/api/v1/notifications/api/notifications/unread_count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # notification1 و notification3 غير مقروءة = 2
        self.assertEqual(response.data['unread_count'], 2)
    
    def test_recent_notifications(self):
        """اختبار جلب آخر الإشعارات"""
        response = self.client.get('/api/v1/notifications/api/notifications/recent/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_filter_by_type(self):
        """اختبار فلترة الإشعارات حسب النوع"""
        response = self.client.get('/api/v1/notifications/api/notifications/?notification_type=warning')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for notification in response.data:
            self.assertEqual(notification['notification_type'], 'warning')
    
    def test_filter_by_read_status(self):
        """اختبار فلترة الإشعارات حسب حالة القراءة"""
        response = self.client.get('/api/v1/notifications/api/notifications/?is_read=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for notification in response.data:
            self.assertTrue(notification['is_read'])
    
    def test_search_notifications(self):
        """اختبار البحث في الإشعارات"""
        response = self.client.get('/api/v1/notifications/api/notifications/?search=الأول')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

class NotificationPreferencesAPITest(TestCase):
    """اختبارات واجهات API لتفضيلات الإشعارات"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # إنشاء تفضيلات
        self.preference = NotificationPreference.objects.create(
            user=self.user,
            enable_notifications=True,
            enable_email=True,
            enable_push=False,
            stock_alert=True,
            payment_due=False
        )
    
    def test_get_preferences(self):
        """اختبار جلب تفضيلات الإشعارات"""
        response = self.client.get('/api/v1/notifications/api/preferences/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['enable_notifications'])
        self.assertTrue(response.data['enable_email'])
        self.assertFalse(response.data['enable_push'])
    
    def test_update_preferences(self):
        """اختبار تحديث تفضيلات الإشعارات"""
        data = {
            'enable_notifications': False,
            'enable_email': False,
            'enable_push': True,
            'stock_alert': False,
            'payment_due': True
        }
        response = self.client.put('/api/v1/notifications/api/preferences/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['enable_notifications'])
        self.assertFalse(response.data['enable_email'])
        self.assertTrue(response.data['enable_push'])
        self.assertFalse(response.data['stock_alert'])
        self.assertTrue(response.data['payment_due'])
    
    def test_partial_update_preferences(self):
        """اختبار تحديث جزئي لتفضيلات الإشعارات"""
        data = {'enable_push': True}
        response = self.client.patch('/api/v1/notifications/api/preferences/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['enable_push'])

class NotificationLogsAPITest(TestCase):
    """اختبارات واجهات API لسجل الإشعارات"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.notification = Notification.objects.create(
            title='إشعار مع سجل',
            message='هذا إشعار مع سجل',
            user=self.user
        )
        self.log = NotificationLog.objects.create(
            notification=self.notification,
            channel='email',
            status='sent'
        )
    
    def test_list_logs(self):
        """اختبار جلب سجل الإشعارات"""
        response = self.client.get('/api/v1/notifications/api/logs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_filter_logs_by_channel(self):
        """اختبار فلترة سجل الإشعارات حسب القناة"""
        response = self.client.get('/api/v1/notifications/api/logs/?channel=email')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for log in response.data:
            self.assertEqual(log['channel'], 'email')
    
    def test_filter_logs_by_status(self):
        """اختبار فلترة سجل الإشعارات حسب الحالة"""
        response = self.client.get('/api/v1/notifications/api/logs/?status=sent')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for log in response.data:
            self.assertEqual(log['status'], 'sent')
