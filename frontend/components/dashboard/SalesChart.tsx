'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SalesChartProps {
  data: Array<{ date: string; sales: number }>;
  period: string;
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  loading?: boolean;
}

const periods = [
  { value: 'day', label: 'يوم' },
  { value: 'week', label: 'أسبوع' },
  { value: 'month', label: 'شهر' },
  { value: 'year', label: 'سنة' },
];

export function SalesChart({
  data,
  period,
  onPeriodChange,
  loading = false,
}: SalesChartProps) {
  const [hoveredData, setHoveredData] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-EG')} ج.م`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>المبيعات اليومية</CardTitle>
          <CardDescription>جاري تحميل البيانات...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>المبيعات اليومية</CardTitle>
          <CardDescription>آخر {period === 'day' ? '24 ساعة' : period === 'week' ? '7 أيام' : period === 'month' ? '30 يوم' : '12 شهر'}</CardDescription>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant="ghost"
              size="sm"
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                period === p.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              onClick={() => onPeriodChange(p.value as 'day' | 'week' | 'month' | 'year')}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            لا توجد بيانات
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              onMouseMove={(state) => {
                if (state.activeTooltipIndex !== undefined) {
                  setHoveredData(state.activePayload?.[0]?.payload);
                }
              }}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="text-gray-500 dark:text-gray-400"
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                className="text-gray-500 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#salesGradient)"
                activeDot={{ r: 6, className: 'fill-blue-500' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
