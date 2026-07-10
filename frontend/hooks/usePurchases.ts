import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '@/lib/api/endpoints/purchases';
import { toast } from 'sonner';

export const usePurchases = (params?: any) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: async () => {
      try {
        const response = await purchasesApi.getAll(params);
        console.log('📊 Purchases data loaded:', response.data);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && 'results' in data) return data.results || [];
        return [];
      } catch (error) {
        console.error('❌ Error loading purchases:', error);
        throw error;
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const usePurchase = (id: string) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      const response = await purchasesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('📤 Creating purchase order:', data);
      const response = await purchasesApi.create(data);
      console.log('✅ Purchase order created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('تم إنشاء أمر الشراء بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Create purchase error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إنشاء أمر الشراء');
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log(`📤 Updating purchase ${id}:`, data);
      const response = await purchasesApi.update(id, data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      toast.success('تم تحديث أمر الشراء بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Update purchase error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث أمر الشراء');
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`🗑️ Deleting purchase ${id}`);
      await purchasesApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.removeQueries({ queryKey: ['purchase', id] });
      toast.success('تم حذف أمر الشراء بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Delete purchase error:', error);
      toast.error('حدث خطأ في حذف أمر الشراء');
    },
  });
};

export const useReceivePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log(`📤 Receiving purchase ${id}:`, data);
      const response = await purchasesApi.receive(id, data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      toast.success('تم استلام الطلبية بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Receive purchase error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في استلام الطلبية');
    },
  });
};

export const useCancelPurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`📤 Cancelling purchase ${id}`);
      const response = await purchasesApi.cancel(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      toast.success('تم إلغاء أمر الشراء بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Cancel purchase error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إلغاء أمر الشراء');
    },
  });
};