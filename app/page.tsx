'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

/* ── Vase de Rubin SVG ── */
function RubinVase() {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '300px' }}
      aria-label="Illusion du vase de Rubin — deux visages ou un vase"
    >
      {/* Profil gauche */}
      <path
        d="M0 0 L160 0
           C148 22,132 32,118 44
           C108 53,100 62,96 72
           C90 84,90 96,96 106
           C104 118,116 124,122 132
           C132 144,134 156,128 170
           C122 182,112 190,106 200
           C98 212,96 222,100 232
           C105 244,116 252,126 262
           C136 272,144 282,146 294
           C148 306,146 320,140 332
           C134 344,126 352,122 358
           C116 366,116 374,122 380
           C130 388,144 392,160 392
           L0 392 Z"
        fill="#F4F0E9"
      />
      {/* Profil droit */}
      <path
        d="M320 0 L160 0
           C172 22,188 32,202 44
           C212 53,220 62,224 72
           C230 84,230 96,224 106
           C216 118,204 124,198 132
           C188 144,186 156,192 170
           C198 182,208 190,214 200
           C222 212,224 222,220 232
           C215 244,204 252,194 262
           C184 272,176 282,174 294
           C172 306,174 320,180 332
           C186 344,194 352,198 358
           C204 366,204 374,198 380
           C190 388,176 392,160 392
           L320 392 Z"
        fill="#F4F0E9"
      />
      {/* Axe de symétrie */}
      <line x1="160" y1="40" x2="160" y2="360" stroke="#F4F0E9" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 6" />
    </svg>
  );
}

/* ── Mini carte débat live ── */
function LiveDebatCard({ titre, pour, contre, total }: { titre: string; pour: number; contre: number; total: number }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(17,20,24,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span className="dh-live-dot" />
        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '9px', letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--red)' }}>En direct</span>
      </div>
      <p style={{ fontFamily: 'Georgia,serif', fontSize: '14px', lineHeight: '1.4', marginBottom: '12px' }}>{titre}</p>
      <div style={{ height: '2px', background: 'var(--line2)', position: 'relative', overflow: 'hidden', marginBottom: '6px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pour}%`, background: 'var(--ink)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: `${contre}%`, background: 'var(--red)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '11px', color: 'var(--muted)' }}>
        <span>Pour — {pour}%</span>
        <span style={{ color: 'var(--red)' }}>Contre — {contre}%</span>
      </div>
    </div>
  );
}

export default function PageAccueil() {
  const { estConnecte } = useAuthStore();
  const [sponsors, setSponsors]   = useState<any[]>([]);
  const [sponsorIdx, setSponsorIdx] = useState(0);
  const [sponsorVis, setSponsorVis] = useState(true);

  useEffect(() => {
    api.get('/sponsoring/sponsors')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setSponsors(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sponsors.length < 2) return;
    const t = setTimeout(() => {
      setSponsorVis(false);
      setTimeout(() => { setSponsorIdx(i => (i + 1) % sponsors.length); setSponsorVis(true); }, 400);
    }, 4000);
    return () => clearTimeout(t);
  }, [sponsorIdx, sponsors]);

  const sponsor = sponsors[sponsorIdx];

  return (
    <div>
      {/* ══════════════ HERO ══════════════ */}
      <section className="dh-hero">

        {/* ── Gauche : Manifeste ── */}
        <div className="dh-hero-left">
          <div className="dh-eyebrow">Le débat comme discipline de l'esprit</div>
          <h1 className="dh-hero-h1">
            Une idée ne tient<br />
            que <em>confrontée</em><br />
            à son contraire.
          </h1>
          <p className="dh-hero-body">
            Debat Haiti est un espace de délibération ouvert sur les grandes questions.
            Chaque position engage une réfutation. Chaque argument cherche son adversaire.
          </p>
          <div className="dh-hero-cta">
            {estConnecte ? (
              <Link href="/debats" className="dh-btn">Explorer les débats</Link>
            ) : (
              <>
                <Link href="/auth/inscription" className="dh-btn">Rejoindre</Link>
                <Link href="/auth/connexion"   className="dh-btn dh-btn-outline">Se connecter</Link>
              </>
            )}
          </div>
        </div>

        {/* ── Centre : Vase de Rubin ── */}
        <div className="dh-hero-center">
          <RubinVase />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '280px', marginTop: '24px' }}>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '10px', letterSpacing: '.10em', textTransform: 'uppercase', color: 'rgba(244,240,233,0.35)' }}>Le vase</span>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '10px', letterSpacing: '.10em', textTransform: 'uppercase', color: 'rgba(244,240,233,0.35)' }}>Les visages</span>
          </div>
          <p style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: '12px', color: 'rgba(244,240,233,0.32)', marginTop: '16px', textAlign: 'center', letterSpacing: '0.03em' }}>
            Deux lectures. Une seule vérité.
          </p>
        </div>

        {/* ── Droite : Débat live + partenaire ── */}
        <div className="dh-hero-right">
          <LiveDebatCard
            titre="La réforme de la Constitution haïtienne est-elle nécessaire ?"
            pour={63}
            contre={37}
            total={142}
          />
          <LiveDebatCard
            titre="L'économie informelle : frein ou moteur pour Haïti ?"
            pour={44}
            contre={56}
            total={89}
          />
          <div style={{ paddingTop: '20px' }}>
            <Link href="/debats" className="dh-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '10px' }}>
              Voir tous les débats
            </Link>
          </div>

          {/* Partenaire */}
          {(sponsor || true) && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--line2)' }}>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                Partenaire
              </div>
              {sponsor ? (
                <div style={{ transition: 'opacity 0.4s', opacity: sponsorVis ? 1 : 0 }}>
                  {sponsor.logoUrl && !sponsor.logoUrl.startsWith('#') ? (
                    <img src={sponsor.logoUrl} alt={sponsor.nom} style={{ height: '28px', maxWidth: '120px', objectFit: 'contain', filter: 'brightness(0)', opacity: '.6' }} />
                  ) : (
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: '14px', color: 'var(--ink)' }}>{sponsor.nom}</span>
                  )}
                </div>
              ) : (
                <Link href="/contact" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '11px', color: 'var(--muted)', textDecoration: 'none' }}>
                  Devenir partenaire
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Stats bas gauche ── */}
        <div className="dh-hero-stats">
          {[['500+', 'Débatteurs'], ['50+', 'Formations'], ['20+', 'Tournois']].map(([n, l]) => (
            <div key={l}>
              <div className="dh-stat-num">{n}</div>
              <div className="dh-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ SECTION RÔLES ══════════════ */}
      <section style={{ padding: '72px 40px', borderTop: '1px solid var(--line2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', paddingBottom: '20px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '28px', fontWeight: 'normal', letterSpacing: '-.015em' }}>
              Une plateforme pour chaque rôle
            </h2>
            {!estConnecte && (
              <Link href="/auth/inscription" className="dh-btn" style={{ fontSize: '10px' }}>Créer un compte</Link>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--line2)' }}>
            {[
              { role: 'Admin',      desc: 'Gère la plateforme, les tournois et les utilisateurs.', accent: 'var(--blue)' },
              { role: 'Formateur',  desc: 'Crée les débats, anime les sessions et suit les apprenants.', accent: 'var(--ink)' },
              { role: 'Apprenant',  desc: 'Participe aux débats, vote et accède aux formations.', accent: 'var(--green)' },
              { role: 'Spectateur', desc: 'Observe les débats en direct sans prise de position.', accent: 'var(--red)' },
            ].map(({ role, desc, accent }) => (
              <div key={role} style={{ background: 'var(--page)', padding: '32px 28px' }}>
                <div style={{ width: '28px', height: '3px', background: accent, marginBottom: '16px' }} />
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '18px', marginBottom: '10px' }}>{role}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      {!estConnecte && (
        <section style={{ padding: '80px 40px', background: 'var(--ink)', textAlign: 'center' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            {/* Mini vase */}
            <svg width="32" height="38" viewBox="0 0 32 38" fill="none" style={{ marginBottom: '24px', opacity: .35 }}>
              <path d="M16 2C12.5 5,9 8,7 11C5 14,4.5 17,5.5 20C6.5 22,9 24,10 27C11.5 30,11.5 33,10 35.5C12 37,14 37.5,16 37.5C18 37.5,20 37,22 35.5C20.5 33,20.5 30,22 27C23 24,25.5 22,26.5 20C27.5 17,27 14,25 11C23 8,19.5 5,16 2Z" fill="#F4F0E9"/>
            </svg>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '32px', fontWeight: 'normal', color: 'var(--page)', marginBottom: '14px', letterSpacing: '-.015em' }}>
              Prêt à débattre ?
            </h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '14px', color: 'rgba(244,240,233,0.50)', lineHeight: '1.7', marginBottom: '36px' }}>
              Rejoignez la communauté. Gratuit pour commencer.
            </p>
            <Link href="/auth/inscription" className="dh-btn dh-btn-inv">
              Créer mon compte
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: 'var(--page2)', padding: '32px 40px', borderTop: '1px solid var(--line2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '11px', color: 'var(--muted)' }}>
            Debat Haiti — Tous droits réservés 2026
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[['Débats', '/debats'], ['Formations', '/formations'], ['Tournois', '/tournois'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '.04em', transition: 'color .15s' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
