import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_ROUTES, ROUTES, TOKEN_COOKIE } from '@/lib/constants';

// Presence check only: the API validates the token on every request,
// and the API client redirects to login on a 401.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get(TOKEN_COOKIE)?.value);
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!hasToken && !isPublic) {
    const url = new URL(ROUTES.login, req.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (hasToken && isPublic) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
