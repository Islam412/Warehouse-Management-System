// frontend/hooks/useProducts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/endpoints/products';
import { Product, Category, Brand, Unit } from '@/types';
import { toast } from 'sonner';

// ============================================
// Products Hooks
// ============================================

export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productsApi.getAll(params);
      console.log('📊 Products API response:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results || [];
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsApi.getById(id);
      console.log('📊 Product detail loaded:', response.data);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      console.log('📤 Creating product:', data);
      const response = await productsApi.create(data);
      console.log('✅ Product created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إضافة المنتج بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Create product error:', error);
      const message = error.response?.data?.detail || 'حدث خطأ في إضافة المنتج';
      toast.error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      console.log(`📤 Updating product ${id}:`, data);
      const response = await productsApi.update(id, data);
      console.log('✅ Product updated:', response.data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.setQueryData(['product', id], data);
      toast.success('تم تحديث المنتج بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Update product error:', error);
      const message = error.response?.data?.detail || 'حدث خطأ في تحديث المنتج';
      toast.error(message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`🗑️ Deleting product ${id}`);
      await productsApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product', id] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Delete product error:', error);
      toast.error('حدث خطأ في حذف المنتج');
    },
  });
};

// ============================================
// Categories Hooks
// ============================================

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productsApi.getCategories();
      console.log('📊 Categories API response:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results || [];
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    },
    staleTime: 300000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Category>) => productsApi.createCategory(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم إضافة الفئة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الفئة');
    },
  });
};

// ============================================
// Brands Hooks
// ============================================

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await productsApi.getBrands();
      console.log('📊 Brands API response:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results || [];
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    },
    staleTime: 300000,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Brand>) => productsApi.createBrand(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('تم إضافة العلامة التجارية بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة العلامة');
    },
  });
};

// ============================================
// Units Hooks
// ============================================

export const useUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await productsApi.getUnits();
      console.log('📊 Units API response:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results || [];
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    },
    staleTime: 300000,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Unit>) => productsApi.createUnit(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('تم إضافة وحدة القياس بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الوحدة');
    },
  });
};