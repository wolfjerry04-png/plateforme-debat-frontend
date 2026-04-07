'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const MOCK_DEBATS = [
  {
    id: '1',
    titre: 'La réforme de la Constitution haïtienne est-elle nécessaire ?',
    description: 'Analyse des enjeux constitutionnels et démocratiques en Haïti.',
    statut: 'OUVERT',
    categorie: 'Politique',
    dateDebut: new Date(Date.now() - 3600000).toISOString(),
    vues: 142,
    _count: { messages: 38 },
  },
  {
    id: '2',
    titre: "L'économie informelle : frein ou moteur pour Haïti ?",
    description: "Débat sur le rôle du secteur informel dans l'économie haïtienne.",
    statut: 'OUVERT',
    categorie: 'Économie',
    dateDebut: new Date(Date.now() - 7200000).toISOString(),
    vues: 89,
    _count: { messages: 21 },
  },
  {
    id: '3',
    titre: 'La place de la religion dans la politique haïtienne',
    description: "Quelle est l'influence des Églises sur les décisions politiques ?",
    statut: 'BROUILLON',
    categorie: 'Religion',
    dateDebut: new Date(Date.now() + 86400000).toISOString(),
    vues: 0,
    _count: { messages: 0 },
  },
  {
    id: '4',
    titre: 'Philosophie du droit et justice sociale en Haïti',
    description: 'Entre idéal philosophique et réalité judiciaire haïtienne.',
    statut: 'BROUILLON',
    categorie: 'Philosophie',
    dateDebut: new Date(Date.now() + 172800000).toISOString(),
    vues: 0,
    _count: { messages: 0 },
  },
  {
    id: '5',
    titre: "Égalité hommes-femmes dans la société haïtienne",
    description: 'Débat sur les inégalités de genre et les solutions possibles.',
    statut: 'OUVERT',
    categorie: 'Société',
    dateDebut: new Date(Date.now() - 604800000).toISOString(),
    vues: 312,
    _count: { messages: 87 },
  },
];

const CATEGORIES_OPTIONS = ['Politique', 'Économie', 'Religion', 'Philosophie', 'Société', 'Culture', 'Éducation'];

const CATEGORIES = [
  { id: 'tous', label: 'Tous' },
  { id: 'Politique', label: '⚖️ Politique' },
  { id: 'Économie', label: '💰 Économie' },
  { id: 'Religion', label: '✝️ Religion' },
  { id: 'Philosophie', label: '🧠 Philosophie' },
  { id: 'Société', label: '🌍 Société' },
  { id: 'ouverts', label: '💬 Débats ouverts' },
  { id: 'programmes', label: '📅 Programmés' },
];

const FORM_VIDE = {
  titre: '',
  description: '',
  categorie: 'Politique',
  statut: 'BROUILLON',
  dateDebut: '',
};

export default function PageDebats() {
  const [debats, setDebats] = useState<any[]>(MOCK_DEBATS);
  const [filtre, setFiltre] = useState('tous');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [debatEnEdition, setDebatEnEdition] = useState<any>(null);
  const [form, setForm] = useState<any>(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState('');
  const { estConnecte, utilisateur } = useAuthStore();

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '');
  const getToken = () => localStorage.getItem('access_token') || '';

  useEffect(() => {
    fetch(API_URL + '/debats')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.debats?.length) setDebats(data.debats); })
      .catch(() => {});
  }, []);

  const debatsOuverts = debats.filter(d => d.statut === 'OUVERT');
  const debatsProgrammes = debats.filter(d => d.statut === 'BROUILLON');

  const ouvrirCreation = () => {
    setDebatEnEdition(null);
    setForm(FORM_VIDE);
    setMessage('');
    setModalOuvert(true);
  };

  const ouvrirEdition = (debat: any) => {
    setDebatEnEdition(debat);
    setForm({
      titre: debat.titre,
      description: debat.description,
      categorie: debat.categorie || 'Politique',
      statut: debat.statut,
      dateDebut: debat.dateDebut ? debat.dateDebut.slice(0, 16) : '',
    });
    setMessage('');
    setModalOuvert(true);
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const body = {
        ...form,
        dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : new Date().toISOString(),
      };
      const url = debatEnEdition ? API_URL + '/debats/' + debatEnEdition.id : API_URL + '/debats';
      const methode = debatEnEdition ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method: methode,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (debatEnEdition) {
          setDebats(prev => prev.map(d => d.id === debatEnEdition.id ? { ...d, ...data } : d));
        } else {
          setDebats(prev => [data, ...prev]);
        }
        setMessage(debatEnEdition ? 'Débat modifié avec succès !' : 'Débat créé avec succès !');
      } else {
        if (debatEnEdition) {
          setDebats(prev => prev.map(d => d.id === debatEnEdition.id ? { ...d, ...form } : d));
        } else {
          setDebats(prev => [{ id: Date.now().toString(), ...form, vues: 0, _count: { messages: 0 } }, ...prev]);
        }
      }
      setModalOuvert(false);
    } catch {
      if (debatEnEdition) {
        setDebats(prev => prev.map(d => d.id === debatEnEdition.id ? { ...d, ...form } : d));
      } else {
        setDebats(prev => [{ id: Date.now().toString(), ...form, vues: 0, _count: { messages: 0 } }, ...prev]);
      }
      setModalOuvert(false);
    } finally {
      setEnvoi(false);
    }
  };

  const supprimerDebat = async (id: string) => {
    if (!confirm('Confirmer la suppression de ce débat ?')) return;
    try {
      await fetch(API_URL + '/debats/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + getToken() },
      });
    } catch {}
    setDebats(prev => prev.filter(d => d.id !== id));
  };

  const getBadgeStatut = (statut: string) => {
    if (statut === 'OUVERT') return 'bg-green-100 text-green-700';
    if (statut === 'BROUILLON') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  const getBadgeCategorie = (cat: string) => {
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

  const inputStyle = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  // ===== VUE ADMIN =====
  if (estAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Gestion des débats</h1>
            <p className="text-gray-500 text-sm mt-1">{debats.length} débat(s) au total</p>
          </div>
          <button onClick={ouvrirCreation} className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-300 transition text-sm">
            + Nouveau débat
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total débats', val: debats.length, couleur: 'text-blue-900', bg: 'bg-blue-50' },
            { label: 'Débats ouverts', val: debatsOuverts.length, couleur: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Programmés', val: debatsProgrammes.length, couleur: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Messages totaux', val: debats.reduce((acc, d) => acc + (d._count?.messages ?? 0), 0), couleur: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(item => (
            <div key={item.label} className={item.bg + ' rounded-xl p-4 text-center'}>
              <div className={'text-3xl font-bold ' + item.couleur}>{item.val}</div>
              <div className="text-gray-500 text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
            ✅ {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Sujet</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Messages</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {debats.map((debat, i) => (
                <tr key={debat.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{debat.titre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + getBadgeCategorie(debat.categorie)}>
                      {debat.categorie || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(debat.dateDebut).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + getBadgeStatut(debat.statut)}>
                      {debat.statut === 'OUVERT' ? 'Ouvert' : debat.statut === 'BROUILLON' ? 'Programmé' : 'Fermé'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-center">{debat._count?.messages ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => ouvrirEdition(debat)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-medium transition">
                        ✏️ Modifier
                      </button>
                      <button onClick={() => supprimerDebat(debat.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium transition">
                        🗑 Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {modalOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-blue-900">
                  {debatEnEdition ? 'Modifier le débat' : 'Créer un nouveau débat'}
                </h2>
                <button onClick={() => setModalOuvert(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={soumettre} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet du débat</label>
                  <input type="text" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex : La réforme judiciaire en Haïti" required className={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le sujet du débat..." required className={inputStyle + ' h-24 resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} className={inputStyle}>
                      {CATEGORIES_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} className={inputStyle}>
                      <option value="BROUILLON">Programmé</option>
                      <option value="OUVERT">Ouvert</option>
                      <option value="FERME">Fermé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                  <input type="datetime-local" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} className={inputStyle} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOuvert(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                    Annuler
                  </button>
                  <button type="submit" disabled={envoi} className="flex-1 bg-blue-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50">
                    {envoi ? 'Enregistrement...' : debatEnEdition ? 'Enregistrer' : 'Créer le débat'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== VUE PUBLIQUE =====
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">💬 Débats</h1>
          <p className="text-gray-500 text-sm mt-1">
            {debatsOuverts.length} ouvert{debatsOuverts.length > 1 ? 's' : ''} · {debatsProgrammes.length} programmé{debatsProgrammes.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltre(cat.id)}
            className={'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ' + (
              filtre === cat.id
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Section Débats ouverts */}
      {debatsOuverts.filter(d => filtre === 'tous' || filtre === 'ouverts' || d.categorie === filtre).length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse inline-block" />
            <h2 className="text-lg font-bold text-gray-900">Débats ouverts</h2>
            <span className="text-sm text-gray-400">
              ({debatsOuverts.filter(d => filtre === 'tous' || filtre === 'ouverts' || d.categorie === filtre).length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debatsOuverts
              .filter(d => filtre === 'tous' || filtre === 'ouverts' || d.categorie === filtre)
              .map(debat => (
                <div key={debat.id} className="rounded-xl p-5 shadow-md text-white" style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)' }}>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded font-bold">💬 OUVERT</span>
                    <span className={'text-xs px-2 py-1 rounded font-medium ' + getBadgeCategorie(debat.categorie)}>
                      {debat.categorie}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-2">{debat.titre}</h3>
                  <p className="text-green-200 text-sm mb-3 line-clamp-2">{debat.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-green-300 flex gap-3">
                      <span>👁️ {debat.vues} vues</span>
                      <span>💬 {debat._count?.messages ?? 0} message{(debat._count?.messages ?? 0) > 1 ? 's' : ''}</span>
                    </div>
                    <Link
                      href={estConnecte ? '/debats/' + debat.id : '/auth/inscription'}
                      className="bg-green-500 hover:bg-green-400 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                    >
                      {estConnecte ? 'Participer' : 'Rejoindre'}
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Section Débats programmés */}
      {debatsProgrammes.filter(d => filtre === 'tous' || filtre === 'programmes' || d.categorie === filtre).length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📅</span>
            <h2 className="text-lg font-bold text-gray-900">Débats programmés</h2>
            <span className="text-sm text-gray-400">
              ({debatsProgrammes.filter(d => filtre === 'tous' || filtre === 'programmes' || d.categorie === filtre).length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debatsProgrammes
              .filter(d => filtre === 'tous' || filtre === 'programmes' || d.categorie === filtre)
              .map(debat => (
                <div key={debat.id} className="rounded-xl p-5 shadow-md text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d2137)' }}>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-blue-400 bg-opacity-30 border border-blue-300 px-2 py-1 rounded font-medium">📅 Programmé</span>
                    <span className={'text-xs px-2 py-1 rounded font-medium ' + getBadgeCategorie(debat.categorie)}>
                      {debat.categorie}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-2">{debat.titre}</h3>
                  <p className="text-blue-200 text-sm mb-3 line-clamp-2">{debat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-300">
                      📅 {new Date(debat.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Link
                      href={estConnecte ? '/debats/' + debat.id : '/auth/inscription'}
                      className="bg-blue-500 hover:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                    >
                      {estConnecte ? 'Voir le sujet' : 'Rejoindre'}
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {debatsOuverts.filter(d => filtre === 'tous' || filtre === 'ouverts' || d.categorie === filtre).length === 0 &&
       debatsProgrammes.filter(d => filtre === 'tous' || filtre === 'programmes' || d.categorie === filtre).length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">Aucun débat dans cette catégorie</p>
          <p className="text-sm mt-1">Revenez bientôt ou choisissez une autre catégorie</p>
        </div>
      )}

      {/* CTA visiteurs */}
      {!estConnecte && (
        <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Rejoignez la communauté</h2>
          <p className="text-gray-600 mb-4">Inscrivez-vous pour participer aux débats et soumettre vos arguments</p>
          <Link href="/auth/inscription" className="inline-block bg-blue-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition">
            Créer un compte gratuitement
          </Link>
        </div>
      )}
    </div>
  );
}