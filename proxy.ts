// middleware.ts
// CORRECTION : le middleware protège les routes sensibles côté serveur.
// Avant, matcher était vide — n'importe qui pouvait accéder à /dashboard
// ou /admin sans être connecté en contournant le ProtectedRoute client.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessibles uniquement aux utilisateurs connectés
const ROUTES_PROTEGEES = [
  '/dashboard',
  '/admin',
  '/profil',
  '/classement',
  '/paiement',
];

// Routes accessibles uniquement aux utilisateurs NON connectés
// (évite qu'un utilisateur connecté revienne sur /connexion)
const ROUTES_AUTH = ['/auth/connexion', '/auth/inscription'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lire le token depuis le cookie (écrit par lib/auth.ts → sauvegarderSession)
  const token = request.cookies.get('access_token')?.value;

  const estProtegee = ROUTES_PROTEGEES.some((r) => pathname.startsWith(r));
  const estPageAuth = ROUTES_AUTH.some((r) => pathname.startsWith(r));

  // Pas connecté → redirige vers la connexion
  if (estProtegee && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/connexion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Déjà connecté → redirige vers le dashboard
  if (estPageAuth && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profil/:path*',
    '/classement/:path*',
    '/paiement/:path*',
    '/auth/connexion',
    '/auth/inscription',
  ],
};
