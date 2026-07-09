'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch('http://localhost:8000/api/v1/auth/api/account/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUser(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAccessToken();
      // تحديث المستخدم
      const response = await fetch(`http://localhost:8000/api/v1/auth/api/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
        })
      });
      
      if (response.ok) {
        toast.success('تم تحديث الملف الشخصي بنجاح');
        fetchProfile();
      } else {
        toast.error('حدث خطأ في تحديث الملف الشخصي');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
            {formData.first_name?.[0]}{formData.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{formData.first_name} {formData.last_name}</h1>
          <p className="text-gray-500">{formData.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
            <CardDescription>تعديل معلوماتك الشخصية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم الأول</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم الأخير</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input value={formData.email} disabled className="bg-gray-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              معلومات الاتصال
            </CardTitle>
            <CardDescription>تحديث معلومات الاتصال</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
