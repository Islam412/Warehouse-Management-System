import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // التحقق من المصادقة
  const token = request.cookies.get('access_token')?.value;
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  const isProtected = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/products') ||
                      pathname.startsWith('/sales') ||
                      pathname.startsWith('/customers') ||
                      pathname.startsWith('/suppliers') ||
                      pathname.startsWith('/inventory') ||
                      pathname.startsWith('/finance') ||
                      pathname.startsWith('/reports') ||
                      pathname.startsWith('/settings') ||
                      pathname.startsWith('/profile');

  // إعادة التوجيه
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};