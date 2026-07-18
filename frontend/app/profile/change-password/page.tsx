// frontend/app/profile/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // مسح الخطأ عند التعديل
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password) {
      newErrors.current_password = 'كلمة المرور الحالية مطلوبة';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = getAccessToken();
      
      const response = await fetch('http://localhost:8000/api/v1/auth/api/password/change/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ تم تغيير كلمة المرور بنجاح');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        const message = data.detail || data.error || 'حدث خطأ في تغيير كلمة المرور';
        setErrors({ form: message });
        toast.error(message);
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/profile')}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        العودة إلى الملف الشخصي
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-500" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>
            أدخل كلمة المرور الحالية والجديدة لتغيير كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {errors.form}
              </div>
            )}

            {/* كلمة المرور الحالية */}
            <div className="space-y-2">
              <Label>كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  name="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور الحالية"
                  className={errors.current_password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-500">{errors.current_password}</p>
              )}
            </div>

            {/* كلمة المرور الجديدة */}
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  name="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className={errors.new_password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-red-500">{errors.new_password}</p>
              )}
              <p className="text-xs text-gray-400">يجب أن تكون 6 أحرف على الأقل</p>
            </div>

            {/* تأكيد كلمة المرور */}
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                  className={errors.confirm_password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-500">{errors.confirm_password}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التغيير...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}