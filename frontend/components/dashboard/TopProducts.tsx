'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp } from 'lucide-react';

interface TopProduct {
  product_id: string;
  product_name: string;
  product_sku: string;
  total_quantity: number;
  total_revenue: number;
  avg_price: number;
}

interface TopProductsProps {
  products: TopProduct[];
  loading?: boolean;
}

export function TopProducts({ products, loading = false }: TopProductsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
          <CardDescription>جاري تحميل البيانات...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
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

  const maxRevenue = products.length > 0 ? Math.max(...products.map(p => p.total_revenue)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          أفضل المنتجات مبيعاً
        </CardTitle>
        <CardDescription>المنتجات الأكثر مبيعاً هذا الشهر</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium">لا توجد مبيعات هذا الشهر</p>
            </div>
          ) : (
            products.slice(0, 5).map((product, index) => {
              const percentage = maxRevenue > 0 ? (product.total_revenue / maxRevenue) * 100 : 0;
              const colors = [
                'bg-blue-500',
                'bg-emerald-500',
                'bg-purple-500',
                'bg-amber-500',
                'bg-rose-500',
              ];

              return (
                <div key={product.product_id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {product.product_sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        {product.total_revenue.toLocaleString('ar-EG')} ج.م
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.total_quantity} وحدة
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
