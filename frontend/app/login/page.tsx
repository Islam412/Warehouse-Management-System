'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  Package,
  Users,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { setTokens, getAccessToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const token = getAccessToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setTokens(data.access, data.refresh);
        router.push('/dashboard');
      } else {
        setError(data.detail || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم. تأكد من تشغيل Backend.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Package, text: 'إدارة المنتجات' },
    { icon: Users, text: 'العملاء والموردين' },
    { icon: TrendingUp, text: 'المبيعات والتقارير' },
    { icon: CheckCircle2, text: 'مخزون دقيق' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex flex-col justify-center p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Store className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">DUKA</h1>
            </div>
            <p className="text-lg text-white/80 leading-relaxed">
              نظام إدارة المتاجر المتكامل<br />
              <span className="text-white/60 text-sm">التحكم الكامل في مبيعاتك ومخزونك</span>
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <feature.icon className="w-5 h-5 text-white/80" />
                <span className="text-white/90">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>النظام يعمل بكفاءة</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md mx-auto lg:mx-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">DUKA</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">مرحباً بعودتك</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              سجل الدخول للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-white placeholder:text-gray-400"
                placeholder="admin@duka.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-white placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                تذكرني
              </label>
              <a
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-colors"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <span className="text-xl">→</span>
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              ليس لديك حساب؟{' '}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline transition-colors"
              >
                إنشاء حساب جديد
              </a>
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span>© 2026 DUKA</span>
              <span>•</span>
              <a href="#" className="hover:text-gray-600 transition-colors">الخصوصية</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-600 transition-colors">الشروط</a>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                v2.0
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
