import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/lib/api/endpoints/suppliers';
import { Supplier } from '@/types';
import { toast } from 'sonner';

// ============================================
// Suppliers Hooks
// ============================================

export const useSuppliers = (params?: any) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await suppliersApi.getAll(params);
      console.log('📊 Suppliers data loaded:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results || [];
      }
      return [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const response = await suppliersApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      console.log('📤 Creating supplier:', data);
      const response = await suppliersApi.create(data);
      console.log('✅ Supplier created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('تم إضافة المورد بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Create supplier error:', error);
      const message = error.response?.data?.detail || 'حدث خطأ في إضافة المورد';
      toast.error(message);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
      console.log(`📤 Updating supplier ${id}:`, data);
      const response = await suppliersApi.update(id, data);
      console.log('✅ Supplier updated:', response.data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      queryClient.setQueryData(['supplier', id], data);
      toast.success('تم تحديث المورد بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Update supplier error:', error);
      const message = error.response?.data?.detail || 'حدث خطأ في تحديث المورد';
      toast.error(message);
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`🗑️ Deleting supplier ${id}`);
      await suppliersApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.removeQueries({ queryKey: ['supplier', id] });
      toast.success('تم حذف المورد بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Delete supplier error:', error);
      toast.error('حدث خطأ في حذف المورد');
    },
  });
};

export const useTopSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers', 'top'],
    queryFn: async () => {
      const response = await suppliersApi.getTop();
      return response.data;
    },
    staleTime: 60000,
  });
};
