import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints/notifications';
import { toast } from 'sonner';

export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      try {
        console.log('📊 Fetching notifications with params:', params);
        const response = await notificationsApi.getAll(params);
        console.log('📊 Response data:', response.data);
        
        const data = response.data;
        
        // ✅ التعامل مع البيانات
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === 'object' && 'results' in data) {
          return data.results || [];
        }
        return [];
      } catch (error: any) {
        console.error('❌ Error loading notifications:', error);
        return [];
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 2,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      try {
        const response = await notificationsApi.getUnreadCount();
        return response.data.unread_count || 0;
      } catch (error) {
        console.error('❌ Error loading unread count:', error);
        return 0;
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 2,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('تم تحديد الإشعار كمقروء');
    },
    onError: (error: any) => {
      console.error('❌ Error marking as read:', error);
      toast.error('حدث خطأ في تحديد الإشعار كمقروء');
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
    onError: (error: any) => {
      console.error('❌ Error marking all as read:', error);
      toast.error('حدث خطأ في تحديد الإشعارات كمقروءة');
    },
  });
};

export const usePreferences = () => {
  return useQuery({
    queryKey: ['notifications-preferences'],
    queryFn: async () => {
      const response = await notificationsApi.getPreferences();
      return response.data;
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-preferences'] });
      toast.success('تم تحديث تفضيلات الإشعارات');
    },
    onError: (error: any) => {
      console.error('❌ Error updating preferences:', error);
      toast.error('حدث خطأ في تحديث التفضيلات');
    },
  });
};

// ✅ تشغيل جميع الفحوصات
export const useRunAllChecks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationsApi.runAllChecks(),
    onSuccess: (response) => {
      toast.success('✅ جاري تشغيل جميع الفحوصات... سيتم تحديث الإشعارات قريباً');
      // تحديث الإشعارات بعد 3 ثواني
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
        toast.success('✅ تم تحديث الإشعارات');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('❌ Error running checks:', error);
      toast.error('حدث خطأ في تشغيل الفحوصات');
    },
  });
};

// ✅ تشغيل فحص محدد
export const useRunCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (checkType: 'stock' | 'shipments' | 'collections' | 'payments') => 
      notificationsApi.runCheck(checkType),
    onSuccess: (response, checkType) => {
      const messages: Record<string, string> = {
        stock: '✅ تم فحص المخزون',
        shipments: '✅ تم فحص الشحنات',
        collections: '✅ تم فحص التحصيلات',
        payments: '✅ تم فحص المدفوعات',
      };
      toast.success(messages[checkType] || '✅ تم تشغيل الفحص');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      }, 2000);
    },
    onError: (error: any) => {
      console.error('❌ Error running check:', error);
      toast.error('حدث خطأ في تشغيل الفحص');
    },
  });
};