// frontend/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2, 
  Camera, 
  UserCircle,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Key,
  LogOut,
  RefreshCw,
  ShoppingCart,
  Package,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken, logout } from '@/lib/auth';

// دالة لتنسيق التاريخ
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'غير متوفر';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'غير متوفر';
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    username: '',
  });

  // جلب بيانات المستخدم
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getAccessToken();
      
      // جلب بيانات المستخدم
      const userResponse = await fetch('http://localhost:8000/api/v1/auth/api/account/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      setUser(userData);
      
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        username: userData.username || '',
      });
      
      // جلب البروفايل
      const profileRes = await fetch('http://localhost:8000/api/v1/auth/api/profile/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      setProfile(profileData);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('حدث خطأ في تحميل الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAccessToken();
      
      const [salesRes, productsRes, customersRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/sales/api/invoices/?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/v1/products/api/products/?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/v1/customers/api/customers/?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);
      
      const salesData = await salesRes.json();
      const productsData = await productsRes.json();
      const customersData = await customersRes.json();
      
      setStats({
        sales: Array.isArray(salesData) ? salesData.length : 
               salesData?.count || salesData?.results?.length || 0,
        products: Array.isArray(productsData) ? productsData.length : 
                  productsData?.count || productsData?.results?.length || 0,
        customers: Array.isArray(customersData) ? customersData.length : 
                   customersData?.count || customersData?.results?.length || 0,
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAccessToken();
      
      const response = await fetch(`http://localhost:8000/api/v1/auth/api/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
        })
      });
      
      if (response.ok) {
        toast.success('تم تحديث الملف الشخصي بنجاح');
        fetchProfile();
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'حدث خطأ في تحديث الملف الشخصي');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  // ✅ رفع الصورة الشخصية - المسار الصحيح من الـ URLs
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة صحيح');
      return;
    }

    setUploadingImage(true);
    
    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append('cover_images', file);

      // ✅ المسار الصحيح: profile/update/{id}/
      const response = await fetch(`http://localhost:8000/api/v1/auth/api/profile/update/${profile.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        toast.success('تم تحديث الصورة الشخصية بنجاح');
        fetchProfile();
      } else {
        const text = await response.text();
        console.error('Upload error response:', text);
        toast.error('حدث خطأ في رفع الصورة');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-gray-500">جاري تحميل الملف الشخصي...</span>
      </div>
    );
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || formData.username || 'مستخدم';
  const initials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '') || formData.username?.[0] || 'U';
  const isStaff = user?.is_staff || false;
  const isSuperuser = user?.is_superuser || false;
  const isActive = user?.is_active !== false;
  const phoneNumber = formData.phone || profile?.phone || 'غير متوفر';
  const address = formData.address || profile?.address || 'غير متوفر';
  
  const imageUrl = profile?.cover_images || null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-blue-500" />
            الملف الشخصي
          </h1>
          <p className="text-gray-500 text-sm">إدارة معلوماتك الشخصية</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchProfile}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* بطاقة الملف الشخصي */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* الصورة الشخصية */}
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-gray-200 dark:border-gray-700">
                <AvatarImage 
                  src={imageUrl || ''} 
                  alt={fullName}
                />
                <AvatarFallback className="text-4xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="تغيير الصورة الشخصية"
              >
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* معلومات المستخدم */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-bold">{fullName}</h2>
                {isSuperuser && (
                  <Badge className="bg-purple-500 text-white">مشرف عام</Badge>
                )}
                {isStaff && !isSuperuser && (
                  <Badge className="bg-blue-500 text-white">موظف</Badge>
                )}
                {isActive ? (
                  <Badge className="bg-green-500 text-white">✅ نشط</Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">❌ غير نشط</Badge>
                )}
              </div>
              
              <p className="text-gray-500 text-sm mt-1">{formData.email}</p>
              <p className="text-gray-400 text-sm">@{formData.username}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                {phoneNumber !== 'غير متوفر' && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    {phoneNumber}
                  </div>
                )}
                {address !== 'غير متوفر' && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {address}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  انضم في {formatDate(user?.date_joined)}
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col gap-2">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    إلغاء التعديل
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    تعديل الملف
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleChangePassword}
                className="gap-2"
              >
                <Key className="w-4 h-4" />
                تغيير كلمة المرور
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات المستخدم */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي الفواتير</p>
              <p className="text-2xl font-bold">{stats?.sales || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
              <Package className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">المنتجات</p>
              <p className="text-2xl font-bold">{stats?.products || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">العملاء</p>
              <p className="text-2xl font-bold">{stats?.customers || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نموذج التعديل */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              تعديل المعلومات الشخصية
            </CardTitle>
            <CardDescription>تحديث بياناتك الشخصية</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم الأول</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="أدخل الاسم الأول"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الاسم الأخير</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="أدخل الاسم الأخير"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المستخدم</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800/50"
                  />
                  <p className="text-xs text-gray-400">لا يمكن تغيير البريد الإلكتروني</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="أدخل العنوان"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: user?.first_name || '',
                      last_name: user?.last_name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      username: user?.username || '',
                    });
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Shield className="w-5 h-5" />
            معلومات الحساب
          </CardTitle>
          <CardDescription>تفاصيل إضافية عن حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">معرف المستخدم</p>
                <p className="font-medium text-sm">{user?.id || 'غير متوفر'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">آخر تسجيل دخول</p>
                <p className="font-medium text-sm">{formatDate(user?.last_login)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">حالة الحساب</p>
                <p className="font-medium text-sm">
                  {isActive ? (
                    <span className="text-green-600">نشط</span>
                  ) : (
                    <span className="text-red-600">غير نشط</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">الصلاحيات</p>
                <p className="font-medium text-sm">
                  {isSuperuser ? (
                    <span className="text-purple-600">مشرف عام</span>
                  ) : isStaff ? (
                    <span className="text-blue-600">موظف</span>
                  ) : (
                    <span className="text-gray-600">مستخدم عادي</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تذييل */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t">
        <p>تم تحديث الملف الشخصي آخر مرة في {formatDate(user?.updated_at || user?.date_joined)}</p>
        <p className="mt-1">DUKA | نظام إدارة المتاجر المتكامل</p>
      </div>
    </div>
  );
}