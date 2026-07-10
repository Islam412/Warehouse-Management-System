// frontend/app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Truck, DollarSign, Calendar, Loader2, RefreshCw, Volume2, Package, ShoppingCart, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { playNotificationSound } from '@/lib/notificationSound';

export default function NotificationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [lastUnreadCount, setLastUnreadCount] = useState(0);
  
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

  // تشغيل الصوت عند وصول إشعار جديد
  useEffect(() => {
    if (notifications && unreadCount !== undefined) {
      const currentUnread = notifications.filter((n: any) => !n.is_read).length;
      if (currentUnread > 0 && currentUnread > lastUnreadCount) {
        playNotificationSound();
      }
      setLastUnreadCount(currentUnread);
    }
  }, [notifications, unreadCount, lastUnreadCount]);

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
      case 'stock_alert': return <Package className="w-5 h-5 text-orange-500" />;
      case 'order_received': return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'system': return <Info className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      info: 'معلومات',
      success: 'نجاح',
      warning: 'تحذير',
      error: 'خطأ',
      payment_due: 'موعد دفع',
      collection_due: 'موعد تحصيل',
      shipment_due: 'موعد شحنة',
      stock_alert: 'تنبيه مخزون',
      order_received: 'استلام طلب',
      system: 'نظام',
    };
    return labels[type] || type;
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'payment_due': return 'bg-red-500';
      case 'collection_due': return 'bg-purple-500';
      case 'shipment_due': return 'bg-blue-500';
      case 'stock_alert': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'order_received': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-yellow-500',
      urgent: 'bg-red-500',
    };
    const labels: Record<string, string> = {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      urgent: 'عاجل',
    };
    return (
      <Badge className={colors[priority] || 'bg-gray-500'}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  // حساب الإحصائيات
  const totalNotifications = notifications?.length || 0;
  const unread = unreadCount || 0;
  const read = totalNotifications - unread;
  const urgent = notifications?.filter((n: any) => n.priority === 'urgent' && !n.is_read).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            الإشعارات
            {unread > 0 && (
              <Badge className="bg-red-500 text-white animate-pulse">
                {unread} غير مقروء
              </Badge>
            )}
          </h1>
          <p className="text-gray-500 text-sm">جميع الإشعارات والتنبيهات الذكية</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={playNotificationSound} 
            className="gap-2"
          >
            <Volume2 className="w-4 h-4" />
            اختبار الصوت
          </Button>
          {unread > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllRead} 
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="gap-2"
          >
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
            <p className="text-2xl font-bold">{totalNotifications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">غير مقروء</p>
            <p className="text-2xl font-bold text-red-600">{unread}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">مقروء</p>
            <p className="text-2xl font-bold text-green-600">{read}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">عاجلة</p>
            <p className="text-2xl font-bold text-orange-600">{urgent}</p>
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
              <p className="text-sm mt-1">ستظهر الإشعارات هنا عند حدوث أحداث مهمة</p>
            </CardContent>
          </Card>
        ) : (
          notifications?.map((notif: any) => (
            <Card 
              key={notif.id} 
              className={notif.is_read ? 'opacity-60' : 'border-r-4 border-r-blue-500'}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">{getIcon(notif.notification_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{notif.title}</h3>
                    {!notif.is_read && (
                      <Badge className={getBadgeColor(notif.notification_type)}>
                        جديد
                      </Badge>
                    )}
                    {getPriorityBadge(notif.priority)}
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(notif.notification_type)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                  {notif.due_date && (
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-orange-500" />
                      <p className="text-xs text-orange-500">
                        التاريخ: {new Date(notif.due_date).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {notif.reference_type && (
                    <p className="text-xs text-gray-400 mt-1">
                      المرجع: {notif.reference_type} - {notif.reference_id}
                    </p>
                  )}
                </div>
                {!notif.is_read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500 whitespace-nowrap hover:text-blue-700"
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

      {/* تذييل */}
      <div className="text-center text-xs text-gray-400">
        {totalNotifications > 0 && (
          <p>
            عرض {Math.min(totalNotifications, 50)} من {totalNotifications} إشعار
            {totalNotifications > 50 && ' (اعرض الكل للاطلاع على المزيد)'}
          </p>
        )}
      </div>
    </div>
  );
}