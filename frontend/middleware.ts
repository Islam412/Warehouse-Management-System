import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ar', 'en'];
const defaultLocale = 'ar';

function getLocaleFromBrowser(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage.split(',')[0]?.split('-')[0] || '';
  return locales.includes(preferredLocale) ? preferredLocale : defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // تجاهل مسارات API والملفات الثابتة
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // الصفحات العامة
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.some((path) => pathname.endsWith(path));

  // التحقق من المصادقة من Cookies
  const token = request.cookies.get('access_token')?.value;

  // إذا كان المستخدم مصادق ويحاول الوصول إلى صفحة عامة
  if (token && isPublicPath) {
    const dashboardUrl = new URL(`/${defaultLocale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // إذا كان غير مصادق ويحاول الوصول إلى صفحة محمية
  if (!token && !isPublicPath && !pathname.startsWith('/_next')) {
    const loginUrl = new URL(`/${defaultLocale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // معالجة اللغة
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale && !pathname.startsWith('/_next')) {
    const locale = getLocaleFromBrowser(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
