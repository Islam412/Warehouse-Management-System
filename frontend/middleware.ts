import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// اللغات المدعومة
const locales = ['ar', 'en'];
const defaultLocale = 'ar';

// الحصول على اللغة المفضلة من المتصفح
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
  
  // التحقق من وجود اللغة في المسار
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    // الحصول على اللغة المناسبة
    const locale = getLocaleFromBrowser(request);
    
    // إعادة التوجيه مع اللغة
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
