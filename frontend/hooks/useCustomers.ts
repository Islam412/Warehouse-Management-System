import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/endpoints/customers';
import { Customer } from '@/types';
import { toast } from 'sonner';

// ============================================
// Customers Hooks
// ============================================

export const useCustomers = (params?: any) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      try {
        const response = await customersApi.getAll(params);
        console.log('📊 Customers data loaded:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error loading customers:', error);
        throw error;
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      try {
        const response = await customersApi.getById(id);
        console.log(`📊 Customer ${id} loaded:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`❌ Error loading customer ${id}:`, error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 60000,
    retry: 1,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      console.log('📤 Creating customer:', data);
      const response = await customersApi.create(data);
      console.log('✅ Customer created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم إضافة العميل بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Create customer error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'حدث خطأ في إضافة العميل';
      toast.error(message);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      console.log(`📤 Updating customer ${id}:`, data);
      const response = await customersApi.update(id, data);
      console.log('✅ Customer updated:', response.data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      // تحديث الكاش
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      // تحديث البيانات في الكاش مباشرة
      queryClient.setQueryData(['customer', id], data);
      toast.success('تم تحديث العميل بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Update customer error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'حدث خطأ في تحديث العميل';
      toast.error(message);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`🗑️ Deleting customer ${id}`);
      await customersApi.delete(id);
      console.log('✅ Customer deleted:', id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.removeQueries({ queryKey: ['customer', id] });
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Delete customer error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'حدث خطأ في حذف العميل';
      toast.error(message);
    },
  });
};

export const useVIPCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'vip'],
    queryFn: async () => {
      const response = await customersApi.getVIP();
      return response.data;
    },
    staleTime: 60000,
  });
};

export const useTopSpenders = () => {
  return useQuery({
    queryKey: ['customers', 'top-spenders'],
    queryFn: async () => {
      const response = await customersApi.getTopSpenders();
      return response.data;
    },
    staleTime: 60000,
  });
};
