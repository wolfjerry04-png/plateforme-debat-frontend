'use client';

import { useState, useEffect, useRef } from 'react';

const LANGUES = [
  { code: 'fr', label: 'FR', nom: 'Français',       drapeau: '🇫🇷', google: 'fr' },
  { code: 'ht', label: 'KR', nom: 'Kreyòl Ayisyen', drapeau: '🇭🇹', google: 'ht' },
  { code: 'en', label: 'EN', nom: 'English',         drapeau: '🇺🇸', google: 'en' },
];

declare global {
  interface Window { google: any; googleTranslateElementInit: () => void; }
}

export default function SelecteurLangue() {
  const [ouvert, setOuvert] = useState(false);
  const [langueActuelle, setLangueActuelle] = useState('fr');
  const [enCours, setEnCours] = useState(false);
  const tentatives = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('debat-ht-lang') || 'fr';
    setLangueActuelle(saved);
    // Masquer bandeau Google Translate
    const style = document.createElement('style');
    style.id = 'gt-hide-style';
    style.textContent = `.goog-te-banner-frame,.goog-te-gadget,.skiptranslate,#google_translate_element{display:none!important}body{top:0!important}`;
    if (!document.getElementById('gt-hide-style')) document.head.appendChild(style);
  }, []);

  const appliquer = (googleCode: string): boolean => {
    const sel = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (!sel) return false;
    sel.value = googleCode;
    sel.dispatchEvent(new Event('change'));
    return true;
  };

  const changerLangue = (code: string, google: string) => {
    if (code === langueActuelle) { setOuvert(false); return; }
    setLangueActuelle(code);
    localStorage.setItem('debat-ht-lang', code);
    setOuvert(false);
    tentatives.current = 0;

    if (code === 'fr') {
      if (!appliquer('fr')) {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        window.location.reload();
      }
      return;
    }

    setEnCours(true);
    if (appliquer(google)) { setEnCours(false); return; }

    // Retry si Google Translate pas encore chargé
    const iv = setInterval(() => {
      tentatives.current++;
      if (appliquer(google) || tentatives.current > 25) {
        clearInterval(iv);
        setEnCours(false);
      }
    }, 200);
  };

  const langue = LANGUES.find(l => l.code === langueActuelle) || LANGUES[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* ✅ Bouton visible sur fond clair — texte foncé, fond beige */}
      <button
        onClick={() => setOuvert(o => !o)}
        aria-label="Changer de langue"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'var(--page2)',
          border: '1.5px solid var(--line2)',
          borderRadius: 8, padding: '5px 10px',
          color: 'var(--ink)',
          fontSize: 13, fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Helvetica Neue',Arial,sans-serif",
          minWidth: 60, justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--page3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--page2)')}
      >
        <span style={{ fontSize: 15 }}>{langue.drapeau}</span>
        <span>{enCours ? '…' : langue.label}</span>
        <span style={{ fontSize: 9, opacity: 0.5 }}>{ouvert ? '▲' : '▼'}</span>
      </button>

      {ouvert && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOuvert(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            background: 'white', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '1px solid var(--line2)',
            zIndex: 200, overflow: 'hidden', minWidth: 190,
          }}>
            <div style={{ padding: '8px 14px 6px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--line2)' }}>
              Langue du site
            </div>
            {LANGUES.map(l => (
              <button key={l.code} onClick={() => changerLangue(l.code, l.google)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px',
                background: l.code === langueActuelle ? 'var(--page2)' : 'white',
                border: 'none', borderBottom: '1px solid var(--line2)',
                cursor: 'pointer', textAlign: 'left',
              }}
                onMouseEnter={e => { if (l.code !== langueActuelle) (e.currentTarget as HTMLElement).style.background = 'var(--page2)'; }}
                onMouseLeave={e => { if (l.code !== langueActuelle) (e.currentTarget as HTMLElement).style.background = 'white'; }}
              >
                <span style={{ fontSize: 20 }}>{l.drapeau}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{l.nom}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{l.label}</div>
                </div>
                {l.code === langueActuelle && <span style={{ color: 'var(--red)', fontWeight: 800 }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
