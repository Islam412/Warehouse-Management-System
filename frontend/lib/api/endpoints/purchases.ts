import { apiClient } from '../client';

export const purchasesApi = {
  // Orders
  getAll: (params?: any) => apiClient.get('/purchases/api/orders/', { params }),
  getById: (id: string) => apiClient.get(`/purchases/api/orders/${id}/`),
  create: (data: any) => apiClient.post('/purchases/api/orders/', data),
  update: (id: string, data: any) => apiClient.patch(`/purchases/api/orders/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/purchases/api/orders/${id}/`),
  
  // Actions
  receive: (id: string, data: any) => apiClient.post(`/purchases/api/orders/${id}/receive/`, data),
  cancel: (id: string) => apiClient.post(`/purchases/api/orders/${id}/cancel/`),
  
  // Items
  getItems: (params?: any) => apiClient.get('/purchases/api/items/', { params }),
};

export default purchasesApi;