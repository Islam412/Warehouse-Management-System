// frontend/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useUnreadCount } from '@/hooks/useNotifications';
import { getAccessToken, logout } from '@/lib/auth';
import { Bell, Search, User, Menu, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const router = useRouter();
  const company = useSettingsStore((state) => state.company);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ جلب عدد الإشعارات غير المقروءة
  const { data: unreadCount, refetch: refetchUnread } = useUnreadCount();

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    // تحديث الإشعارات كل 30 ثانية
    const interval = setInterval(() => {
      refetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // جلب بيانات المستخدم
      const userRes = await fetch('http://localhost:8000/api/v1/auth/api/account/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      // جلب البروفايل
      const profileRes = await fetch('http://localhost:8000/api/v1/auth/api/profile/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.username || 'مستخدم';
  
  const initials = (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') || user?.username?.[0] || 'U';
  const profileImage = profile?.cover_images || '';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo واسم الشركة */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {company?.logo ? (
            <img 
              src={company.logo} 
              alt={company.name || 'DUKA'} 
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {(company?.name || 'D')?.[0]}
            </div>
          )}
          <span className="font-bold text-lg hidden sm:block">
            {company?.name || 'DUKA'}
          </span>
        </Link>

        {/* Search - مخفي على الشاشات الصغيرة */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث..."
              className="w-full pl-4 pr-8 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                title="فاتح"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                title="داكن"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                title="تلقائي"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ✅ زر الإشعارات مع العدد */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount !== undefined && unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* ✅ قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage 
                    src={profileImage} 
                    alt={fullName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                  <User className="h-4 w-4" />
                  الملف الشخصي
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// إضافة الاستيرادات المفقودة
import { Settings, LogOut } from 'lucide-react';