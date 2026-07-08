import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPages = ['/login', '/register', '/forgot-password'];
const protectedPages = ['/dashboard', '/products', '/customers', '/suppliers', '/sales', '/purchases', '/inventory', '/finance', '/notifications', '/reports', '/settings', '/profile'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('🔍 Middleware - Path:', pathname);

  // تجاهل مسارات API والملفات الثابتة
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAuthPage = authPages.some(page => pathname === page || pathname.startsWith(page + '/'));
  const isProtectedPage = protectedPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  console.log('🔐 Is auth page:', isAuthPage);
  console.log('🛡️ Is protected page:', isProtectedPage);

  const token = request.cookies.get('access_token')?.value;

  // إذا كان المستخدم مصادق ويحاول الوصول إلى صفحة تسجيل الدخول
  if (token && isAuthPage) {
    console.log('➡️ Redirecting to dashboard (authenticated)');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // إذا كان غير مصادق ويحاول الوصول إلى صفحة محمية
  if (!token && isProtectedPage) {
    console.log('➡️ Redirecting to login (unauthenticated)');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
