import { apiClient } from '../client';

export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard/api/summary/'),
  getSalesChart: (period: string = 'month') => 
    apiClient.get(`/dashboard/api/chart/sales/?period=${period}`),
  getComparison: () => apiClient.get('/dashboard/api/comparison/'),
};

export default dashboardApi;
