import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (token) {
 
    const response = NextResponse.redirect(new URL('/', request.url));
    

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};