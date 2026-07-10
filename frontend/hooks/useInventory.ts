import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/endpoints/inventory';
import { toast } from 'sonner';

export const useStocks = (params?: any) => {
  return useQuery({
    queryKey: ['stocks', params],
    queryFn: async () => {
      try {
        const response = await inventoryApi.getStocks(params);
        console.log('📊 Stocks data loaded:', response.data);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && 'results' in data) return data.results || [];
        return [];
      } catch (error) {
        console.error('❌ Error loading stocks:', error);
        throw error;
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useStock = (id: string) => {
  return useQuery({
    queryKey: ['stock', id],
    queryFn: async () => {
      const response = await inventoryApi.getStockById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ['stocks', 'low'],
    queryFn: async () => {
      const response = await inventoryApi.getLowStock();
      return response.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

export const useOverStock = () => {
  return useQuery({
    queryKey: ['stocks', 'over'],
    queryFn: async () => {
      const response = await inventoryApi.getOverStock();
      return response.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('📤 Adjusting stock:', data);
      const response = await inventoryApi.adjustStock(data);
      console.log('✅ Stock adjusted:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stocks', 'low'] });
      queryClient.invalidateQueries({ queryKey: ['stocks', 'over'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('تم تعديل المخزون بنجاح');
    },
    onError: (error: any) => {
      console.error('❌ Adjust stock error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في تعديل المخزون');
    },
  });
};

export const useWarehouses = (params?: any) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const response = await inventoryApi.getWarehouses(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 300000,
  });
};

export const useStockMovements = (params?: any) => {
  return useQuery({
    queryKey: ['movements', params],
    queryFn: async () => {
      const response = await inventoryApi.getMovements(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 60000,
  });
};