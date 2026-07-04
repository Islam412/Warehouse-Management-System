"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Warehouse,
  DollarSign,
  Bell,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/products', label: 'المنتجات', icon: Package },
  { href: '/sales', label: 'المبيعات', icon: ShoppingCart },
  { href: '/customers', label: 'العملاء', icon: Users },
  { href: '/suppliers', label: 'الموردين', icon: Truck },
  { href: '/inventory', label: 'المخزون', icon: Warehouse },
  { href: '/finance', label: 'المالية', icon: DollarSign },
  { href: '/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/reports', label: 'التقارير', icon: FileText },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-64 border-l bg-background">
      <div className="flex h-full flex-col">
        {/* الشعار */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            DUKA
          </Link>
        </div>

        {/* القائمة */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* زر الخروج */}
        <div className="border-t p-4">
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
}
