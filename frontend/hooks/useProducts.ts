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
    queryFn: () => productsApi.getAll(params).then(res => res.data),
    staleTime: 60000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id).then(res => res.data),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Product>) => 
      productsApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إضافة المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة المنتج');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsApi.update(id, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('تم تحديث المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث المنتج');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في حذف المنتج');
    },
  });
};

// ============================================
// Categories Hooks
// ============================================

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories().then(res => res.data),
    staleTime: 300000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Category>) =>
      productsApi.createCategory(data).then(res => res.data),
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
    queryFn: () => productsApi.getBrands().then(res => res.data),
    staleTime: 300000,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Brand>) =>
      productsApi.createBrand(data).then(res => res.data),
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
    queryFn: () => productsApi.getUnits().then(res => res.data),
    staleTime: 300000,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Unit>) =>
      productsApi.createUnit(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('تم إضافة وحدة القياس بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الوحدة');
    },
  });
};
