'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Truck, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAccessToken } from '@/lib/auth';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'payment' | 'shipment' | 'installment';
  read: boolean;
  created_at: string;
  action_url?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: '🔔 موعد استلام شحنة',
      message: 'شحنة رقم PO-001 من مورد إسلام الأول ستصل خلال يومين',
      type: 'shipment',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: '💰 موعد دفع قسط',
      message: 'قسط بقيمة 5,000 ج.م على فاتورة INV-001 مستحق خلال 3 أيام',
      type: 'payment',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: '📦 موعد استلام قسط',
      message: 'قسط بقيمة 2,500 ج.م من عميل أحمد محمد مستحق خلال 5 أيام',
      type: 'installment',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: '⚠️ مخزون منخفض',
      message: 'قلب حنفية استانلس يحتاج إعادة طلب (الكمية: 3)',
      type: 'warning',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      title: '✅ فاتورة جديدة',
      message: 'تم إنشاء فاتورة جديدة رقم INV-025 بقيمة 1,200 ج.م',
      type: 'success',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast.success('تم تحديد الإشعار كمقروء');
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('تم تحديد جميع الإشعارات كمقروءة');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-red-500" />;
      case 'shipment': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'installment': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'payment': return 'bg-red-500';
      case 'shipment': return 'bg-blue-500';
      case 'installment': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} غير مقروء</Badge>
            )}
          </h1>
          <p className="text-gray-500 text-sm">جميع الإشعارات والتنبيهات</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => toast.info('تم تحديث الإشعارات')} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* إحصائيات الإشعارات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">الإجمالي</p>
            <p className="text-2xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">غير مقروء</p>
            <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">مقروء</p>
            <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">تنبيهات مهمة</p>
            <p className="text-2xl font-bold text-yellow-600">
              {notifications.filter(n => ['payment', 'shipment', 'installment'].includes(n.type) && !n.read).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الإشعارات */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد إشعارات</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={notif.read ? 'opacity-60' : 'border-r-4 border-r-blue-500'}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{notif.title}</h3>
                    {!notif.read && <Badge className={getBadgeColor(notif.type)}>جديد</Badge>}
                    <span className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{notif.message}</p>
                  {notif.action_url && (
                    <Button variant="link" size="sm" className="p-0 h-auto text-blue-500">
                      عرض التفاصيل
                    </Button>
                  )}
                </div>
                {!notif.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500"
                    onClick={() => markAsRead(notif.id)}
                  >
                    تحديد كمقروء
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// إضافة RefreshCw للاستيراد
import { RefreshCw } from 'lucide-react';
