import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/lib/api/endpoints/sales';
import { Invoice, Payment, Return } from '@/types';
import { toast } from 'sonner';

// ============================================
// Invoices Hooks
// ============================================

export const useInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await salesApi.getAll(params);
      console.log('📊 Invoices data loaded:', response.data);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await salesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('📤 Creating invoice:', data);
      const response = await salesApi.create(data);
      console.log('✅ Invoice created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('تم إنشاء الفاتورة بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Create invoice error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إنشاء الفاتورة');
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log(`📤 Updating invoice ${id}:`, data);
      const response = await salesApi.update(id, data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      toast.success('تم تحديث الفاتورة بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Update invoice error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث الفاتورة');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`🗑️ Deleting invoice ${id}`);
      await salesApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.removeQueries({ queryKey: ['invoice', id] });
      toast.success('تم حذف الفاتورة بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Delete invoice error:', error);
      toast.error('حدث خطأ في حذف الفاتورة');
    },
  });
};

// ============================================
// Payments Hooks
// ============================================

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string; data: any }) => {
      console.log(`📤 Adding payment to invoice ${invoiceId}:`, data);
      const response = await salesApi.addPayment(invoiceId, data);
      return response.data;
    },
    onSuccess: (data, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      toast.success('تم إضافة الدفعة بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Add payment error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الدفعة');
    },
  });
};

export const usePayments = (params?: any) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const response = await salesApi.getPayments(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 60000,
  });
};

// ============================================
// Returns Hooks
// ============================================

export const useAddReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string; data: any }) => {
      console.log(`📤 Adding return to invoice ${invoiceId}:`, data);
      const response = await salesApi.addReturn(invoiceId, data);
      return response.data;
    },
    onSuccess: (data, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      toast.success('تم إضافة المرتجع بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Add return error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة المرتجع');
    },
  });
};

export const useReturns = (params?: any) => {
  return useQuery({
    queryKey: ['returns', params],
    queryFn: async () => {
      const response = await salesApi.getReturns(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 60000,
  });
};

// ============================================
// Special Queries
// ============================================

export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'overdue'],
    queryFn: async () => {
      const response = await salesApi.overdue();
      return response.data;
    },
    staleTime: 60000,
  });
};

export const useTodayInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'today'],
    queryFn: async () => {
      const response = await salesApi.today();
      return response.data;
    },
    staleTime: 30000,
  });
};
