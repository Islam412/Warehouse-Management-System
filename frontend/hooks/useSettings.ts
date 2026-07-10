import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/endpoints/settings';
import { toast } from 'sonner';

export const useCompany = () => {
  return useQuery({
    queryKey: ['company'],
    queryFn: () => settingsApi.getCompany().then(res => res.data),
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => settingsApi.updateCompany(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('تم تحديث بيانات الشركة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث بيانات الشركة');
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => settingsApi.uploadLogo(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('تم رفع الشعار بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في رفع الشعار');
    },
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings().then(res => res.data),
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => settingsApi.updateSettings(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('تم تحديث الإعدادات بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث الإعدادات');
    },
  });
};

export const useBranches = (params?: any) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const response = await settingsApi.getBranches(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => settingsApi.createBranch(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('تم إضافة الفرع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في إضافة الفرع');
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      settingsApi.updateBranch(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('تم تحديث الفرع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحديث الفرع');
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteBranch(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('تم حذف الفرع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في حذف الفرع');
    },
  });
};

export const useToggleBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.toggleBranch(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('تم تغيير حالة الفرع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تغيير حالة الفرع');
    },
  });
};

export const useSetMainBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.setMainBranch(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('تم تعيين الفرع كرئيسي بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تعيين الفرع كرئيسي');
    },
  });
};

export const usePaymentMethods = (params?: any) => {
  return useQuery({
    queryKey: ['payment-methods', params],
    queryFn: async () => {
      const response = await settingsApi.getPaymentMethods(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
};

export const useShippingMethods = (params?: any) => {
  return useQuery({
    queryKey: ['shipping-methods', params],
    queryFn: async () => {
      const response = await settingsApi.getShippingMethods(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
};

export const useSocialLinks = (params?: any) => {
  return useQuery({
    queryKey: ['social-links', params],
    queryFn: async () => {
      const response = await settingsApi.getSocialLinks(params);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'results' in data) return data.results || [];
      return [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
};