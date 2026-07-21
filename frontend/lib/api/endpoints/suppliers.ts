import { apiClient } from '../client';

export const suppliersApi = {
  getAll: (params?: any) => apiClient.get('/suppliers/api/suppliers/', { params }),
  getById: (id: string) => apiClient.get(`/suppliers/api/suppliers/${id}/`),
  create: (data: any) => apiClient.post('/suppliers/api/suppliers/', data),
  update: (id: string, data: any) => apiClient.patch(`/suppliers/api/suppliers/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/suppliers/api/suppliers/${id}/`),
  getTop: () => apiClient.get('/suppliers/api/suppliers/top_suppliers/'),
  updateBalance: (id: string, data: any) => 
    apiClient.post(`/suppliers/api/suppliers/${id}/update_balance/`, data),
};

export default suppliersApi;