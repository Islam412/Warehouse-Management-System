'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'مخزون منخفض', message: 'قلب حنفية استانلس يحتاج إعادة طلب', type: 'warning', read: false },
    { id: 2, title: 'فاتورة جديدة', message: 'تم إنشاء فاتورة جديدة رقم INV-001', type: 'info', read: false },
    { id: 3, title: 'تم الدفع', message: 'تم استلام دفعة بقيمة 500 ج.م', type: 'success', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('تم تحديد جميع الإشعارات كمقروءة');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            الإشعارات
          </h1>
          <p className="text-gray-500 text-sm">جميع الإشعارات والتنبيهات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            تحديد الكل كمقروء
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('تم تحديث الإشعارات')} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card key={notif.id} className={notif.read ? 'opacity-60' : ''}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1">
                {notif.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{notif.title}</h3>
                  {!notif.read && <Badge className="bg-blue-500 text-xs">جديد</Badge>}
                </div>
                <p className="text-sm text-gray-500">{notif.message}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500">
                تحديد كمقروء
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
