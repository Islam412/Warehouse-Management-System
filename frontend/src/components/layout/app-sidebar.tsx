'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Warehouse,
  Wallet,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Store,
} from 'lucide-react';

const menuItems = [
  {
    group: 'الرئيسية',
    items: [
      { title: 'لوحة التحكم', icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
    group: 'المبيعات والمشتريات',
    items: [
      { title: 'المبيعات', icon: ShoppingCart, href: '/sales' },
      { title: 'المشتريات', icon: ShoppingBag, href: '/purchases' },
    ],
  },
  {
    group: 'المنتجات والمخزون',
    items: [
      { title: 'المنتجات', icon: Package, href: '/products' },
      { title: 'المخزون', icon: Warehouse, href: '/inventory' },
    ],
  },
  {
    group: 'العملاء والموردين',
    items: [
      { title: 'العملاء', icon: Users, href: '/customers' },
      { title: 'الموردين', icon: Truck, href: '/suppliers' },
    ],
  },
  {
    group: 'المالية',
    items: [
      { title: 'المالية', icon: Wallet, href: '/finance' },
      { title: 'التقارير', icon: BarChart3, href: '/reports' },
    ],
  },
  {
    group: 'الإعدادات',
    items: [
      { title: 'الإشعارات', icon: Bell, href: '/notifications' },
      { title: 'الإعدادات', icon: Settings, href: '/settings' },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Duka</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="تسجيل الخروج">
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}