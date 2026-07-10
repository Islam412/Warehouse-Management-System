import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/endpoints/customers';
import { Customer } from '@/types';
import { toast } from 'sonner';

// ============================================
// Customers CRUD Hooks
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
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-distribution'] });
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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-distribution'] });
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
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-distribution'] });
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

// ============================================
// 📊 Customer Analytics Hooks
// ============================================

export const useVIPCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'vip'],
    queryFn: async () => {
      const response = await customersApi.getVIP();
      return response.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
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
    refetchOnWindowFocus: true,
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      try {
        const response = await customersApi.getStats();
        console.log('📊 Customer stats loaded:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error loading customer stats:', error);
        // Return default stats if API fails
        return {
          total: 0,
          vip: 0,
          regular: 0,
          blocked: 0,
          with_debt: 0,
          with_credit: 0,
          total_debt: 0,
          avg_spending: 0,
          avg_balance: 0,
        };
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useCustomerDistribution = () => {
  return useQuery({
    queryKey: ['customer-distribution'],
    queryFn: async () => {
      try {
        const response = await customersApi.getDistribution();
        console.log('📊 Customer distribution loaded:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error loading customer distribution:', error);
        // Return default distribution if API fails
        return {
          city_distribution: [],
          registration_trend: [],
        };
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useInactiveCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'inactive'],
    queryFn: async () => {
      try {
        const response = await customersApi.getInactive();
        return response.data;
      } catch (error) {
        console.error('❌ Error loading inactive customers:', error);
        return [];
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useLoyalCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'loyal'],
    queryFn: async () => {
      try {
        const response = await customersApi.getLoyal();
        return response.data;
      } catch (error) {
        console.error('❌ Error loading loyal customers:', error);
        return [];
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useCustomerComparison = () => {
  return useQuery({
    queryKey: ['customers', 'comparison'],
    queryFn: async () => {
      try {
        const response = await customersApi.getComparison();
        console.log('📊 Customer comparison loaded:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error loading customer comparison:', error);
        // Return default comparison if API fails
        return {
          vip_count: 0,
          regular_count: 0,
          avg_vip_purchase: 0,
          avg_regular_purchase: 0,
          avg_vip_balance: 0,
          avg_regular_balance: 0,
          vip_total_purchases: 0,
          regular_total_purchases: 0,
        };
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};