'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { title: 'إجمالي المبيعات', value: '0 ج.م', icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'المنتجات', value: '0', icon: Package, color: 'text-green-500' },
    { title: 'العملاء', value: '0', icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً {user?.first_name || user?.username} 👋</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مرحباً بك في نظام إدارة المتجر</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            هذا النظام يساعدك على إدارة المبيعات والمشتريات والمخزون والعملاء والموردين بكل سهولة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}