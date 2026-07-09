import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints/notifications';
import { toast } from 'sonner';

export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await notificationsApi.getAll(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
    staleTime: 15000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data.unread_count || 0;
    },
    refetchInterval: 30000,
    staleTime: 15000,
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
    onError: () => {
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
    onError: () => {
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
    onError: () => {
      toast.error('حدث خطأ في تحديث التفضيلات');
    },
  });
};
