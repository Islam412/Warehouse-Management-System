"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { removeTokens } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/products', label: 'المنتجات', icon: Package },
  { href: '/customers', label: 'العملاء', icon: Users },
  { href: '/suppliers', label: 'الموردين', icon: Truck },
  { href: '/sales', label: 'المبيعات', icon: ShoppingCart },
  { href: '/purchases', label: 'المشتريات', icon: ShoppingCart },
  { href: '/inventory', label: 'المخزون', icon: Warehouse },
  { href: '/finance', label: 'المالية', icon: DollarSign },
  { href: '/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/reports', label: 'التقارير', icon: FileText },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const path = pathname || '/';

  const handleLogout = () => {
    removeTokens();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return path === '/' || path === '/dashboard';
    }
    return path === href || path.startsWith(href + '/');
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleMobile}
        />
      )}

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-screen bg-background border-l border-border transition-all duration-300',
          'flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 md:hidden"
          onClick={toggleMobile}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className={cn(
          'flex items-center gap-3 h-16 px-4 border-b border-border',
          isCollapsed ? 'justify-center' : 'justify-start'
        )}>
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
            <Store className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              DUKA
            </motion.span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute -left-3 top-20 hidden md:flex rounded-full border bg-background shadow-md',
            'w-6 h-6'
          )}
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-muted hover:text-foreground',
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-primary-foreground')} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-foreground',
              isCollapsed && 'justify-center px-2'
            )}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {theme === 'dark' ? 'وضع النهار' : 'وضع الليل'}
              </motion.span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-start gap-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20',
              isCollapsed && 'justify-center px-2'
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                تسجيل الخروج
              </motion.span>
            )}
          </Button>

          {!isCollapsed && (
            <div className="flex items-center gap-3 pt-2 mt-2 border-t border-border">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">مدير النظام</p>
                <p className="text-xs text-muted-foreground truncate">admin@duka.com</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
