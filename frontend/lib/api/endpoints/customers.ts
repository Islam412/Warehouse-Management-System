import { apiClient } from '../client';

export const customersApi = {
  // CRUD
  getAll: (params?: any) => apiClient.get('/customers/api/customers/', { params }),
  getById: (id: string) => apiClient.get(`/customers/api/customers/${id}/`),
  create: (data: any) => apiClient.post('/customers/api/customers/', data),
  update: (id: string, data: any) => apiClient.patch(`/customers/api/customers/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/customers/api/customers/${id}/`),
  
  // VIP
  getVIP: () => apiClient.get('/customers/api/customers/vip/'),
  
  // Top Spenders
  getTopSpenders: () => apiClient.get('/customers/api/customers/top_spenders/'),
  
  // Stats
  getStats: () => apiClient.get('/customers/api/customers/stats/'),
  
  // Distribution
  getDistribution: () => apiClient.get('/customers/api/customers/distribution/'),
  
  // Inactive
  getInactive: () => apiClient.get('/customers/api/customers/inactive/'),
  
  // Loyal
  getLoyal: () => apiClient.get('/customers/api/customers/loyal/'),
  
  // Comparison
  getComparison: () => apiClient.get('/customers/api/customers/comparison/'),
};

export default customersApi;