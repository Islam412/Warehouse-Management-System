"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // بيانات وهمية - سيتم استبدالها بـ API لاحقاً
  const stats = [
    { 
      title: 'إجمالي المبيعات', 
      value: '45,230 ج.م', 
      change: '+12.5%', 
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      title: 'عدد العملاء', 
      value: '1,284', 
      change: '+8.2%', 
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    { 
      title: 'المنتجات', 
      value: '356', 
      change: '+3.1%', 
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    { 
      title: 'مخزون منخفض', 
      value: '12', 
      change: '-2', 
      icon: AlertTriangle,
      color: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-900/20'
    },
  ];

  const recentSales = [
    { id: 1, customer: 'أحمد محمد', amount: '1,250 ج.م', status: 'مكتمل', date: '2026-07-04' },
    { id: 2, customer: 'سارة علي', amount: '850 ج.م', status: 'معلق', date: '2026-07-04' },
    { id: 3, customer: 'محمد حسن', amount: '2,100 ج.م', status: 'مكتمل', date: '2026-07-03' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            لوحة التحكم
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            مرحباً بك في نظام DUKA - نظرة عامة على أداء متجرك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('ar-EG', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {stat.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-${stat.color.split(' ')[1]}/30`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* المخططات والجداول */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المبيعات الأخيرة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">آخر المبيعات</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
              عرض الكل →
            </a>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{sale.customer}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{sale.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-800 dark:text-white">{sale.amount}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sale.status === 'مكتمل' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* نشاط سريع */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">نشاط سريع</h3>
          <div className="space-y-3">
            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-500/20">
              + فاتورة جديدة
            </button>
            <button className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors border border-emerald-200 dark:border-emerald-800">
              + منتج جديد
            </button>
            <button className="w-full py-2.5 px-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-medium transition-colors border border-purple-200 dark:border-purple-800">
              + عميل جديد
            </button>
            <button className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl text-sm font-medium transition-colors border border-rose-200 dark:border-rose-800">
              تقرير جديد
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
