'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Truck, DollarSign, Calendar, Loader2, RefreshCw, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  const { data: notifications, isLoading, error, refetch } = useNotifications({ search });
  const { data: unreadCount, refetch: refetchUnread } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllRead();

  const handleMarkRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleRefresh = () => {
    refetch();
    refetchUnread();
    toast.info('تم تحديث الإشعارات');
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Sound not available');
    }
  };

  // تشغيل الصوت عند وصول إشعار جديد
  useEffect(() => {
    if (notifications && unreadCount !== undefined) {
      const newUnread = notifications.filter((n: any) => !n.is_read).length;
      if (newUnread > 0 && newUnread > unreadCount) {
        playNotificationSound();
      }
    }
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل الإشعارات</h3>
        <p className="text-gray-500">يرجى المحاولة مرة أخرى</p>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'payment_due': return <DollarSign className="w-5 h-5 text-red-500" />;
      case 'collection_due': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'shipment_due': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'stock_alert': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'payment_due': return 'bg-red-500';
      case 'collection_due': return 'bg-purple-500';
      case 'shipment_due': return 'bg-blue-500';
      case 'stock_alert': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-yellow-500',
      urgent: 'bg-red-500',
    };
    const labels = {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      urgent: 'عاجل',
    };
    return <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-500'}>
      {labels[priority as keyof typeof labels] || priority}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white animate-pulse">{unreadCount} غير مقروء</Badge>
            )}
          </h1>
          <p className="text-gray-500 text-sm">جميع الإشعارات والتنبيهات الذكية</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={playNotificationSound} className="gap-2">
            <Volume2 className="w-4 h-4" />
            اختبار الصوت
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
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
            <p className="text-2xl font-bold">{notifications?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">غير مقروء</p>
            <p className="text-2xl font-bold text-red-600">{unreadCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">مقروء</p>
            <p className="text-2xl font-bold text-green-600">{(notifications?.length || 0) - (unreadCount || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">عاجلة</p>
            <p className="text-2xl font-bold text-orange-600">
              {notifications?.filter((n: any) => n.priority === 'urgent' && !n.is_read).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الإشعارات */}
      <div className="space-y-3">
        {notifications?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد إشعارات</p>
            </CardContent>
          </Card>
        ) : (
          notifications?.map((notif: any) => (
            <Card key={notif.id} className={notif.is_read ? 'opacity-60' : 'border-r-4 border-r-blue-500'}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">{getIcon(notif.notification_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{notif.title}</h3>
                    {!notif.is_read && <Badge className={getBadgeColor(notif.notification_type)}>جديد</Badge>}
                    {getPriorityBadge(notif.priority)}
                    <span className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{notif.message}</p>
                  {notif.due_date && (
                    <p className="text-xs text-orange-500 mt-1">
                      ⏰ التاريخ: {new Date(notif.due_date).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
                {!notif.is_read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500 whitespace-nowrap"
                    onClick={() => handleMarkRead(notif.id)}
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
