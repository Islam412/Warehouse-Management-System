'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'sale' | 'purchase' | 'customer' | 'product' | 'return';
  title: string;
  description: string;
  amount?: number;
  time: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

const activityIcons = {
  sale: ShoppingCart,
  purchase: Package,
  customer: Users,
  product: Package,
  return: TrendingUp,
};

const activityColors = {
  sale: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  purchase: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  customer: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  product: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  return: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
};

const statusColors = {
  completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>النشاطات الأخيرة</CardTitle>
          <CardDescription>جاري تحميل النشاطات...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          النشاطات الأخيرة
        </CardTitle>
        <CardDescription>آخر النشاطات في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              لا توجد نشاطات حديثة
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type] || Package;
              const colorClass = activityColors[activity.type] || activityColors.product;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`p-2.5 rounded-xl ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(activity.time), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                      {activity.status && (
                        <Badge className={`text-xs ${statusColors[activity.status]}`}>
                          {activity.status === 'completed' && 'مكتمل'}
                          {activity.status === 'pending' && 'معلق'}
                          {activity.status === 'cancelled' && 'ملغي'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-semibold text-gray-800 dark:text-white flex-shrink-0">
                      {activity.amount.toLocaleString('ar-EG')} ج.م
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
