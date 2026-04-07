'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const CATEGORIES = ['Politique', 'Économie', 'Religion', 'Philosophie', 'Société', 'Culture', 'Éducation'];

const FORM_VIDE = {
  titre: '',
  description: '',
  categorie: 'Politique',
  youtubeUrl: '',
  dateDebut: '',
  statut: 'EN_DIRECT',
  plateforme: 'youtube',
};

// Convertit n'importe quelle URL YouTube en embed
const construireEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1] + '?rel=0';
  if (url.includes('facebook.com'))
    return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(url) + '&width=800';
  const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return 'https://www.dailymotion.com/embed/video/' + dmMatch[1];
  return url;
};

// Extrait la miniature YouTube
const getMiniature = (url: string) => {
  const ytMatch = url?.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return 'https://img.youtube.com/vi/' + ytMatch[1] + '/hqdefault.jpg';
  return null;
};

const getBadge = (cat: string) => {
  const map: Record<string, string> = {
    Politique: 'bg-purple-100 text-purple-700',
    Économie: 'bg-yellow-100 text-yellow-700',
    Religion: 'bg-orange-100 text-orange-700',
    Philosophie: 'bg-indigo-100 text-indigo-700',
    Société: 'bg-green-100 text-green-700',
    Culture: 'bg-pink-100 text-pink-700',
    Éducation: 'bg-cyan-100 text-cyan-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-600';
};

export default function PageLives() {
  const [lives, setLives] = useState<any[]>([]);
  const [liveSelectionne, setLiveSelectionne] = useState<any>(null);
  const [modalAjout, setModalAjout] = useState(false);
  const [form, setForm] = useState<any>(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [apercu, setApercu] = useState(''); // URL convertie en preview
  const [erreurUrl, setErreurUrl] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const [spectateurs, setSpectateurs] = useState(248);
  const [liveActif, setLiveActif] = useState<any>(null);
  const { utilisateur } = useAuthStore();

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '');
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '');

  // Charger les lives depuis l'API au montage
  useEffect(() => {
    chargerLives();
  }, []);

  const chargerLives = async () => {
    try {
      const r = await fetch(API_URL + '/lives');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          setLives(data);
          setLiveActif(data.find((l: any) => l.statut === 'EN_DIRECT') || null);
          return;
        }
      }
    } catch {}
    // Fallback données de démonstration
    setLives([
      {
        id: 'DEMO1',
        titre: 'Débat : La réforme constitutionnelle en Haïti',
        description: 'Analyse approfondie des enjeux constitutionnels.',
        statut: 'TERMINE',
        categorie: 'Politique',
        youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        replayUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        dateDebut: new Date(Date.now() - 7 * 86400000).toISOString(),
        vues: 1240,
        duree: '1h 32min',
        _count: { messagesLive: 87 },
      },
    ]);
  };

  // Compteur spectateurs simulé pour le live actif
  
  const replays = lives.filter(l => l.statut === 'TERMINE');
  const programmes = lives.filter(l => l.statut === 'PROGRAMME');

  useEffect(() => {
    if (!liveActif) return;
    const iv = setInterval(() => setSpectateurs(p => Math.max(1, p + Math.floor(Math.random() * 5) - 2)), 4000);
    return () => clearInterval(iv);
  }, [liveActif]);

  // Aperçu URL en temps réel
  const handleUrlChange = (url: string) => {
    setForm((f: any) => ({ ...f, youtubeUrl: url }));
    setErreurUrl('');
    if (!url.trim()) { setApercu(''); return; }
    const embed = construireEmbedUrl(url.trim());
    if (embed) {
      setApercu(embed);
    } else {
      setApercu('');
      if (url.length > 10) setErreurUrl('URL non reconnue. Utilisez un lien YouTube, Facebook, ou Dailymotion.');
    }
  };

  // Ajouter live
  const ajouterLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.youtubeUrl.trim()) { setErreurUrl("L'URL est requise."); return; }
    if (!apercu) { setErreurUrl('URL invalide ou non supportée.'); return; }
    setEnvoi(true);

    const nouveauLive = {
      id: 'L' + Date.now(),
      titre: form.titre || 'Live sans titre',
      description: form.description,
      categorie: form.categorie,
      youtubeUrl: apercu,
      replayUrl: apercu,
      statut: form.statut,
      dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : new Date().toISOString(),
      vues: 0,
      duree: null,
      _count: { messagesLive: 0 },
    };

    // 1. Ajouter localement IMMÉDIATEMENT — visible tout de suite
    if (nouveauLive.statut === 'EN_DIRECT') setLiveActif(nouveauLive);
    setLives(prev => [nouveauLive, ...prev]);
    setModalAjout(false);
    setForm(FORM_VIDE);
    setApercu('');
    setEnvoi(false);
    setMessageSucces(
      form.statut === 'EN_DIRECT'
        ? '🔴 Live publié ! Il apparaît maintenant dans "En direct".'
        : form.statut === 'TERMINE'
        ? '📼 Replay ajouté ! Il apparaît dans la section Replays.'
        : '📅 Live programmé ajouté avec succès !'
    );

    // 2. Persister backend en arrière-plan
    try {
      await fetch(API_URL + '/lives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify(nouveauLive),
      });
      // Recharger depuis l'API pour synchroniser les IDs réels
      await chargerLives();
    } catch {}
  };

  // Supprimer live
  const supprimerLive = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Supprimer ce live définitivement ?')) return;
    setLives(prev => prev.filter(l => l.id !== id));
    if (liveSelectionne?.id === id) setLiveSelectionne(null);
    if (liveActif?.id === id) setLiveActif(null);
    try {
      await fetch(API_URL + '/lives/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + getToken() },
      });
    } catch {}
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Message succès */}
      {messageSucces && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm flex justify-between items-center">
          <span>{messageSucces}</span>
          <button onClick={() => setMessageSucces('')} className="ml-4 text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      {/* ── EN DIRECT ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse inline-block" />
            <h1 className="text-2xl font-bold text-gray-900">En direct maintenant</h1>
          </div>
          {estAdmin && (
            <button
              onClick={() => { setForm({ ...FORM_VIDE, statut: 'EN_DIRECT' }); setModalAjout(true); }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2"
            >
              🔴 + Démarrer un live
            </button>
          )}
        </div>

        {liveActif ? (
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Lecteur vidéo */}
            <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={construireEmbedUrl(liveActif.youtubeUrl || '')}
                title={liveActif.titre}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Infos live */}
            <div className="bg-gray-900 text-white p-5">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <span className="text-xs bg-red-500 px-2 py-1 rounded font-bold animate-pulse">🔴 EN DIRECT</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getBadge(liveActif.categorie)}`}>{liveActif.categorie}</span>
                  </div>
                  <h2 className="text-lg font-bold mb-1">{liveActif.titre}</h2>
                  <p className="text-gray-400 text-sm">{liveActif.description}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl font-bold text-white">{spectateurs}</div>
                  <div className="text-xs text-gray-400">spectateurs</div>
                </div>
              </div>
              {estAdmin && (
                <div className="mt-4 pt-3 border-t border-gray-700 flex gap-2">
                  <button
                    onClick={() => supprimerLive(liveActif.id)}
                    className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-4 py-2 rounded-lg font-medium transition"
                  >
                    🗑 Supprimer ce live
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-12 text-center text-white">
            <div className="text-5xl mb-4">📡</div>
            <h2 className="text-xl font-bold mb-2">Aucun débat en direct pour l'instant</h2>
            <p className="text-gray-400 text-sm mb-6">Consultez les replays ci-dessous ou revenez bientôt.</p>
            {estAdmin && (
              <button
                onClick={() => { setForm({ ...FORM_VIDE, statut: 'EN_DIRECT' }); setModalAjout(true); }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition"
              >
                🔴 Démarrer un live
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── PROGRAMMÉS ── */}
      {programmes.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">📅 Lives programmés</h2>
          <div className="space-y-3">
            {programmes.map(live => (
              <div key={live.id} className="bg-white border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium mr-2">📅 Programmé</span>
                  <span className="font-semibold text-gray-900 text-sm">{live.titre}</span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(live.dateDebut).toLocaleString('fr-FR')}</p>
                </div>
                {estAdmin && (
                  <button onClick={e => supprimerLive(live.id, e)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition">
                    🗑 Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REPLAYS ── */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">📼 Replays disponibles</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{replays.length} vidéo{replays.length > 1 ? 's' : ''}</span>
            {estAdmin && (
              <button
                onClick={() => { setForm({ ...FORM_VIDE, statut: 'TERMINE' }); setModalAjout(true); }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
              >
                + Ajouter un replay
              </button>
            )}
          </div>
        </div>

        {replays.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📼</div>
            <p>Aucun replay disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {replays.map(live => {
              const miniature = getMiniature(live.replayUrl || live.youtubeUrl || '');
              return (
                <div key={live.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                  {/* Vignette cliquable */}
                  <div
                    className="relative bg-gray-900 cursor-pointer"
                    style={{ paddingTop: '56.25%' }}
                    onClick={() => setLiveSelectionne(live)}
                  >
                    {miniature ? (
                      <img src={miniature} alt={live.titre} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-4xl">📼</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600 bg-opacity-90 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                        <span className="text-white text-2xl ml-1">▶</span>
                      </div>
                    </div>
                    {live.duree && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">{live.duree}</div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getBadge(live.categorie)}`}>{live.categorie}</span>
                    <h3 className="font-semibold text-gray-900 text-sm mt-2 mb-1 line-clamp-2">{live.titre}</h3>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>👁️ {(live.vues || 0).toLocaleString()} vues</span>
                      <span>{new Date(live.dateDebut).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Bouton supprimer admin — toujours visible */}
                  {estAdmin && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={e => supprimerLive(live.id, e)}
                        className="w-full text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition border border-red-100"
                      >
                        🗑 Supprimer ce replay
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION ADMIN — liste complète ── */}
      {estAdmin && lives.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Gestion — Tous les lives ({lives.length})</h2>
          <div className="space-y-2">
            {lives.map(live => (
              <div key={live.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap flex-shrink-0 ${
                    live.statut === 'EN_DIRECT' ? 'bg-red-100 text-red-600' :
                    live.statut === 'PROGRAMME' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {live.statut === 'EN_DIRECT' ? '🔴 En direct' : live.statut === 'PROGRAMME' ? '📅 Programmé' : '📼 Replay'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{live.titre}</p>
                    <p className="text-xs text-gray-400">{live.categorie} · {new Date(live.dateDebut).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <button
                  onClick={e => supprimerLive(live.id, e)}
                  className="flex-shrink-0 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition border border-red-100"
                >
                  🗑 Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL LECTEUR REPLAY ── */}
      {liveSelectionne && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setLiveSelectionne(null)}>
          <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold text-sm">{liveSelectionne.titre}</span>
              <button onClick={() => setLiveSelectionne(null)} className="text-gray-400 hover:text-white text-2xl leading-none">✕</button>
            </div>
            <div className="relative bg-black rounded-2xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={construireEmbedUrl(liveSelectionne.replayUrl || liveSelectionne.youtubeUrl || '')}
                title={liveSelectionne.titre}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AJOUT LIVE ── */}
      {modalAjout && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-blue-900">
                  {form.statut === 'EN_DIRECT' ? '🔴 Démarrer un live' : form.statut === 'TERMINE' ? '📼 Ajouter un replay' : '📅 Programmer un live'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Le contenu apparaîtra immédiatement après publication</p>
              </div>
              <button onClick={() => setModalAjout(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>

            <form onSubmit={ajouterLive} className="p-6 space-y-5">

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de publication</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { val: 'EN_DIRECT', label: '🔴 En direct', color: 'border-red-500 bg-red-50 text-red-700' },
                    { val: 'TERMINE', label: '📼 Replay', color: 'border-gray-500 bg-gray-50 text-gray-700' },
                    { val: 'PROGRAMME', label: '📅 Programmé', color: 'border-blue-500 bg-blue-50 text-blue-700' },
                  ].map(s => (
                    <button key={s.val} type="button"
                      onClick={() => setForm((f: any) => ({ ...f, statut: s.val }))}
                      className={`py-2 px-2 rounded-lg border-2 text-xs font-semibold transition ${form.statut === s.val ? s.color : 'border-gray-200 text-gray-500'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du live / replay <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.youtubeUrl}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=XXXX  ou  https://youtu.be/XXXX"
                  className={inputCls + (erreurUrl ? ' border-red-400' : '')}
                />
                {erreurUrl && <p className="text-xs text-red-500 mt-1">⚠ {erreurUrl}</p>}
                {!erreurUrl && apercu && <p className="text-xs text-green-600 mt-1">✓ URL reconnue — aperçu disponible ci-dessous</p>}
                <p className="text-xs text-gray-400 mt-1">Formats acceptés : YouTube, Facebook Live, Dailymotion</p>
              </div>

              {/* Aperçu vidéo en temps réel */}
              {apercu && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">👁️ Aperçu :</p>
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={apercu}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={e => setForm((f: any) => ({ ...f, titre: e.target.value }))}
                  placeholder="Ex : Débat sur la réforme judiciaire"
                  required
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez le sujet du débat..."
                  className={inputCls + ' h-20 resize-none'}
                />
              </div>

              {/* Catégorie + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((f: any) => ({ ...f, categorie: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                  <input type="datetime-local" value={form.dateDebut} onChange={e => setForm((f: any) => ({ ...f, dateDebut: e.target.value }))} className={inputCls} />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAjout(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={envoi || !apercu}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${
                    form.statut === 'EN_DIRECT' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-900 hover:bg-blue-800 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {envoi ? 'Publication...' : form.statut === 'EN_DIRECT' ? '🔴 Publier en direct' : form.statut === 'TERMINE' ? '📼 Ajouter le replay' : '📅 Programmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
