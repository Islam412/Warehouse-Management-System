'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'DUKA',
    currency: 'ج.م',
    taxRate: 14,
    lowStockAlert: true,
    emailNotifications: true,
    darkMode: false,
  });

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            الإعدادات
          </h1>
          <p className="text-gray-500 text-sm">إعدادات النظام والمتجر</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('تم تحديث الإعدادات')} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشركة</CardTitle>
            <CardDescription>إعدادات الشركة الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الشركة</Label>
              <Input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>العملة</Label>
              <Input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>نسبة الضريبة (%)</Label>
              <Input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات النظام</CardTitle>
            <CardDescription>تفعيل أو إلغاء تفعيل الميزات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تنبيهات المخزون المنخفض</p>
                <p className="text-sm text-gray-500">إشعار عند وصول المخزون للحد الأدنى</p>
              </div>
              <Switch checked={settings.lowStockAlert} onCheckedChange={(checked) => setSettings({ ...settings, lowStockAlert: checked })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات البريد الإلكتروني</p>
                <p className="text-sm text-gray-500">استقبال إشعارات عبر البريد</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الوضع الداكن</p>
                <p className="text-sm text-gray-500">تفعيل الوضع الداكن للنظام</p>
              </div>
              <Switch checked={settings.darkMode} onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
