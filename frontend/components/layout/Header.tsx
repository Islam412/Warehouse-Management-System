// frontend/components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useUnreadCount } from '@/hooks/useNotifications';
import { getAccessToken, logout } from '@/lib/auth';
import { 
  Bell, Search, User, Menu, Moon, Sun, Monitor, Loader2, 
  Settings, LogOut, X, ShoppingCart, Package, Users, Truck, FileText, Building2,
  ArrowRight
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// أنواع نتائج البحث
interface SearchResult {
  id: string;
  type: 'customer' | 'product' | 'supplier' | 'invoice' | 'purchase';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
}

export function Header() {
  const router = useRouter();
  const company = useSettingsStore((state) => state.company);
  const updateCompany = useSettingsStore((state) => state.updateCompany);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ جلب عدد الإشعارات
  const { data: unreadCount, refetch: refetchUnread } = useUnreadCount();

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    const interval = setInterval(() => {
      refetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ جلب بيانات المستخدم
  const fetchUserData = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userRes = await fetch('http://localhost:8000/api/v1/auth/api/account/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

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

  // ✅ البحث الشامل
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const token = getAccessToken();
    const results: SearchResult[] = [];

    try {
      // 1. البحث عن العملاء
      const customersRes = await fetch(
        `http://localhost:8000/api/v1/customers/api/customers/?search=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (customersRes.ok) {
        const data = await customersRes.json();
        const customers = Array.isArray(data) ? data : data.results || [];
        customers.slice(0, 5).forEach((c: any) => {
          results.push({
            id: c.id,
            type: 'customer',
            title: c.name,
            subtitle: `📞 ${c.phone}${c.email ? ` | ✉️ ${c.email}` : ''}`,
            icon: <Users className="w-4 h-4 text-blue-500" />,
            link: `/customers/${c.id}`,
          });
        });
      }

      // 2. البحث عن المنتجات
      const productsRes = await fetch(
        `http://localhost:8000/api/v1/products/api/products/?search=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (productsRes.ok) {
        const data = await productsRes.json();
        const products = Array.isArray(data) ? data : data.results || [];
        products.slice(0, 5).forEach((p: any) => {
          results.push({
            id: p.id,
            type: 'product',
            title: p.name,
            subtitle: `🔖 ${p.sku}${p.barcode ? ` | 📊 ${p.barcode}` : ''}`,
            icon: <Package className="w-4 h-4 text-green-500" />,
            link: `/products/${p.id}`,
          });
        });
      }

      // 3. البحث عن الموردين
      const suppliersRes = await fetch(
        `http://localhost:8000/api/v1/suppliers/api/suppliers/?search=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        const suppliers = Array.isArray(data) ? data : data.results || [];
        suppliers.slice(0, 5).forEach((s: any) => {
          results.push({
            id: s.id,
            type: 'supplier',
            title: s.name,
            subtitle: `📞 ${s.phone}${s.email ? ` | ✉️ ${s.email}` : ''}`,
            icon: <Truck className="w-4 h-4 text-purple-500" />,
            link: `/suppliers/${s.id}`,
          });
        });
      }

      // 4. البحث عن الفواتير
      const invoicesRes = await fetch(
        `http://localhost:8000/api/v1/sales/api/invoices/?search=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        const invoices = Array.isArray(data) ? data : data.results || [];
        invoices.slice(0, 5).forEach((inv: any) => {
          results.push({
            id: inv.id,
            type: 'invoice',
            title: inv.invoice_number || 'فاتورة',
            subtitle: `👤 ${inv.customer_name || inv.customer?.name || 'غير معروف'} | 💰 ${inv.total} ج.م`,
            icon: <FileText className="w-4 h-4 text-amber-500" />,
            link: `/invoice/${inv.id}`,
          });
        });
      }

      // 5. البحث عن أوامر الشراء
      const purchasesRes = await fetch(
        `http://localhost:8000/api/v1/purchases/api/orders/?search=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (purchasesRes.ok) {
        const data = await purchasesRes.json();
        const orders = Array.isArray(data) ? data : data.results || [];
        orders.slice(0, 5).forEach((o: any) => {
          results.push({
            id: o.id,
            type: 'purchase',
            title: o.order_number || 'أمر شراء',
            subtitle: `🏭 ${o.supplier_name || o.supplier?.name || 'غير معروف'} | 💰 ${o.total} ج.م`,
            icon: <ShoppingCart className="w-4 h-4 text-indigo-500" />,
            link: `/purchases/${o.id}`,
          });
        });
      }

      setSearchResults(results.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ رفع شعار الشركة
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة صحيح');
      return;
    }

    setIsUploadingLogo(true);
    const token = getAccessToken();

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('http://localhost:8000/api/v1/settings/api/company/upload-logo/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await updateCompany({ logo: data.logo_url || data.logo });
        toast.success('✅ تم تحديث شعار الشركة بنجاح');
        fetchUserData();
      } else {
        toast.error('❌ فشل رفع الشعار');
      }
    } catch (error) {
      toast.error('حدث خطأ في رفع الشعار');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-2">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="relative group">
            {company?.logo ? (
              <img 
                src={company.logo} 
                alt={company.name || 'DUKA'} 
                className="h-8 w-8 rounded-full object-cover border-2 border-primary/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {(company?.name || 'D')?.[0]}
              </div>
            )}
            {/* زر رفع اللوجو */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingLogo}
              className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              title="تغيير شعار الشركة"
            >
              {isUploadingLogo ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
          <span className="font-bold text-lg hidden sm:block">
            {company?.name || 'DUKA'}
          </span>
        </Link>

        {/* ✅ شريط البحث - يظهر في المنتصف */}
        <div className="flex-1 max-w-2xl mx-2 md:mx-4 relative">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="بحث عن عميل، منتج، مورد، فاتورة، باركود..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                // تأخير الإغلاق للسماح بالنقر على النتائج
                setTimeout(() => setIsSearchOpen(false), 300);
              }}
              className="w-full pl-4 pr-8 bg-muted/50 text-sm h-9"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ✅ نتائج البحث */}
          {isSearchOpen && (searchResults.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover rounded-lg shadow-lg border border-border overflow-hidden z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري البحث...
                </div>
              ) : (
                <>
                  <div className="p-2 text-xs text-muted-foreground border-b">
                    {searchResults.length} نتيجة
                  </div>
                  {searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.link}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div className="flex-shrink-0">{result.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {result.type === 'customer' && 'عميل'}
                        {result.type === 'product' && 'منتج'}
                        {result.type === 'supplier' && 'مورد'}
                        {result.type === 'invoice' && 'فاتورة'}
                        {result.type === 'purchase' && 'شراء'}
                      </Badge>
                    </Link>
                  ))}
                  <div className="p-2 border-t text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-muted-foreground w-full"
                      onClick={() => {
                        setIsSearchOpen(false);
                        // يمكن توجيه إلى صفحة البحث المتقدم
                      }}
                    >
                      عرض جميع النتائج <ArrowRight className="w-3 h-3 mr-1" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
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

          {/* ✅ زر الإشعارات */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount !== undefined && unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
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

// استيراد Camera
import { Camera } from 'lucide-react';