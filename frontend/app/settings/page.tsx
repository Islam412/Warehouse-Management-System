// frontend/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, RefreshCw, Loader2, Building2, Phone, Mail, MapPin, DollarSign, Image, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { company, isLoading, fetchSettings, updateCompany } = useSettingsStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    phone: '',
    email: '',
    address: '',
    currency: 'EGP',
    currency_symbol: 'ج.م',
    tax_rate: 14,
    low_stock_alert: true,
    email_notifications: true,
  });

  // جلب الإعدادات عند تحميل الصفحة
  useEffect(() => {
    fetchSettings();
  }, []);

  // تحديث الفورم عند تغيير البيانات
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        name_ar: company.name_ar || '',
        phone: company.phone || '',
        email: company.email || '',
        address: company.address || '',
        currency: company.currency || 'EGP',
        currency_symbol: company.currency_symbol || 'ج.م',
        tax_rate: company.tax_rate || 14,
        low_stock_alert: company.low_stock_alert !== undefined ? company.low_stock_alert : true,
        email_notifications: company.email_notifications !== undefined ? company.email_notifications : true,
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // تحديث بيانات الشركة
      await updateCompany({
        name: formData.name,
        name_ar: formData.name_ar,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        currency: formData.currency,
        currency_symbol: formData.currency_symbol,
        tax_rate: formData.tax_rate,
        low_stock_alert: formData.low_stock_alert,
        email_notifications: formData.email_notifications,
      });
      
      toast.success('✅ تم حفظ الإعدادات بنجاح');
      
      // إعادة تحميل البيانات بعد 1 ثانية
      setTimeout(() => {
        fetchSettings();
      }, 500);
      
    } catch (error) {
      toast.error('❌ حدث خطأ في حفظ الإعدادات');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await fetchSettings();
    toast.info('🔄 تم تحديث الإعدادات');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-gray-500">جاري تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            الإعدادات
          </h1>
          <p className="text-gray-500 text-sm">إعدادات النظام والمتجر</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="w-4 h-4" />
            معلومات الشركة
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="w-4 h-4" />
            الاتصال
          </TabsTrigger>
          <TabsTrigger value="currency" className="gap-2">
            <DollarSign className="w-4 h-4" />
            العملة
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="w-4 h-4" />
            النظام
          </TabsTrigger>
        </TabsList>

        {/* تبويب معلومات الشركة */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                معلومات الشركة
              </CardTitle>
              <CardDescription>البيانات الأساسية للشركة التي تظهر في كل مكان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الشركة (بالعربية)</Label>
                  <Input
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleChange}
                    placeholder="اسم الشركة بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم الشركة (بالإنجليزية)</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  رابط الشعار
                </Label>
                <Input
                  name="logo"
                  value={company.logo || ''}
                  onChange={(e) => {
                    // تحديث اللوغو في الستور
                    updateCompany({ logo: e.target.value });
                  }}
                  placeholder="https://example.com/logo.png"
                />
                {company.logo && (
                  <div className="mt-2 flex items-center gap-3">
                    <img 
                      src={company.logo} 
                      alt={formData.name} 
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-gray-400">سيظهر هذا الشعار في Header و Sidebar</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الاتصال */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                معلومات الاتصال
              </CardTitle>
              <CardDescription>بيانات التواصل التي تظهر في الموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@company.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  العنوان
                </Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="القاهرة، مصر"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب العملة */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                إعدادات العملة
              </CardTitle>
              <CardDescription>تنسيق العملة في جميع أنحاء النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    رمز العملة
                  </Label>
                  <Input
                    name="currency_symbol"
                    value={formData.currency_symbol}
                    onChange={handleChange}
                    placeholder="ج.م"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    كود العملة
                  </Label>
                  <Input
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    placeholder="EGP"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>نسبة الضريبة الافتراضية (%)</Label>
                <Input
                  name="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={handleChange}
                  placeholder="14"
                />
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💡 مثال: سيتم عرض الأسعار بهذا الشكل: {formData.currency_symbol} 100.00
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب النظام */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>تفعيل أو إلغاء تفعيل الميزات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">تنبيهات المخزون المنخفض</p>
                  <p className="text-sm text-gray-500">إشعار عند وصول المخزون للحد الأدنى</p>
                </div>
                <Switch 
                  checked={formData.low_stock_alert} 
                  onCheckedChange={(checked) => handleSwitchChange('low_stock_alert', checked)} 
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">إشعارات البريد الإلكتروني</p>
                  <p className="text-sm text-gray-500">استقبال إشعارات عبر البريد</p>
                </div>
                <Switch 
                  checked={formData.email_notifications} 
                  onCheckedChange={(checked) => handleSwitchChange('email_notifications', checked)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* معاينة التغييرات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            معاينة التغييرات
          </CardTitle>
          <CardDescription>كيف ستبدو البيانات في الموقع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={formData.name} 
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <p className="font-bold text-lg">{formData.name || 'اسم الشركة'}</p>
                <p className="text-sm text-gray-500">{formData.address || 'العنوان'}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📞 {formData.phone || 'رقم الهاتف'}</span>
              <span>✉️ {formData.email || 'البريد الإلكتروني'}</span>
              <span>💰 {formData.currency_symbol} {formData.currency || 'العملة'}</span>
              <span>📊 ضريبة: {formData.tax_rate}%</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                {formData.low_stock_alert ? '✅ تنبيهات المخزون مفعلة' : '❌ تنبيهات المخزون معطلة'}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                {formData.email_notifications ? '✅ إشعارات البريد مفعلة' : '❌ إشعارات البريد معطلة'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}