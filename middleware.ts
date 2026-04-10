// middleware.ts — Debat Haiti
// Protège uniquement dashboard, admin, paiement
// NE redirige PAS les utilisateurs connectés hors de /auth

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROUTES_PROTEGEES = ['/dashboard', '/admin', '/paiement'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const estProtegee = ROUTES_PROTEGEES.some(r => pathname.startsWith(r));

  // Non connecté sur page protégée → connexion
  if (estProtegee && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/connexion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/paiement/:path*'],
};
