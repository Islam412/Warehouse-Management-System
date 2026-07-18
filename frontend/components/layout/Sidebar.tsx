// frontend/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
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
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/hooks/useNotifications';
import { logout, getAccessToken } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: unreadCount } = useUnreadCount();

  // ✅ بيانات المستخدم
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = getAccessToken();
    setIsAuthenticated(!!token);
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ جلب بيانات المستخدم والبروفايل
  const fetchUserData = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. جلب بيانات المستخدم
      const userRes = await fetch('http://localhost:8000/api/v1/auth/api/account/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        console.log('✅ User data loaded:', userData);
      } else {
        console.error('❌ Failed to load user data:', userRes.status);
      }

      // 2. جلب البروفايل
      const profileRes = await fetch('http://localhost:8000/api/v1/auth/api/profile/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        console.log('✅ Profile data loaded:', profileData);
      } else {
        console.error('❌ Failed to load profile data:', profileRes.status);
      }

    } catch (error) {
      console.error('❌ Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ استخراج اسم المستخدم - الأولوية: first_name + last_name > username > 'مستخدم'
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const username = user?.username || '';
  const email = user?.email || '';

  // ✅ الاسم المعروض
  let displayName = 'مستخدم';
  if (firstName && lastName) {
    displayName = `${firstName} ${lastName}`;
  } else if (firstName) {
    displayName = firstName;
  } else if (username) {
    displayName = username;
  }

  // ✅ الأحرف الأولى للصورة الرمزية
  let initials = 'U';
  if (firstName && lastName) {
    initials = (firstName[0] || '') + (lastName[0] || '');
  } else if (firstName) {
    initials = firstName[0] || 'U';
  } else if (username) {
    initials = username[0]?.toUpperCase() || 'U';
  }

  // ✅ صورة البروفايل
  const profileImage = profile?.cover_images || '';

  // ✅ البريد الإلكتروني للعرض
  const displayEmail = email || '';

  return (
    <>
      {/* زر القائمة للشاشات الصغيرة */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-lg bg-card shadow-lg border border-border"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* الـ Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full bg-card border-l border-border transition-all duration-300 z-40",
          "md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        {/* شعار */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-border",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              DUKA
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              D
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-1 rounded-lg hover:bg-muted transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* القائمة */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-12rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-muted",
                  isActive && "bg-primary/10 text-primary",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {item.href === '/notifications' && unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* الفاصل */}
          <div className="my-4 border-t border-border" />

          {/* ✅ الملف الشخصي مع الصورة واسم المستخدم */}
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              "hover:bg-muted",
              pathname === '/profile' && "bg-primary/10 text-primary",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={profileImage} 
                alt={displayName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  "text-sm font-medium truncate",
                  pathname === '/profile' ? "text-primary" : "text-foreground"
                )}>
                  {displayName}
                </span>
                {displayEmail && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {displayEmail}
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* ============================================
              🌗 زر تبديل الوضع (Dark/Light)
              ============================================ */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            isCollapsed ? "justify-center" : "justify-start"
          )}>
            {mounted && (
              <>
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    theme === 'light' ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                  )}
                  title="وضع فاتح"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    theme === 'dark' ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                  )}
                  title="وضع داكن"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    theme === 'system' ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                  )}
                  title="تلقائي"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                {!isCollapsed && (
                  <span className="text-xs text-muted-foreground mr-1">
                    {theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'تلقائي'}
                  </span>
                )}
              </>
            )}
          </div>

          {/* الفاصل */}
          <div className="my-2 border-t border-border" />

          {/* تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full",
              "hover:bg-destructive/10 text-destructive",
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