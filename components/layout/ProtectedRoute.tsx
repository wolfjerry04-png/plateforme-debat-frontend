'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: React.ReactNode;
  rolesAutorises?: string[];
}

export default function ProtectedRoute({ children, rolesAutorises }: Props) {
  const router = useRouter();
  const estConnecte = useAuthStore(s => s.estConnecte);
  const utilisateur = useAuthStore(s => s.utilisateur);
  const hasHydrated = useAuthStore(s => s._hasHydrated);

  // Attendre l'hydratation (évite le flash)
  if (!hasHydrated) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--line2)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Non connecté — afficher une invitation douce, PAS une redirection forcée
  if (!estConnecte) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page)', padding: 'clamp(32px,5vw,64px) 24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          {/* Illustration */}
          <div style={{ fontSize: 56, marginBottom: 20 }}>🔐</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 'normal', color: 'var(--ink)', marginBottom: 12 }}>
            Connectez-vous pour accéder
          </h2>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>
            Cette section est réservée aux membres de la communauté Débat Haïti. L'inscription est gratuite et prend moins d'une minute.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/connexion" style={{ padding: '13px 28px', background: 'var(--red)', color: 'white', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, borderRadius: 8, boxShadow: '0 4px 16px rgba(192,50,26,0.3)' }}>
              Se connecter
            </Link>
            <Link href="/auth/inscription" style={{ padding: '13px 28px', background: 'var(--page2)', border: '1.5px solid var(--line2)', color: 'var(--ink)', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, borderRadius: 8 }}>
              S'inscrire gratuitement
            </Link>
          </div>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
            Pas encore convaincu ?{' '}
            <Link href="/" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>
              Explorer la plateforme ↗
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Connecté mais mauvais rôle
  if (rolesAutorises && utilisateur?.role && !rolesAutorises.includes(utilisateur.role)) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 'normal', color: 'var(--ink)', marginBottom: 10 }}>
            Accès restreint
          </h2>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Vous n'avez pas les permissions pour accéder à cette section.
          </p>
          <Link href="/dashboard" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: 'var(--page)', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, borderRadius: 8 }}>
            ← Tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
