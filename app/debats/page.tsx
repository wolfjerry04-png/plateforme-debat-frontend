'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const MOCK_DEBATS = [
  { id: '1', titre: 'La réforme de la Constitution haïtienne est-elle nécessaire ?', description: 'Analyses des enjeux constitutionnels et démocratiques en Haïti.', statut: 'OUVERT', categorie: 'Politique', dateDebut: new Date(Date.now() - 3600000).toISOString(), vues: 142, _count: { messages: 38 }, image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80' },
  { id: '2', titre: "L'économie informelle : frein ou moteur pour Haïti ?", description: "Débat sur le rôle du secteur informel dans l'économie haïtienne.", statut: 'OUVERT', categorie: 'Économie', dateDebut: new Date(Date.now() - 7200000).toISOString(), vues: 89, _count: { messages: 21 }, image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80' },
  { id: '3', titre: "Égalité hommes-femmes dans la société haïtienne", description: 'Débat sur les inégalités de genre et les solutions possibles.', statut: 'OUVERT', categorie: 'Société', dateDebut: new Date(Date.now() - 604800000).toISOString(), vues: 312, _count: { messages: 57 }, image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { id: '4', titre: 'La place de la religion dans la politique haïtienne', description: "Quelle est l'influence des Églises sur les décisions politiques ?", statut: 'BROUILLON', categorie: 'Religion', dateDebut: new Date(Date.now() + 86400000).toISOString(), vues: 0, _count: { messages: 0 }, image: '' },
  { id: '5', titre: 'Philosophie du droit et justice sociale en Haïti', description: 'Entre idéal philosophique et réalité judiciaire haïtienne.', statut: 'BROUILLON', categorie: 'Philosophie', dateDebut: new Date(Date.now() + 172800000).toISOString(), vues: 0, _count: { messages: 0 }, image: '' },
];

const CATEGORIES = [
  { id: 'tous', label: 'Tous' },
  { id: 'Politique', label: '⚖️ Politique' },
  { id: 'Économie', label: '💰 Économie' },
  { id: 'Religion', label: '✝️ Religion' },
  { id: 'Philosophie', label: '🧠 Philosophie' },
  { id: 'Société', label: '🌍 Société' },
  { id: 'ouverts', label: '💬 Débats ouverts' },
];

const CAT_COLORS: Record<string, string> = {
  Politique: '#7C3AED', Économie: '#D97706', Religion: '#DC2626',
  Philosophie: '#2563EB', Société: '#059669', Culture: '#DB2777', Éducation: '#0891B2',
};

const CAT_BG: Record<string, string> = {
  Politique: 'rgba(124,58,237,0.1)', Économie: 'rgba(217,119,6,0.1)',
  Religion: 'rgba(220,38,38,0.1)', Philosophie: 'rgba(37,99,235,0.1)',
  Société: 'rgba(5,150,105,0.1)', Culture: 'rgba(219,39,119,0.1)', Éducation: 'rgba(8,145,178,0.1)',
};

// Couleurs de fond par catégorie pour les cartes sans image
const CAT_CARD_BG: Record<string, string> = {
  Politique: 'linear-gradient(135deg, #1e1b4b, #312e81)',
  Économie: 'linear-gradient(135deg, #78350f, #92400e)',
  Religion: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
  Philosophie: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
  Société: 'linear-gradient(135deg, #064e3b, #065f46)',
  Culture: 'linear-gradient(135deg, #701a75, #86198f)',
  default: 'linear-gradient(135deg, #1f2937, #374151)',
};

const CATEGORIES_ADMIN = ['Politique', 'Économie', 'Religion', 'Philosophie', 'Société', 'Culture', 'Éducation'];
const FORM_VIDE = { titre: '', description: '', categorie: 'Politique', statut: 'BROUILLON', dateDebut: '' };

export default function PageDebats() {
  const { estConnecte, utilisateur } = useAuthStore();
  const [debats, setDebats] = useState<any[]>(MOCK_DEBATS);
  const [filtre, setFiltre] = useState('tous');
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [debatEnEdition, setDebatEnEdition] = useState<any>(null);
  const [form, setForm] = useState<any>(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '');
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    fetch(API_URL + '/debats', { headers: { Authorization: 'Bearer ' + getToken() } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length) setDebats(data); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const debatsOuverts = debats.filter(d => d.statut === 'OUVERT');
  const debatsProgrammes = debats.filter(d => d.statut === 'BROUILLON');

  const filtrer = (d: any) => {
    if (filtre === 'tous') return true;
    if (filtre === 'ouverts') return d.statut === 'OUVERT';
    return d.categorie === filtre;
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    const method = debatEnEdition ? 'PATCH' : 'POST';
    const url = API_URL + '/debats' + (debatEnEdition ? '/' + debatEnEdition.id : '');
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify({ ...form, dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : new Date().toISOString() }) });
      const data = await res.json();
      if (debatEnEdition) setDebats(prev => prev.map(d => d.id === debatEnEdition.id ? { ...d, ...data } : d));
      else setDebats(prev => [data, ...prev]);
    } catch {
      if (!debatEnEdition) setDebats(prev => [{ id: Date.now().toString(), ...form, dateDebut: form.dateDebut || new Date().toISOString(), vues: 0, _count: { messages: 0 } }, ...prev]);
    }
    setModalOuvert(false); setDebatEnEdition(null); setForm(FORM_VIDE); setEnvoi(false);
  };

  const supprimerDebat = async (id: string) => {
    if (!confirm('Supprimer ce débat ?')) return;
    try { await fetch(API_URL + '/debats/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + getToken() } }); } catch {}
    setDebats(prev => prev.filter(d => d.id !== id));
  };

  // ── Vue admin (tableau) ──
  if (estAdmin) {
    return (
      <div style={{ padding: 'clamp(24px,4vw,48px)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 'normal', color: 'var(--ink)' }}>Gestion des débats</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{debats.length} débats au total</p>
          </div>
          <button onClick={() => { setDebatEnEdition(null); setForm(FORM_VIDE); setModalOuvert(true); }} style={{ padding: '10px 20px', background: 'var(--red)', color: 'white', border: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>
            + Nouveau débat
          </button>
        </div>
        <div style={{ background: 'white', border: '1px solid var(--line2)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line2)', background: 'var(--page2)' }}>
                {['Sujet', 'Catégorie', 'Statut', 'Vues', 'Messages', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {debats.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--line2)', background: i % 2 === 0 ? 'white' : 'var(--page2)' }}>
                  <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{d.titre}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(d.dateDebut).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', background: CAT_BG[d.categorie] || 'var(--page3)', color: CAT_COLORS[d.categorie] || 'var(--muted)', borderRadius: 100 }}>{d.categorie}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 700, background: d.statut === 'OUVERT' ? 'rgba(5,150,105,0.1)' : d.statut === 'FERME' ? 'rgba(107,114,128,0.1)' : 'rgba(217,119,6,0.1)', color: d.statut === 'OUVERT' ? '#059669' : d.statut === 'FERME' ? '#6b7280' : '#d97706' }}>
                      {d.statut === 'OUVERT' ? '● Ouvert' : d.statut === 'FERME' ? '■ Fermé' : '◷ Programmé'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{d.vues ?? 0}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{d._count?.messages ?? 0}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setDebatEnEdition(d); setForm({ titre: d.titre, description: d.description, categorie: d.categorie, statut: d.statut, dateDebut: d.dateDebut?.slice(0, 16) || '' }); setModalOuvert(true); }} style={{ padding: '5px 12px', border: '1px solid var(--line2)', background: 'white', cursor: 'pointer', fontSize: 11, color: 'var(--ink)' }}>Modifier</button>
                      <button onClick={() => supprimerDebat(d.id)} style={{ padding: '5px 12px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', cursor: 'pointer', fontSize: 11, color: '#dc2626' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {modalOuvert && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: 'white', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal' }}>{debatEnEdition ? 'Modifier le débat' : 'Nouveau débat'}</h2>
                <button onClick={() => setModalOuvert(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>
              <form onSubmit={soumettre} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[{ label: 'Sujet du débat', name: 'titre', type: 'text', placeholder: 'Ex : La réforme judiciaire en Haïti' }, { label: 'Description', name: 'description', type: 'textarea', placeholder: 'Décrivez le sujet...' }].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} required rows={3} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line2)', outline: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif", resize: 'vertical', boxSizing: 'border-box' }}/>
                    ) : (
                      <input type={f.type} value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} required style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line2)', outline: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }}/>
                    )}
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</label>
                    <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line2)', outline: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif", background: 'white' }}>
                      {CATEGORIES_ADMIN.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</label>
                    <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line2)', outline: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif", background: 'white' }}>
                      <option value="BROUILLON">Programmé</option>
                      <option value="OUVERT">Ouvert</option>
                      <option value="FERME">Fermé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date et heure</label>
                  <input type="datetime-local" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line2)', outline: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }}/>
                </div>
                <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                  <button type="button" onClick={() => setModalOuvert(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--line2)', background: 'white', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'var(--muted)' }}>Annuler</button>
                  <button type="submit" disabled={envoi} style={{ flex: 1, padding: '11px', background: 'var(--ink)', color: 'var(--page)', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13 }}>
                    {envoi ? 'Enregistrement…' : debatEnEdition ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Vue publique ──
  const debatsFiltres = debatsOuverts.filter(filtrer);
  const programmesFiltres = debatsProgrammes.filter(filtrer);

  return (
    <div style={{ background: 'var(--page)', minHeight: '100vh' }}>

      {/* En-tête page */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,4vw,80px) 0', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 'normal', letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 8 }}>
          Débats
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(13px,1.5vw,17px)', color: 'var(--muted)', marginBottom: 32 }}>
          Explorez et participez aux débats ouverts et programmés.
        </p>

        {/* Filtres */}
        <div style={{ background: 'white', border: '1px solid var(--line2)', borderRadius: 12, padding: '16px 20px', marginBottom: 40, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFiltre(cat.id)} style={{
              padding: '8px 18px', borderRadius: 100, fontSize: 14,
              fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 500,
              border: filtre === cat.id ? 'none' : '1.5px solid var(--line2)',
              background: filtre === cat.id ? 'var(--red)' : 'white',
              color: filtre === cat.id ? 'white' : 'var(--muted)',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 clamp(20px,4vw,80px) clamp(40px,6vw,80px)', maxWidth: 1200, margin: '0 auto' }}>

        {/* Débats ouverts */}
        {debatsFiltres.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                DÉBATS OUVERTS
              </span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'var(--muted)' }}>({debatsFiltres.length})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {debatsFiltres.map((debat, idx) => {
                const bgGrad = CAT_CARD_BG[debat.categorie] || CAT_CARD_BG.default;
                const btnColors = [
                  { bg: 'var(--red)', color: 'white' },
                  { bg: '#059669', color: 'white' },
                  { bg: 'var(--ink)', color: 'var(--page)' },
                ];
                const btn = btnColors[idx % btnColors.length];
                return (
                  <div key={debat.id} style={{ background: 'white', border: '1px solid var(--line2)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Image ou gradient */}
                    <div style={{ height: 180, background: debat.image ? `url(${debat.image}) center/cover` : bgGrad, position: 'relative', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                        <span style={{ background: '#059669', color: 'white', fontSize: 10, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          ● OUVERT
                        </span>
                        <span style={{ background: CAT_BG[debat.categorie] || 'rgba(255,255,255,0.15)', color: debat.image ? 'white' : (CAT_COLORS[debat.categorie] || 'white'), fontSize: 10, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                          {debat.categorie}
                        </span>
                      </div>
                    </div>
                    {/* Contenu */}
                    <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 8 }}>
                        {debat.titre}
                      </h3>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                        {debat.description}
                      </p>
                      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#059669' }}>✓</span> <strong style={{ color: 'var(--ink)' }}>{debat.vues}</strong> votes
                        </span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>↗</span> <strong style={{ color: 'var(--ink)' }}>{debat._count?.messages ?? 0}</strong> messages
                        </span>
                      </div>
                      <Link href={estConnecte ? `/debats/${debat.id}` : '/auth/inscription'} style={{
                        display: 'block', textAlign: 'center', padding: '12px',
                        background: btn.bg, color: btn.color,
                        textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif",
                        fontWeight: 700, fontSize: 13, borderRadius: 6,
                      }}>
                        Rejoindre le débat
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Débats programmés */}
        {programmesFiltres.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                DÉBATS PROGRAMMÉS
              </span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'var(--muted)' }}>({programmesFiltres.length})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {programmesFiltres.map(debat => (
                <div key={debat.id} style={{ background: 'white', border: '1px solid var(--line2)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ height: 180, background: CAT_CARD_BG[debat.categorie] || CAT_CARD_BG.default, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 10, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                        📅 PROGRAMMÉ
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 10, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", backdropFilter: 'blur(4px)' }}>
                        {debat.categorie}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                        📅 {new Date(debat.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 8 }}>{debat.titre}</h3>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>{debat.description}</p>
                    <Link href={estConnecte ? `/debats/${debat.id}` : '/auth/inscription'} style={{ display: 'block', textAlign: 'center', padding: '11px', border: '1.5px solid var(--line2)', color: 'var(--ink)', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, borderRadius: 6 }}>
                      Voir le sujet
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aucun résultat */}
        {debatsFiltres.length === 0 && programmesFiltres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>Aucun débat dans cette catégorie</p>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Revenez bientôt ou choisissez une autre catégorie</p>
          </div>
        )}

        {/* CTA visiteurs */}
        {!estConnecte && (
          <div style={{ marginTop: 48, background: 'var(--ink)', padding: 'clamp(32px,5vw,56px)', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 'normal', color: 'var(--page)', marginBottom: 10 }}>
              Rejoignez la communauté
            </h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(244,240,233,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
              Inscrivez-vous pour participer aux débats et soumettre vos arguments
            </p>
            <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--red)', color: 'white', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.04em' }}>
              Créer un compte
            </Link>
          </div>
        )}
      </div>

      {/* Voir tous les débats flottant en bas */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
        {!estConnecte && (
          <Link href="/auth/inscription" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'var(--ink)', color: 'var(--page)', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            S'inscrire gratuitement →
          </Link>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: repeat(auto-fill, minmax(300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
