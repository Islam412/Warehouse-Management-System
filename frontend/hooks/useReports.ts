import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/endpoints/reports';
import { toast } from 'sonner';

export const useSalesReport = () => {
  return useMutation({
    mutationFn: (data: any) => reportsApi.sales(data).then(res => res.data),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل تقرير المبيعات');
    },
  });
};

export const usePurchasesReport = () => {
  return useMutation({
    mutationFn: (data: any) => reportsApi.purchases(data).then(res => res.data),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل تقرير المشتريات');
    },
  });
};

export const useInventoryReport = () => {
  return useMutation({
    mutationFn: (data: any) => reportsApi.inventory(data).then(res => res.data),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل تقرير المخزون');
    },
  });
};

export const useProfitLossReport = () => {
  return useMutation({
    mutationFn: (data: any) => reportsApi.profitLoss(data).then(res => res.data),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل تقرير الأرباح والخسائر');
    },
  });
};

export const useCustomersReport = () => {
  return useMutation({
    mutationFn: (data: any) => reportsApi.customers(data).then(res => res.data),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل تقرير العملاء');
    },
  });
};

export const useSuppliersReport = () => {
  return useMutation({
    mutationFn: (data: any) => reportsApi.suppliers(data).then(res => res.data),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل تقرير الموردين');
    },
  });
};

export const useReportLogs = () => {
  return useQuery({
    queryKey: ['report-logs'],
    queryFn: () => reportsApi.getLogs().then(res => res.data),
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });
};