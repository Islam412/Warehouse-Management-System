import { apiClient } from '../client';

export const reportsApi = {
  // Reports
  sales: (data: any) => apiClient.post('/reports/api/reports/sales/', data),
  purchases: (data: any) => apiClient.post('/reports/api/reports/purchases/', data),
  inventory: (data: any) => apiClient.post('/reports/api/reports/inventory/', data),
  profitLoss: (data: any) => apiClient.post('/reports/api/reports/profit_loss/', data),
  customers: (data: any) => apiClient.post('/reports/api/reports/customers/', data),
  suppliers: (data: any) => apiClient.post('/reports/api/reports/suppliers/', data),
  
  // Logs
  getLogs: (params?: any) => apiClient.get('/reports/api/reports/logs/', { params }),
};

export default reportsApi;