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
    queryFn: () => customersApi.getAll(params).then(res => res.data),
    staleTime: 60000,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id).then(res => res.data),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Customer>) => 
      customersApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم إضافة العميل بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة العميل');
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customersApi.update(id, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('تم تحديث العميل بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث العميل');
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في حذف العميل');
    },
  });
};

export const useVIPCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'vip'],
    queryFn: () => customersApi.getVIP().then(res => res.data),
    staleTime: 60000,
  });
};

export const useTopSpenders = () => {
  return useQuery({
    queryKey: ['customers', 'top-spenders'],
    queryFn: () => customersApi.getTopSpenders().then(res => res.data),
    staleTime: 60000,
  });
};
