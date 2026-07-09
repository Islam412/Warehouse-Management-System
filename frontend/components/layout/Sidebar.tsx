// frontend/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Warehouse,
  DollarSign,
  Bell,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/hooks/useNotifications';
import { logout, getAccessToken } from '@/lib/auth';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/products', icon: Package, label: 'المنتجات' },
  { href: '/customers', icon: Users, label: 'العملاء' },
  { href: '/suppliers', icon: Truck, label: 'الموردين' },
  { href: '/sales', icon: ShoppingCart, label: 'المبيعات' },
  { href: '/purchases', icon: ShoppingBag, label: 'المشتريات' },
  { href: '/inventory', icon: Warehouse, label: 'المخزون' },
  { href: '/finance', icon: DollarSign, label: 'المالية' },
  { href: '/notifications', icon: Bell, label: 'الإشعارات' },
  { href: '/reports', icon: FileText, label: 'التقارير' },
  { href: '/settings', icon: Settings, label: 'الإعدادات' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: unreadCount } = useUnreadCount();

  // التحقق من المصادقة
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
  }, []);

  const handleLogout = () => {
    logout();
  };

  // على الشاشات الصغيرة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* زر القائمة للشاشات الصغيرة */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* الـ Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-all duration-300 z-40",
          "md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        {/* شعار */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              DUKA
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              D
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* القائمة */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive && "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")} />
                  {item.href === '/notifications' && unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* الفاصل */}
          <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

          {/* الملف الشخصي */}
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              pathname === '/profile' && "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            <User className={cn("w-5 h-5 flex-shrink-0", pathname === '/profile' ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")} />
            {!isCollapsed && (
              <span className={cn(
                "text-sm font-medium",
                pathname === '/profile' ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
              )}>
                الملف الشخصي
              </span>
            )}
          </Link>

          {/* تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full",
              "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">تسجيل الخروج</span>}
          </button>
        </nav>
      </aside>

      {/* ظل خلفي للشاشات الصغيرة */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}