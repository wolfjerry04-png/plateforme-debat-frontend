'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import ClochNotifications from '@/components/notifications/ClochNotifications';
import SelecteurLangue from '@/components/layout/SelecteurLangue';

function RubinMark({ size = 22 }: { size?: number }) {
  const h = Math.round(size * 1.18);
  return (
    <svg width={size} height={h} viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <path d="M11 1.2C9 3.2,6.5 5.2,4.8 7.2C3.2 9.2,2.8 11.2,3.8 13.2C4.8 15.2,6.8 17,7.5 19.8C8.2 22.4,9.2 24.2,11 24.2C12.8 24.2,13.8 22.4,14.5 19.8C15.2 17,17.2 15.2,18.2 13.2C19.2 11.2,18.8 9.2,17.2 7.2C15.5 5.2,13 3.2,11 1.2Z" fill="currentColor" />
    </svg>
  );
}

const LIENS_PRINCIPAUX = [
  { label: 'Débats',      href: '/debats' },
  { label: 'Tournois',   href: '/tournois' },
  { label: 'Formations', href: '/formations' },
  { label: 'Lives',      href: '/lives' },
];

const LIENS_PLUS = [
  { label: 'Classement',    href: '/classement' },
  { label: 'Galerie',       href: '/galerie' },
  { label: 'Organisations', href: '/organisations' },
  { label: 'Sponsors',      href: '/sponsors' },
  { label: 'Contact',       href: '/contact' },
];

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin', FORMATEUR: 'Formateur',
  APPRENANT: 'Apprenant', SPECTATEUR: 'Spectateur',
};

export default function Navbar() {
  const { estConnecte, utilisateur, _hasHydrated } = useAuthStore();
  const { seDeconnecter } = useAuth();
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [profilOuvert, setProfilOuvert] = useState(false);
  const profilRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenuOuvert(false); setProfilOuvert(false); }, [pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) setProfilOuvert(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initiales = utilisateur ? (utilisateur.prenom?.[0] || '') + (utilisateur.nom?.[0] || '') : '?';
  const isActive  = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className="dh-nav">
        <Link href="/" className="dh-logo">
          <RubinMark size={22} />
          <span>Debat Haiti</span>
          <span className="dh-logo-pipe" />
          <span className="dh-logo-sub">Les idées en face à face</span>
        </Link>

        <div className="dh-nav-links">
          {LIENS_PRINCIPAUX.map(({ label, href }) => (
            <Link key={href} href={href} className={`dh-nav-link${isActive(href) ? ' active' : ''}`}>
              {label}
            </Link>
          ))}
          <div className="dh-nav-more">
            <span className="dh-nav-more-dot" />
            <span className="dh-nav-more-dot" />
            <span className="dh-nav-more-dot" />
            <div className="dh-nav-dropdown">
              {LIENS_PLUS.map(({ label, href }) => (
                <Link key={href} href={href} className="dh-nav-dd-item">{label}</Link>
              ))}
              {_hasHydrated && utilisateur?.role === 'ADMIN' && (
                <Link href="/admin" className="dh-nav-dd-item">Administration</Link>
              )}
            </div>
          </div>
        </div>

        <div className="dh-nav-right">
          <SelecteurLangue />
          {!_hasHydrated ? null : estConnecte ? (
            <>
              <ClochNotifications />
              <div className="dh-nav-avatar-wrap" ref={profilRef}>
                <button
                  className="dh-nav-avatar"
                  onClick={() => setProfilOuvert(o => !o)}
                  title={`${utilisateur?.prenom} ${utilisateur?.nom}`}
                  aria-label="Menu profil"
                >
                  {initiales}
                </button>
                <div className={`dh-profile-dropdown${profilOuvert ? ' open' : ''}`}>
                  <div className="dh-profile-hd">
                    <div className="dh-profile-pname">{utilisateur?.prenom} {utilisateur?.nom}</div>
                    <div className="dh-profile-email">{utilisateur?.email}</div>
                    <div style={{ display:'inline-block',marginTop:'6px',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'9px',letterSpacing:'.08em',textTransform:'uppercase',padding:'2px 8px',border:'1px solid var(--line2)',color:'var(--muted)' }}>
                      {ROLE_LABEL[utilisateur?.role || ''] || utilisateur?.role}
                    </div>
                  </div>
                  <Link href="/dashboard"       className="dh-profile-lnk">Tableau de bord</Link>
                  <Link href="/profil/modifier" className="dh-profile-lnk">Mon profil</Link>
                  <Link href="/classement"      className="dh-profile-lnk">Classement</Link>
                  <Link href="/premium"         className="dh-profile-lnk">Plan Premium</Link>
                  <button className="dh-profile-logout" onClick={() => { setProfilOuvert(false); seDeconnecter(); }}>
                    Se déconnecter
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/connexion" className="dh-nav-link" style={{ border:'none' }}>Connexion</Link>
              <Link href="/auth/inscription" className="dh-nav-cta">S'inscrire</Link>
            </>
          )}
        </div>

        <button className="dh-hamburger" onClick={e => { e.stopPropagation(); setMenuOuvert(o => !o); }} aria-label="Menu">
          <span style={{ transform: menuOuvert ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
          <span style={{ opacity: menuOuvert ? 0 : 1 }} />
          <span style={{ transform: menuOuvert ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      <div className={`dh-mobile-menu${menuOuvert ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
        {estConnecte && (
          <div style={{ display:'flex',alignItems:'center',gap:'12px',padding:'14px 0',marginBottom:'4px',borderBottom:'1px solid var(--line2)' }}>
            <div className="dh-nav-avatar" style={{ width:'40px',height:'40px',fontSize:'13px' }}>{initiales}</div>
            <div>
              <div style={{ fontFamily:'Georgia,serif',fontSize:'15px',color:'var(--ink)' }}>{utilisateur?.prenom} {utilisateur?.nom}</div>
              <div style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'11px',color:'var(--muted)' }}>{ROLE_LABEL[utilisateur?.role||'']||utilisateur?.role}</div>
            </div>
          </div>
        )}
        {[...LIENS_PRINCIPAUX, ...LIENS_PLUS].map(({ label, href }) => (
          <Link key={href} href={href} className={`dh-mobile-link${isActive(href) ? ' active' : ''}`}>{label}</Link>
        ))}
        <div style={{ height:'1px',background:'var(--line2)',margin:'8px 0' }} />
        {!_hasHydrated ? null : estConnecte ? (
          <>
            {utilisateur?.role === 'ADMIN' && <Link href="/admin" className="dh-mobile-link">Administration</Link>}
            <Link href="/dashboard"       className="dh-mobile-link">Tableau de bord</Link>
            <Link href="/profil/modifier" className="dh-mobile-link">Mon profil</Link>
            <button onClick={seDeconnecter} style={{ display:'block',width:'100%',padding:'12px 0',marginTop:'8px',background:'none',border:'none',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'14px',color:'var(--red)',cursor:'pointer',textAlign:'left',borderTop:'1px solid var(--line2)' }}>
              Se déconnecter
            </button>
          </>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:'8px',paddingTop:'8px' }}>
            <Link href="/auth/connexion"   className="dh-mobile-link">Se connecter</Link>
            <Link href="/auth/inscription" className="dh-mobile-link">S'inscrire</Link>
          </div>
        )}
        <div style={{ paddingTop:'12px' }}><SelecteurLangue /></div>
      </div>
    </>
  );
}
