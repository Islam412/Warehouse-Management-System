'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StockAlert {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  min_quantity: number;
}

interface StockAlertsProps {
  lowStock: StockAlert[];
  totalProducts: number;
  loading?: boolean;
}

export function StockAlerts({ lowStock, totalProducts, loading = false }: StockAlertsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تنبيهات المخزون</CardTitle>
          <CardDescription>جاري تحميل التنبيهات...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          تنبيهات المخزون
        </CardTitle>
        <CardDescription>
          {lowStock.length > 0
            ? `هناك ${lowStock.length} منتج يحتاج إلى إعادة طلب`
            : 'جميع المنتجات في المخزون الكافي'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* إجمالي المنتجات */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                إجمالي المنتجات
              </span>
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {totalProducts}
            </span>
          </div>

          {/* المنخفضة */}
          {lowStock.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                المنتجات المنخفضة:
              </p>
              {lowStock.slice(0, 5).map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SKU: {item.product_sku}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {item.quantity} / {item.min_quantity}
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400">منخفض</p>
                  </div>
                </div>
              ))}
              {lowStock.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 dark:text-blue-400">
                  عرض {lowStock.length - 5} منتجات أخرى
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium">جميع المنتجات في المخزون الكافي</p>
              <p className="text-xs mt-1">لا توجد تنبيهات حالياً</p>
            </div>
          )}

          <Link href="/inventory" className="block">
            <Button variant="outline" size="sm" className="w-full text-xs">
              إدارة المخزون
              <ArrowLeft className="w-3 h-3 mr-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
