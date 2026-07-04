import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/endpoints/dashboard';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then(res => res.data),
    refetchInterval: 60000, // تحديث كل دقيقة
    staleTime: 30000,
  });
};

export const useSalesChart = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['sales-chart', period],
    queryFn: () => dashboardApi.getSalesChart(period).then(res => res.data),
    staleTime: 60000,
  });
};

export const useComparison = () => {
  return useQuery({
    queryKey: ['comparison'],
    queryFn: () => dashboardApi.getComparison().then(res => res.data),
    staleTime: 300000, // 5 دقائق
  });
};
