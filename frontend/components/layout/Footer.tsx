// frontend/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Code2, 
  Briefcase,
  Store,
  Package,
  ShoppingCart,
  Users,
  Building2,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';

export function Footer() {
  // جلب بيانات الشركة من الـ Store
  const { company } = useSettingsStore();
  const currentYear = new Date().getFullYear();

  // روابط سريعة (يمكنك تعديلها حسب احتياجك)
  const quickLinks = [
    { name: 'الرئيسية', href: '/', icon: LayoutDashboard },
    { name: 'المنتجات', href: '/products', icon: Package },
    { name: 'المبيعات', href: '/sales', icon: ShoppingCart },
    { name: 'المخزون', href: '/inventory', icon: Package },
    { name: 'العملاء', href: '/customers', icon: Users },
    { name: 'الموردين', href: '/suppliers', icon: Building2 },
    { name: 'التقارير', href: '/reports', icon: FileText },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* العمود الأول: معلومات الشركة والمطور */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {company?.name || 'DUKA'}
              </h2>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {company?.description || 'نظام إدارة المتاجر المتكامل. حلول تقنية مبتكرة لإدارة أعمالك بكل احترافية.'}
            </p>
            
            {/* معلومات المطور */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>تم التطوير بواسطة</span>
                  <span className="font-bold text-blue-800 dark:text-blue-200">المهندس / إسلام حمدى</span>
                </span>
              </div>
              
              {/* زر البورتوفوليو المطور */}
              <a
                href="https://islam-portfolio-phi.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 group w-full sm:w-auto"
              >
                <Briefcase className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>زيارة البورتوفوليو</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
              روابط سريعة
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:translate-x-1 group"
                  >
                    <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* العمود الثالث: معلومات الاتصال */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
              تواصل معنا
            </h3>
            <div className="space-y-3.5">
              <a
                href={`mailto:${company?.email || 'info@duka.com'}`}
                className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{company?.email || 'info@duka.com'}</span>
              </a>
              
              <a
                href={`tel:${company?.phone || '+20123456789'}`}
                className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{company?.phone || '+20 123 456 789'}</span>
              </a>
              
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 p-2.5 rounded-xl">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{company?.address || 'القاهرة، مصر'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* شريط سفلي - حقوق النشر والمطور */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
            {currentYear} © {company?.name || 'DUKA'}. جميع الحقوق محفوظة.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              تم التطوير بواسطة
            </span>
            <a
              href="https://islam-portfolio-phi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-300"
            >
              <Code2 className="w-3 h-3" />
              <span>المهندس / إسلام حمدى</span>
              <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}