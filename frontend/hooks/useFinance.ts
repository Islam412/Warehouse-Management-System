import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/endpoints/finance';
import { toast } from 'sonner';

export const useAccounts = (params?: any) => {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: async () => {
      try {
        const response = await financeApi.getAccounts(params);
        console.log('📊 Accounts data loaded:', response.data);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && 'results' in data) return data.results || [];
        return [];
      } catch (error) {
        console.error('❌ Error loading accounts:', error);
        throw error;
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const response = await financeApi.getAccountById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => financeApi.createAccount(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('تم إضافة الحساب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الحساب');
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financeApi.updateAccount(id, data).then(res => res.data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      toast.success('تم تحديث الحساب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث الحساب');
    },
  });
};

export const useExpenses = (params?: any) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const response = await financeApi.getExpenses(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => financeApi.createExpense(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('تم إضافة المصروف بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة المصروف');
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteExpense(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('تم حذف المصروف بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في حذف المصروف');
    },
  });
};

export const useIncomes = (params?: any) => {
  return useQuery({
    queryKey: ['incomes', params],
    queryFn: async () => {
      const response = await financeApi.getIncomes(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => financeApi.createIncome(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('تم إضافة الإيراد بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الإيراد');
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteIncome(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('تم حذف الإيراد بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في حذف الإيراد');
    },
  });
};

export const useDailyClosing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => financeApi.createTodayClosing().then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closings'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('تم إنشاء الإغلاق اليومي بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إنشاء الإغلاق اليومي');
    },
  });
};

export const useClosingSummary = () => {
  return useQuery({
    queryKey: ['closing-summary'],
    queryFn: () => financeApi.getClosingSummary().then(res => res.data),
    staleTime: 60000,
  });
};

export const useJournalEntries = (params?: any) => {
  return useQuery({
    queryKey: ['journal-entries', params],
    queryFn: async () => {
      const response = await financeApi.getJournalEntries(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 60000,
  });
};