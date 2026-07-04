'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  ArrowLeft,
  Store,
  Package,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const features = [
    { icon: Package, text: 'إدارة المنتجات' },
    { icon: Users, text: 'العملاء والموردين' },
    { icon: TrendingUp, text: 'المبيعات والتقارير' },
    { icon: CheckCircle2, text: 'مخزون دقيق' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('البريد الإلكتروني مطلوب');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      setIsLoading(false);
      return;
    }

    try {
      // استدعاء API لإرسال رابط إعادة التعيين
      const response = await fetch('http://localhost:8000/api/v1/auth/password/reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.detail || 'حدث خطأ، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم. تأكد من تشغيل Backend.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            تم إرسال رابط إعادة التعيين! 📧
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            تم إرسال رابط إعادة تعيين كلمة المرور إلى:
          </p>
          <p className="font-medium text-blue-600 dark:text-blue-400 mb-6">
            {email}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300"
          >
            العودة إلى تسجيل الدخول
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
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
              <span className="text-white/60 text-sm">استعد كلمة المرور الخاصة بك</span>
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
          className="w-full max-w-md mx-auto lg:mx-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20"
        >
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">DUKA</h1>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى تسجيل الدخول
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">نسيت كلمة المرور؟</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
                placeholder="example@domain.com"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  إرسال رابط إعادة التعيين
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              تذكرت كلمة المرور؟{' '}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline transition-colors"
              >
                تسجيل الدخول
              </a>
            </p>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
