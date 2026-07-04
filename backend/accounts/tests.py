"""
اختبارات تطبيق accounts
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import Profile
from accounts.serializers import UserSerializer, LoginSerializer

User = get_user_model()

# ============== اختبارات النماذج ==============
class UserModelTest(TestCase):
    """اختبارات نموذج المستخدم"""
    
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)
    
    def test_create_user(self):
        """اختبار إنشاء مستخدم جديد"""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.username, 'testuser')
        self.assertTrue(self.user.check_password('testpass123'))
        self.assertTrue(self.user.is_active)
    
    def test_create_superuser(self):
        """اختبار إنشاء مستخدم مشرف"""
        admin_user = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='adminpass123'
        )
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_staff)
    
    def test_user_str_method(self):
        """اختبار طريقة __str__"""
        self.assertEqual(str(self.user), 'testuser')
    
    def test_user_email_unique(self):
        """اختبار أن البريد الإلكتروني فريد"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='test@example.com',
                username='testuser2',
                password='pass123'
            )

class ProfileModelTest(TestCase):
    """اختبارات نموذج الملف الشخصي"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='profile@example.com',
            username='profileuser',
            password='pass123'
        )
        self.profile = Profile.objects.get(user=self.user)
    
    def test_profile_created_automatically(self):
        """اختبار إنشاء الملف الشخصي تلقائياً"""
        self.assertIsNotNone(self.profile)
        self.assertEqual(self.profile.user, self.user)
    
    def test_profile_properties(self):
        """اختبار خصائص الملف الشخصي"""
        self.assertEqual(self.profile.full_name, 'profileuser')
        self.assertEqual(self.profile.email, 'profile@example.com')
        self.assertEqual(self.profile.username, 'profileuser')
    
    def test_profile_full_name(self):
        """اختبار الاسم الكامل"""
        self.user.first_name = 'Test'
        self.user.last_name = 'User'
        self.user.save()
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.full_name, 'Test User')

# ============== اختبارات السيريلايزر ==============
class UserSerializerTest(TestCase):
    """اختبارات سيريلايزر المستخدم"""
    
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_create_user_serializer(self):
        """اختبار إنشاء مستخدم عبر السيريلايزر"""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))

class LoginSerializerTest(TestCase):
    """اختبارات سيريلايزر تسجيل الدخول"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='login@example.com',
            username='loginuser',
            password='pass123'
        )
    
    def test_valid_login(self):
        """اختبار تسجيل الدخول الصحيح"""
        data = {'email': 'login@example.com', 'password': 'pass123'}
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['user'], self.user)
    
    def test_invalid_email(self):
        """اختبار بريد إلكتروني غير موجود"""
        data = {'email': 'wrong@example.com', 'password': 'pass123'}
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())

# ============== اختبارات واجهات API ==============
class AccountsAPITest(TestCase):
    """اختبارات واجهات API للحسابات"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.profile = Profile.objects.get(user=self.user)
        
        # الحصول على توكن JWT
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.token = response.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_login_api(self):
        """اختبار واجهة تسجيل الدخول"""
        data = {'email': 'test@example.com', 'password': 'testpass123'}
        response = self.client.post('/api/v1/auth/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_login_invalid_credentials(self):
        """اختبار تسجيل الدخول ببيانات خاطئة"""
        data = {'email': 'test@example.com', 'password': 'wrongpass'}
        response = self.client.post('/api/v1/auth/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_my_account(self):
        """اختبار جلب حسابي"""
        response = self.client.get('/api/v1/auth/api/account/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
    
    def test_get_my_profile(self):
        """اختبار جلب ملفي الشخصي"""
        response = self.client.get('/api/v1/auth/api/profile/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], self.user.id)
    
    def test_create_user(self):
        """اختبار إنشاء مستخدم جديد"""
        data = {
            'email': 'new@example.com',
            'username': 'newuser',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/v1/auth/api/create/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'new@example.com')
    
    def test_logout(self):
        """اختبار تسجيل الخروج"""
        login_response = self.client.post('/api/v1/auth/api/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        refresh_token = login_response.data.get('refresh')
        data = {'refresh': refresh_token}
        response = self.client.post('/api/v1/auth/api/logout/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
