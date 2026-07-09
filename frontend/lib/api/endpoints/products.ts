import { apiClient } from '../client';

export const productsApi = {
  getAll: (params?: any) => apiClient.get('/products/api/products/', { params }),
  getById: (id: string) => apiClient.get(`/products/api/products/${id}/`),
  create: (data: any) => apiClient.post('/products/api/products/', data),
  update: (id: string, data: any) => apiClient.patch(`/products/api/products/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/products/api/products/${id}/`),
  search: (query: string) => apiClient.get(`/products/api/products/search/?q=${query}`),
  getCategories: () => apiClient.get('/products/api/categories/'),
  getBrands: () => apiClient.get('/products/api/brands/'),
  getUnits: () => apiClient.get('/products/api/units/'),
};

export default productsApi;
