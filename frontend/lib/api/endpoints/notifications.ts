import { apiClient } from '../client';

export const notificationsApi = {
  // جلب جميع الإشعارات
  getAll: (params?: any) => {
    return apiClient.get('/notifications/api/notifications/', { params });
  },
  
  // جلب إشعار واحد
  getById: (id: string) => {
    return apiClient.get(`/notifications/api/notifications/${id}/`);
  },
  
  // إنشاء إشعار جديد
  create: (data: any) => {
    return apiClient.post('/notifications/api/notifications/', data);
  },
  
  // تحديث إشعار
  update: (id: string, data: any) => {
    return apiClient.patch(`/notifications/api/notifications/${id}/`, data);
  },
  
  // حذف إشعار
  delete: (id: string) => {
    return apiClient.delete(`/notifications/api/notifications/${id}/`);
  },
  
  // تحديد إشعار كمقروء
  markRead: (id: string) => {
    return apiClient.post(`/notifications/api/notifications/${id}/mark_read/`);
  },
  
  // تحديد جميع الإشعارات كمقروءة
  markAllRead: () => {
    return apiClient.post('/notifications/api/notifications/mark_all_read/');
  },
  
  // جلب عدد الإشعارات غير المقروءة
  getUnreadCount: () => {
    return apiClient.get('/notifications/api/notifications/unread_count/');
  },
  
  // جلب آخر الإشعارات
  getRecent: () => {
    return apiClient.get('/notifications/api/notifications/recent/');
  },
  
  // تفضيلات الإشعارات
  getPreferences: () => {
    return apiClient.get('/notifications/api/preferences/');
  },
  
  updatePreferences: (data: any) => {
    return apiClient.patch('/notifications/api/preferences/', data);
  },
  
  // سجل الإشعارات
  getLogs: (params?: any) => {
    return apiClient.get('/notifications/api/logs/', { params });
  },
};

export default notificationsApi;
