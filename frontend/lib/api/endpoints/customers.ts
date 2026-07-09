import { apiClient } from '../client';

export const customersApi = {
  getAll: (params?: any) => apiClient.get('/customers/api/customers/', { params }),
  getById: (id: string) => apiClient.get(`/customers/api/customers/${id}/`),
  create: (data: any) => apiClient.post('/customers/api/customers/', data),
  update: (id: string, data: any) => apiClient.patch(`/customers/api/customers/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/customers/api/customers/${id}/`),
  getVIP: () => apiClient.get('/customers/api/customers/vip/'),
  getTopSpenders: () => apiClient.get('/customers/api/customers/top_spenders/'),
};

export default customersApi;
