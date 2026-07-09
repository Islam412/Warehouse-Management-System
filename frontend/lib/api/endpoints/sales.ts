import { apiClient } from '../client';

export const salesApi = {
  getAll: (params?: any) => apiClient.get('/sales/api/invoices/', { params }),
  getById: (id: string) => apiClient.get(`/sales/api/invoices/${id}/`),
  create: (data: any) => apiClient.post('/sales/api/invoices/', data),
  update: (id: string, data: any) => apiClient.patch(`/sales/api/invoices/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/sales/api/invoices/${id}/`),
  overdue: () => apiClient.get('/sales/api/invoices/overdue/'),
  today: () => apiClient.get('/sales/api/invoices/today/'),
};

export default salesApi;
