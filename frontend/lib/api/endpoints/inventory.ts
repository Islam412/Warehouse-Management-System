import { apiClient } from '../client';

export const inventoryApi = {
  // Warehouses
  getWarehouses: (params?: any) => apiClient.get('/inventory/api/warehouses/', { params }),
  createWarehouse: (data: any) => apiClient.post('/inventory/api/warehouses/', data),
  updateWarehouse: (id: string, data: any) => apiClient.patch(`/inventory/api/warehouses/${id}/`, data),
  deleteWarehouse: (id: string) => apiClient.delete(`/inventory/api/warehouses/${id}/`),
  
  // Stocks
  getStocks: (params?: any) => apiClient.get('/inventory/api/stocks/', { params }),
  getStockById: (id: string) => apiClient.get(`/inventory/api/stocks/${id}/`),
  getLowStock: () => apiClient.get('/inventory/api/stocks/low_stock/'),
  getOverStock: () => apiClient.get('/inventory/api/stocks/over_stock/'),
  
  // Movements
  getMovements: (params?: any) => apiClient.get('/inventory/api/movements/', { params }),
  adjustStock: (data: any) => apiClient.post('/inventory/api/movements/adjust_stock/', data),
};

export default inventoryApi;