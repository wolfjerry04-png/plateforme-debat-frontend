'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const construireEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1&rel=0';
  if (url.includes('facebook.com')) return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(url) + '&autoplay=true&width=800';
  const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return 'https://www.dailymotion.com/embed/video/' + dmMatch[1];
  return url;
};

// Composant de validation manuelle des paiements
function ValiderPaiement({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ userId: '', plan: 'PREMIUM', reference: '', methode: 'MonCash' });
  const [envoi, setEnvoi] = useState(false);

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId.trim() || !form.reference.trim()) {
      toast.error('ID utilisateur et référence requis');
      return;
    }
    setEnvoi(true);
    try {
      await api.post('/paiements/admin/valider', form);
      toast.success('✅ Paiement validé — accès premium activé !');
      setForm({ userId: '', plan: 'PREMIUM', reference: '', methode: 'MonCash' });
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setEnvoi(false);
    }
  };

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <form onSubmit={valider} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div>
        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>ID utilisateur *</label>
        <input style={inputStyle} value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} placeholder="UUID de l'utilisateur" />
      </div>
      <div>
        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Méthode</label>
        <select style={{ ...inputStyle }} value={form.methode} onChange={e => setForm(f => ({ ...f, methode: e.target.value }))}>
          {['MonCash', 'PayPal', 'Zelle', 'Visa', 'Autre'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Plan</label>
        <select style={{ ...inputStyle }} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
          <option value="PREMIUM">PREMIUM — 100 USD / 3 mois</option>
          <option value="INSTITUTION">INSTITUTION — 200 USD / 3 mois</option>
        </select>
      </div>
      <div>
        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Référence transaction *</label>
        <input style={inputStyle} value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="N° transaction ou capture" />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" disabled={envoi} style={{ background: 'linear-gradient(135deg, #00D4FF, #7B61FF)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: envoi ? 0.7 : 1 }}>
          {envoi ? '⏳ Validation...' : '✅ Valider et activer l\'accès premium'}
        </button>
      </div>
    </form>
  );
}

export default function PageAdmin() {
  const router = useRouter();
  const [metriques, setMetriques] = useState<any>(null);
  const [onglet, setOnglet] = useState('dashboard');
  const [lives, setLives] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [debats, setDebats] = useState<any[]>([]);

  const [formLive, setFormLive] = useState({ titre: '', description: '', dateDebut: '', youtubeUrl: '', plateforme: 'youtube', statut: 'EN_DIRECT' });
  const [formFormation, setFormFormation] = useState({ titre: '', description: '', niveau: 'DEBUTANT' });
  const [formDebat, setFormDebat] = useState({ titre: '', description: '' });
  const [formSponsor, setFormSponsor] = useState({ nom: '', logoUrl: '', siteWeb: '', typeContrat: 'OR', montant: 0, dateDebut: '', dateFin: '', couleur: '#003087' });
  const [logoPreview, setLogoPreview] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const [m, l, s, f, d] = await Promise.all([
          api.get('/analytics/metriques'),
          api.get('/lives'),
          api.get('/sponsoring/sponsors/tous'),
          api.get('/cours'),
          api.get('/debats'),
        ]);
        setMetriques(m.data);
        setLives(Array.isArray(l.data) ? l.data : []);
        setSponsors(Array.isArray(s.data) ? s.data : []);
        setFormations(Array.isArray(f.data) ? f.data : []);
        setDebats(d.data?.debats || []);
      } catch {}
    };
    charger();
  }, []);

  // Upload logo
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (fichier.size > 5 * 1024 * 1024) { toast.error('Logo max 5 MB'); return; }
    const url = URL.createObjectURL(fichier);
    setLogoPreview(url);
    setFormSponsor({ ...formSponsor, logoUrl: url });
  };

  // Créer live — localement + backend
  const creerLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLive.youtubeUrl.trim()) { toast.error('URL requise'); return; }
    const embedUrl = construireEmbedUrl(formLive.youtubeUrl);
    const nouveauLive = {
      id: 'L' + Date.now(),
      titre: formLive.titre,
      description: formLive.description,
      categorie: 'Politique',
      youtubeUrl: embedUrl,
      replayUrl: embedUrl,
      statut: formLive.statut,
      dateDebut: formLive.dateDebut ? new Date(formLive.dateDebut).toISOString() : new Date().toISOString(),
      vues: 0,
      duree: null,
      _count: { messagesLive: 0 },
    };
    setLives(prev => [nouveauLive, ...prev]);
    toast.success('Live publié avec succès !');
    setFormLive({ titre: '', description: '', dateDebut: '', youtubeUrl: '', plateforme: 'youtube', statut: 'EN_DIRECT' });
    try {
      await api.post('/lives', nouveauLive);
    } catch {}
  };

  const creerFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cours', formFormation);
      toast.success('Formation créée !');
      setFormFormation({ titre: '', description: '', niveau: 'DEBUTANT' });
      const { data } = await api.get('/cours');
      setFormations(data);
    } catch { toast.error('Erreur création formation'); }
  };

  const creerDebat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/debats', { ...formDebat, statut: 'OUVERT' });
      toast.success('Débat créé !');
      setFormDebat({ titre: '', description: '' });
      const { data } = await api.get('/debats');
      setDebats(data?.debats || []);
    } catch { toast.error('Erreur création débat'); }
  };

  const creerSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSponsor.nom) { toast.error('Le nom est requis'); return; }
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      nom: formSponsor.nom,
      logoUrl: logoPreview || formSponsor.logoUrl || '',
      siteWeb: formSponsor.siteWeb || null,
      typeContrat: formSponsor.typeContrat,
      montant: Number(formSponsor.montant) || 0,
      dateDebut: formSponsor.dateDebut || today,
      dateFin: formSponsor.dateFin || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      actif: true,
    };
    try {
      const { data } = await api.post('/sponsoring/sponsors', payload);
      setSponsors(prev => [data, ...prev]);
      toast.success('Sponsor ajouté ! Il apparaît maintenant sur la page d\'accueil et les tournois.');
    } catch {
      // Ajout local si API indisponible
      setSponsors(prev => [{ id: 'S' + Date.now(), ...payload }, ...prev]);
      toast.success('Sponsor ajouté localement.');
    }
    setFormSponsor({ nom: '', logoUrl: '', siteWeb: '', typeContrat: 'OR', montant: 0, dateDebut: '', dateFin: '', couleur: '#003087' });
    setLogoPreview('');
  };

  const changerStatutLive = async (id: string, statut: string) => {
    setLives(prev => prev.map(l => l.id === id ? { ...l, statut } : l));
    try { await api.patch('/lives/' + id + '/statut', { statut }); } catch {}
  };

  const onglets = [
    { id: 'dashboard', label: 'Tableau de bord', emoji: '📊' },
    { id: 'debats', label: 'Débats', emoji: '💬' },
    { id: 'lives', label: 'Lives / Streams', emoji: '🎥' },
    { id: 'formations', label: 'Formations', emoji: '📚' },
    { id: 'sponsors', label: 'Sponsors', emoji: '🤝' },
  ];

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block' as const, color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '6px' };
  const btnStyle = { background: 'linear-gradient(135deg, #00D4FF, #7B61FF)', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', width: '100%' };

  return (
    <ProtectedRoute rolesAutorises={['ADMIN']}>
      <div style={{ background: '#0A0F1E', minHeight: '100vh', color: 'white' }}>
        <div style={{ background: 'linear-gradient(135deg, #0A2540, #001F3F)', padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Panneau d'administration</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Gérez tout le contenu de la plateforme</p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {onglets.map(o => (
              <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid', borderColor: onglet === o.id ? '#00D4FF' : 'rgba(255,255,255,0.1)', background: onglet === o.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: onglet === o.id ? '#00D4FF' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                {o.emoji} {o.label}
              </button>
            ))}
          </div>

          {/* DASHBOARD */}
          {onglet === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Utilisateurs', val: metriques?.totaux?.utilisateurs, couleur: '#00D4FF' },
                  { label: 'Débats', val: metriques?.totaux?.debats, couleur: '#7B61FF' },
                  { label: 'Messages', val: metriques?.totaux?.messages, couleur: '#3EB489' },
                  { label: 'Lives actifs', val: lives.filter(l => l.statut === 'EN_DIRECT').length, couleur: '#FF3B30' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: item.couleur }}>{item.val ?? 0}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '6px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Créer un débat', emoji: '💬', action: () => setOnglet('debats') },
                  { label: 'Démarrer un live', emoji: '🎥', action: () => setOnglet('lives') },
                  { label: 'Ajouter une formation', emoji: '📚', action: () => setOnglet('formations') },
                  { label: 'Ajouter un sponsor', emoji: '🤝', action: () => setOnglet('sponsors') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', cursor: 'pointer', color: 'white', textAlign: 'left', fontSize: '15px', fontWeight: 600 }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.emoji}</div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DÉBATS */}
          {onglet === 'debats' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#00D4FF' }}>Créer un débat</h2>
                <form onSubmit={creerDebat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div><label style={labelStyle}>Titre *</label><input value={formDebat.titre} onChange={e => setFormDebat({...formDebat, titre: e.target.value})} placeholder="Ex : La réforme judiciaire" required style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description *</label><textarea value={formDebat.description} onChange={e => setFormDebat({...formDebat, description: e.target.value})} required style={{...inputStyle, height: '100px', resize: 'none'}} /></div>
                  <button type="submit" style={btnStyle}>Créer le débat</button>
                </form>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Débats ({debats.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {debats.map((d: any) => (
                    <div key={d.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{d.titre}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LIVES */}
          {onglet === 'lives' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>🎥 Ajouter un live</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>Collez simplement l'URL depuis YouTube, Facebook, Dailymotion ou Twitch.</p>

                <form onSubmit={creerLive} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Plateforme */}
                  <div>
                    <label style={labelStyle}>Plateforme</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[{ id: 'youtube', label: '▶️ YouTube' }, { id: 'facebook', label: '📘 Facebook' }, { id: 'dailymotion', label: '🎬 Dailymotion' }, { id: 'twitch', label: '🎮 Twitch' }].map(p => (
                        <button key={p.id} type="button" onClick={() => setFormLive({ ...formLive, plateforme: p.id })}
                          style={{ padding: '8px', borderRadius: '8px', border: '1px solid', borderColor: formLive.plateforme === p.id ? '#00D4FF' : 'rgba(255,255,255,0.15)', background: formLive.plateforme === p.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>URL du live *</label>
                    <input
                      value={formLive.youtubeUrl}
                      onChange={e => setFormLive({...formLive, youtubeUrl: e.target.value})}
                      placeholder={
                        formLive.plateforme === 'youtube' ? 'https://youtube.com/watch?v=XXXX' :
                        formLive.plateforme === 'facebook' ? 'https://facebook.com/video/XXXX' :
                        formLive.plateforme === 'dailymotion' ? 'https://dailymotion.com/video/XXXX' :
                        'https://twitch.tv/nomchaine'
                      }
                      required style={inputStyle}
                    />
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Copiez-collez l'URL directement depuis votre navigateur</p>
                  </div>

                  <div><label style={labelStyle}>Titre *</label><input value={formLive.titre} onChange={e => setFormLive({...formLive, titre: e.target.value})} placeholder="Ex : Débat sur la réforme judiciaire" required style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description</label><textarea value={formLive.description} onChange={e => setFormLive({...formLive, description: e.target.value})} style={{...inputStyle, height: '60px', resize: 'none'}} /></div>

                  <div>
                    <label style={labelStyle}>Statut</label>
                    <select value={formLive.statut} onChange={e => setFormLive({...formLive, statut: e.target.value})} style={inputStyle}>
                      <option value="EN_DIRECT">🔴 En direct maintenant</option>
                      <option value="PROGRAMME">📅 Programmé</option>
                      <option value="TERMINE">📼 Replay</option>
                    </select>
                  </div>

                  <div><label style={labelStyle}>Date et heure</label><input type="datetime-local" value={formLive.dateDebut} onChange={e => setFormLive({...formLive, dateDebut: e.target.value})} style={inputStyle} /></div>

                  <button type="submit" style={btnStyle}>🔴 Publier le live</button>
                </form>
              </div>

              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Lives ({lives.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
                  {lives.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '24px' }}>Aucun live pour le moment</p>}
                  {lives.map(live => (
                    <div key={live.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{live.titre}</p>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: live.statut === 'EN_DIRECT' ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.1)', color: live.statut === 'EN_DIRECT' ? '#FF6B6B' : 'rgba(255,255,255,0.5)' }}>{live.statut}</span>
                      </div>
                      {live.youtubeUrl && (
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', wordBreak: 'break-all' }}>{live.youtubeUrl.substring(0, 60)}...</p>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {live.statut === 'PROGRAMME' && (
                          <button onClick={() => changerStatutLive(live.id, 'EN_DIRECT')} style={{ background: 'rgba(255,59,48,0.2)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF6B6B', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Démarrer</button>
                        )}
                        {live.statut === 'EN_DIRECT' && (
                          <button onClick={() => changerStatutLive(live.id, 'TERMINE')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Terminer</button>
                        )}
                        <a href="/lives" target="_blank" rel="noreferrer" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', textDecoration: 'none' }}>👁 Voir</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FORMATIONS */}
          {onglet === 'formations' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#00D4FF' }}>Ajouter une formation</h2>
                <form onSubmit={creerFormation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div><label style={labelStyle}>Titre *</label><input value={formFormation.titre} onChange={e => setFormFormation({...formFormation, titre: e.target.value})} required style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description *</label><textarea value={formFormation.description} onChange={e => setFormFormation({...formFormation, description: e.target.value})} required style={{...inputStyle, height: '100px', resize: 'none'}} /></div>
                  <div>
                    <label style={labelStyle}>Niveau</label>
                    <select value={formFormation.niveau} onChange={e => setFormFormation({...formFormation, niveau: e.target.value})} style={inputStyle}>
                      <option value="DEBUTANT">Débutant</option>
                      <option value="INTERMEDIAIRE">Intermédiaire</option>
                      <option value="AVANCE">Avancé</option>
                    </select>
                  </div>
                  <button type="submit" style={btnStyle}>Créer la formation</button>
                </form>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Formations ({formations.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {formations.map((f: any) => (
                    <div key={f.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{f.titre}</p>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{f.niveau}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SPONSORS */}
          {onglet === 'sponsors' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>🤝 Ajouter un sponsor</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>Le logo apparaîtra sur la page d'accueil et la page sponsors.</p>

                <form onSubmit={creerSponsor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Upload logo */}
                  <div>
                    <label style={labelStyle}>Logo du sponsor</label>
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                    >
                      {logoPreview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                          <img src={logoPreview} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', background: 'white', padding: '4px' }} />
                          <span style={{ fontSize: '13px', color: '#3EB489' }}>✓ Logo uploadé</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Cliquez pour uploader le logo</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>PNG, JPG, SVG · Max 5 MB · Recommandé : 200×200px</p>
                        </>
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoSelect} style={{ display: 'none' }} />
                    {logoPreview && (
                      <button type="button" onClick={() => { setLogoPreview(''); setFormSponsor({...formSponsor, logoUrl: ''}); }} style={{ marginTop: '6px', fontSize: '12px', color: '#FF6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
                        ✕ Supprimer le logo
                      </button>
                    )}
                  </div>

                  <div><label style={labelStyle}>Nom du sponsor *</label><input value={formSponsor.nom} onChange={e => setFormSponsor({...formSponsor, nom: e.target.value})} placeholder="Ex : Digicel Haïti" required style={inputStyle} /></div>
                  <div><label style={labelStyle}>Site web</label><input value={formSponsor.siteWeb} onChange={e => setFormSponsor({...formSponsor, siteWeb: e.target.value})} placeholder="https://..." style={inputStyle} /></div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Niveau</label>
                      <select value={formSponsor.typeContrat} onChange={e => setFormSponsor({...formSponsor, typeContrat: e.target.value})} style={inputStyle}>
                        <option value="PLATINE">💎 Platine</option>
                        <option value="OR">🥇 Or</option>
                        <option value="ARGENT">🥈 Argent</option>
                        <option value="BRONZE">🥉 Bronze</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Couleur</label>
                      <input type="color" value={formSponsor.couleur} onChange={e => setFormSponsor({...formSponsor, couleur: e.target.value})} style={{...inputStyle, height: '44px', padding: '4px', cursor: 'pointer'}} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>Date début</label><input type="date" value={formSponsor.dateDebut} onChange={e => setFormSponsor({...formSponsor, dateDebut: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Date fin</label><input type="date" value={formSponsor.dateFin} onChange={e => setFormSponsor({...formSponsor, dateFin: e.target.value})} style={inputStyle} /></div>
                  </div>

                  <button type="submit" disabled={!formSponsor.nom} style={{...btnStyle, opacity: !formSponsor.nom ? 0.5 : 1}}>✅ Ajouter le sponsor</button>
                </form>
              </div>

              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Sponsors actifs ({sponsors.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
                  {sponsors.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '24px' }}>Aucun sponsor pour le moment</p>}
                  {sponsors.map((s: any) => (
                    <div key={s.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Logo uniforme 60×60 */}
                      <div style={{ width: '60px', height: '60px', flexShrink: 0, background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {s.logoUrl && !s.logoUrl.startsWith('#') ? (
                          <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: '56px', maxHeight: '56px', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '22px', fontWeight: 900, color: s.couleur || '#0A2540' }}>{s.nom?.charAt(0)}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>{s.nom}</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,159,104,0.2)', color: '#FF9F68' }}>{s.typeContrat}</span>
                          {s.actif && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(62,180,137,0.2)', color: '#3EB489' }}>Actif</span>}
                          {s.siteWeb && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{s.siteWeb}</span>}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm('Supprimer ce sponsor ?')) return;
                          try {
                            await api.delete('/sponsoring/sponsors/' + s.id);
                            setSponsors(prev => prev.filter(x => x.id !== s.id));
                            toast.success('Sponsor supprimé');
                          } catch { toast.error('Erreur suppression'); }
                        }}
                        style={{ flexShrink: 0, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                      >
                        🗑 Suppr.
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {onglet === 'paiements' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
                💳 Gestion des paiements
              </h2>

              {/* Stats rapides */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Abonnements actifs', value: abonnements.filter((a: any) => a.statut === 'ACTIF').length, color: '#00D4FF' },
                  { label: 'Expirés', value: abonnements.filter((a: any) => a.statut === 'EXPIRE').length, color: '#F59E0B' },
                  { label: 'Annulés', value: abonnements.filter((a: any) => a.statut === 'ANNULE').length, color: '#EF4444' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Validation manuelle */}
              <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ color: '#00D4FF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
                  ✅ Valider un paiement manuellement (MonCash / PayPal / Zelle)
                </h3>
                <ValiderPaiement onSuccess={() => api.get('/paiements/admin/liste').then(r => setAbonnements(Array.isArray(r.data) ? r.data : []))} />
              </div>

              {/* Liste des abonnements */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
                  📋 Tous les abonnements ({abonnements.length})
                </h3>
                {abonnements.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '32px' }}>Aucun abonnement pour le moment</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {abonnements.map((ab: any) => (
                      <div key={ab.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                            {ab.user?.prenom} {ab.user?.nom}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{ab.user?.email}</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                            Réf: {ab.stripeId || '—'} · {ab.montant} USD
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                            background: ab.statut === 'ACTIF' ? 'rgba(0,212,255,0.15)' : 'rgba(239,68,68,0.15)',
                            color: ab.statut === 'ACTIF' ? '#00D4FF' : '#EF4444',
                          }}>
                            {ab.statut === 'ACTIF' ? '✅ ACTIF' : ab.statut === 'EXPIRE' ? '⏰ EXPIRÉ' : '❌ ANNULÉ'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                            {ab.plan} · jusqu'au {ab.dateFin ? new Date(ab.dateFin).toLocaleDateString('fr-FR') : '—'}
                          </span>
                          {ab.statut === 'ACTIF' && (
                            <button
                              onClick={async () => {
                                if (!confirm('Révoquer cet abonnement ?')) return;
                                try {
                                  await api.patch('/paiements/admin/revoquer/' + ab.userId);
                                  toast.success('Abonnement révoqué');
                                  const r = await api.get('/paiements/admin/liste');
                                  setAbonnements(Array.isArray(r.data) ? r.data : []);
                                } catch { toast.error('Erreur'); }
                              }}
                              style={{ fontSize: '11px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}
                            >
                              Révoquer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info MonCash */}
              <div style={{ background: 'rgba(255,102,0,0.08)', border: '1px solid rgba(255,102,0,0.2)', borderRadius: '16px', padding: '20px', marginTop: '20px' }}>
                <h3 style={{ color: '#FF6600', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                  📱 MonCash automatique — En attente de configuration
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>
                  Pour activer le paiement MonCash automatique, fournissez vos credentials Digicel :<br/>
                  <code style={{ color: '#FF6600' }}>MONCASH_CLIENT_ID</code> et <code style={{ color: '#FF6600' }}>MONCASH_SECRET_KEY</code><br/>
                  Ces variables doivent être ajoutées dans Render → Environment. En attendant, les paiements MonCash sont validés manuellement ci-dessus.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}