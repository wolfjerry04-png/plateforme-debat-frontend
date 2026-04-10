'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

function RubinMark({ size = 32 }: { size?: number }) {
  const h = Math.round(size * 1.18);
  return (
    <svg width={size} height={h} viewBox="0 0 22 26" fill="none">
      <path d="M11 1.2C9 3.2,6.5 5.2,4.8 7.2C3.2 9.2,2.8 11.2,3.8 13.2C4.8 15.2,6.8 17,7.5 19.8C8.2 22.4,9.2 24.2,11 24.2C12.8 24.2,13.8 22.4,14.5 19.8C15.2 17,17.2 15.2,18.2 13.2C19.2 11.2,18.8 9.2,17.2 7.2C15.5 5.2,13 3.2,11 1.2Z" fill="currentColor"/>
    </svg>
  );
}

export default function PageConnexion() {
  const { seConnecter, chargement } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMDP, setVoirMDP] = useState(false);
  const [erreur, setErreur] = useState('');

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setErreur('Email invalide'); return; }
    setErreur('');
    try {
      await seConnecter(email, motDePasse);
    } catch {
      setErreur('Email ou mot de passe incorrect');
    }
  };

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '18px 18px 18px 52px',
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12, fontSize: 16, outline: 'none',
    color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif",
    boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #071220 0%, #0D1B2A 30%, #142236 60%, #0A1525 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Photo fond */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.35 }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,18,32,0.7) 0%, rgba(10,21,37,0.6) 50%, rgba(7,18,32,0.9) 100%)' }}/>

      {/* Contenu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,32px) 0', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, color: 'white' }}>
            <RubinMark size={28}/>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 'normal' }}>
              Débat sur <strong>Haïti</strong>
            </span>
          </div>
          <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }}/>
          <p style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(14px,2vw,18px)', color: 'rgba(255,255,255,0.75)' }}>
            Bienvenue à nouveau dans la communauté.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={soumettre} style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.6 }}>✉️</span>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErreur(''); }} placeholder="E-mail" required style={inpStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}/>
          </div>

          {/* Mot de passe */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.6 }}>🔒</span>
            <input type={voirMDP ? 'text' : 'password'} value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="Mot de passe" required style={{ ...inpStyle, paddingRight: 48 }}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}/>
            <button type="button" onClick={() => setVoirMDP(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>
              {voirMDP ? '🙈' : '👁'}
            </button>
          </div>

          {/* Mot de passe oublié */}
          <div style={{ textAlign: 'center' }}>
            <Link href="/auth/mot-de-passe-oublie" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Erreur */}
          {erreur && (
            <div style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#FCA5A5', fontFamily: "'Helvetica Neue',Arial,sans-serif", textAlign: 'center' }}>
              ⚠ {erreur}
            </div>
          )}

          {/* Bouton Se connecter */}
          <button type="submit" disabled={chargement} style={{
            width: '100%', padding: '18px',
            background: chargement ? 'rgba(220,85,20,0.6)' : 'linear-gradient(135deg, #E8590C, #C0440A)',
            color: 'white', border: 'none', borderRadius: 100,
            fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 18,
            cursor: chargement ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 32px rgba(220,85,20,0.45)', marginTop: 4,
          }}>
            {chargement ? '⏳ Connexion…' : 'Se connecter'}
          </button>

          {/* ✅ LIEN S'INSCRIRE — corrigé et bien visible */}
          <div style={{
            textAlign: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '14px',
          }}>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>
              Pas encore de compte ?{' '}
            </span>
            <Link
              href="/auth/inscription"
              style={{
                color: '#FFB347',
                fontWeight: 800,
                textDecoration: 'none',
                fontSize: 15,
                fontFamily: "'Helvetica Neue',Arial,sans-serif",
                borderBottom: '2px solid rgba(255,179,71,0.4)',
                paddingBottom: 1,
              }}
            >
              S'inscrire gratuitement →
            </Link>
          </div>

          {/* Lien retour accueil */}
          <div style={{ textAlign: 'center' }}>
            <Link href="/" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </form>
      </div>

      {/* Sponsors */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 40, paddingBottom: 28 }}>
        <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }}/>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '0 clamp(16px,4vw,48px)' }}>
          {[
            { nom: 'AyiboPost', bg: 'white', color: '#0D1B2A' },
            { nom: 'YWCA Haïti', bg: 'white', color: '#0D1B2A' },
            { nom: 'DECATHLON', bg: '#006FBA', color: 'white' },
            { nom: 'eiffortic Haïti', bg: 'white', color: '#0D1B2A' },
            { nom: 'Sun Auto', bg: 'white', color: '#0D1B2A' },
          ].map(p => (
            <div key={p.nom} style={{ background: p.bg, color: p.color, padding: '9px 18px', borderRadius: 7, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              {p.nom}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
