import { apiClient } from '../client';

export const settingsApi = {
  // Company
  getCompany: () => apiClient.get('/settings/api/company/'),
  updateCompany: (data: any) => apiClient.patch('/settings/api/company/', data),
  uploadLogo: (data: FormData) => apiClient.post('/settings/api/company/upload-logo/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadCover: (data: FormData) => apiClient.post('/settings/api/company/upload-cover/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  // Settings
  getSettings: () => apiClient.get('/settings/api/settings/'),
  updateSettings: (data: any) => apiClient.patch('/settings/api/settings/', data),
  resetSettings: () => apiClient.post('/settings/api/settings/reset/'),
  
  // Branches
  getBranches: (params?: any) => apiClient.get('/settings/api/branches/', { params }),
  getBranchById: (id: string) => apiClient.get(`/settings/api/branches/${id}/`),
  createBranch: (data: any) => apiClient.post('/settings/api/branches/', data),
  updateBranch: (id: string, data: any) => apiClient.patch(`/settings/api/branches/${id}/`, data),
  deleteBranch: (id: string) => apiClient.delete(`/settings/api/branches/${id}/`),
  toggleBranch: (id: string) => apiClient.post(`/settings/api/branches/${id}/toggle_active/`),
  setMainBranch: (id: string) => apiClient.post(`/settings/api/branches/${id}/set_main/`),
  
  // Payment Methods
  getPaymentMethods: (params?: any) => apiClient.get('/settings/api/payment-methods/', { params }),
  createPaymentMethod: (data: any) => apiClient.post('/settings/api/payment-methods/', data),
  updatePaymentMethod: (id: string, data: any) => apiClient.patch(`/settings/api/payment-methods/${id}/`, data),
  deletePaymentMethod: (id: string) => apiClient.delete(`/settings/api/payment-methods/${id}/`),
  setDefaultPayment: (id: string) => apiClient.post(`/settings/api/payment-methods/${id}/set_default/`),
  
  // Shipping Methods
  getShippingMethods: (params?: any) => apiClient.get('/settings/api/shipping-methods/', { params }),
  createShippingMethod: (data: any) => apiClient.post('/settings/api/shipping-methods/', data),
  updateShippingMethod: (id: string, data: any) => apiClient.patch(`/settings/api/shipping-methods/${id}/`, data),
  deleteShippingMethod: (id: string) => apiClient.delete(`/settings/api/shipping-methods/${id}/`),
  setDefaultShipping: (id: string) => apiClient.post(`/settings/api/shipping-methods/${id}/set_default/`),
  
  // Social Links
  getSocialLinks: (params?: any) => apiClient.get('/settings/api/social-links/', { params }),
  createSocialLink: (data: any) => apiClient.post('/settings/api/social-links/', data),
  updateSocialLink: (id: string, data: any) => apiClient.patch(`/settings/api/social-links/${id}/`, data),
  deleteSocialLink: (id: string) => apiClient.delete(`/settings/api/social-links/${id}/`),
};

export default settingsApi;