'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const MOCK_TOURNOIS = [
  {
    id: 'T1',
    nom: 'Championnat National de Débat Haïti 2026',
    description: 'La plus grande compétition de débat juridique du pays.',
    statut: 'EN_COURS',
    dateDebut: new Date(Date.now() - 7 * 86400000).toISOString(),
    dateFin: new Date(Date.now() + 14 * 86400000).toISOString(),
    maxEquipes: 16,
    lieu: 'Port-au-Prince',
    prixInscription: 0,
    _count: { equipes: 3, matchs: 8 },
  },
  {
    id: 'T2',
    nom: 'Tournoi Inter-Universités 2026',
    description: 'Compétition entre les grandes universités haïtiennes.',
    statut: 'INSCRIPTION',
    dateDebut: new Date(Date.now() + 30 * 86400000).toISOString(),
    dateFin: new Date(Date.now() + 60 * 86400000).toISOString(),
    maxEquipes: 8,
    lieu: 'Cap-Haïtien',
    prixInscription: 0,
    _count: { equipes: 1, matchs: 0 },
  },
];

const MOCK_EQUIPES: Record<string, any[]> = {
  T1: [
    { id: 'E1', nom: 'Les Aigles du Droit', membres: ['Jean Pierre', 'Marie Paul', 'Louis Jean'], contact: '+509 1234 5678', statut: 'CONFIRME' },
    { id: 'E2', nom: 'Rhéteurs du Nord', membres: ['Anne Joseph', 'Marc Dupont'], contact: '+509 8765 4321', statut: 'CONFIRME' },
    { id: 'E3', nom: 'Forum Légal Pétion-Ville', membres: ['Clara René', 'David Michel'], contact: '+509 5555 1234', statut: 'EN_ATTENTE' },
  ],
  T2: [
    { id: 'E4', nom: 'Club Débat UNAHE', membres: ['Patrick Fils', 'Nadège Saint'], contact: '+509 4444 9876', statut: 'EN_ATTENTE' },
  ],
};

const MOCK_CLASSEMENT = [
  { rang: 1, equipe: 'Les Aigles du Droit', ville: 'Port-au-Prince', matchs: 6, victoires: 5, points: 15 },
  { rang: 2, equipe: 'Rhéteurs du Nord', ville: 'Cap-Haïtien', matchs: 6, victoires: 4, points: 12 },
  { rang: 3, equipe: 'Forum Légal Pétion-Ville', ville: 'Pétion-Ville', matchs: 6, victoires: 4, points: 12 },
  { rang: 4, equipe: 'Club Débat UNAHE', ville: 'Port-au-Prince', matchs: 6, victoires: 3, points: 9 },
  { rang: 5, equipe: 'Orateurs des Cayes', ville: 'Les Cayes', matchs: 6, victoires: 2, points: 6 },
];

const FORM_TOURNOI_VIDE = {
  nom: '', description: '', dateDebut: '', dateFin: '',
  maxEquipes: 8, lieu: '', prixInscription: 0, statut: 'INSCRIPTION',
};

export default function PageTournois() {
  const [tournois, setTournois] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<Record<string, any[]>>({});
  const [classement] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [tournoiEquipesOuvert, setTournoiEquipesOuvert] = useState<any>(null);
  const [modalInscription, setModalInscription] = useState<any>(null);
  const [modalTournoi, setModalTournoi] = useState(false);
  const [tournoiEdition, setTournoiEdition] = useState<any>(null);
  const [formTournoi, setFormTournoi] = useState<any>(FORM_TOURNOI_VIDE);
  const [formEquipe, setFormEquipe] = useState({ nom: '', membres: ['', '', '', ''], contact: '' });
  const [envoi, setEnvoi] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');
  const defileurRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const { estConnecte, utilisateur } = useAuthStore();

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '');
  const getToken = () => localStorage.getItem('access_token') || '';

  // Défilement automatique sponsors en boucle
  useEffect(() => {
    const el = defileurRef.current;
    if (!el) return;
    const anim = setInterval(() => {
      posRef.current += 0.8;
      if (posRef.current >= el.scrollWidth / 2) {
        posRef.current = 0;
      }
      el.scrollLeft = posRef.current;
    }, 16);
    return () => clearInterval(anim);
  }, [sponsors]);

  // Charger données API
  useEffect(() => {
    fetch(API_URL + '/tournois')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setTournois(data);
          // Charger équipes pour chaque tournoi
          data.forEach((t: any) => {
            fetch(API_URL + '/tournois/' + t.id + '/equipes', {
              headers: { Authorization: 'Bearer ' + getToken() },
            })
              .then(r => r.ok ? r.json() : null)
              .then(eq => {
                if (Array.isArray(eq)) {
                  setEquipes(prev => ({ ...prev, [t.id]: eq }));
                }
              })
              .catch(() => {});
          });
        }
      })
      .catch(() => {});

    fetch(API_URL + '/sponsoring/sponsors')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length) setSponsors(data); })
      .catch(() => {});
  }, []);

  const enCours = tournois.filter(t => t.statut === 'EN_COURS');
  const aVenir = tournois.filter(t => t.statut === 'INSCRIPTION');
  const termines = tournois.filter(t => t.statut === 'TERMINE' || t.statut === 'ANNULE');

  // Inscription équipe
  const inscrireEquipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    const membresFiltres = formEquipe.membres.filter(m => m.trim());
    try {
      await fetch(API_URL + '/tournois/' + modalInscription.id + '/equipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify({ nom: formEquipe.nom, membres: membresFiltres }),
      });
    } catch {}
    const nouvelleEquipe = {
      id: 'E' + Date.now(),
      nom: formEquipe.nom,
      membres: membresFiltres,
      contact: formEquipe.contact,
      statut: 'EN_ATTENTE',
    };
    setEquipes(prev => ({
      ...prev,
      [modalInscription.id]: [...(prev[modalInscription.id] || []), nouvelleEquipe],
    }));
    setMessageSucces("Équipe « " + formEquipe.nom + " » inscrite avec succès !");
    setModalInscription(null);
    setFormEquipe({ nom: '', membres: ['', '', '', ''], contact: '' });
    setEnvoi(false);
  };

  // Changer statut équipe
  const changerStatutEquipe = (tournoiId: string, equipeId: string, statut: string) => {
    setEquipes(prev => ({
      ...prev,
      [tournoiId]: prev[tournoiId].map(e => e.id === equipeId ? { ...e, statut } : e),
    }));
  };

  // Supprimer équipe
  const supprimerEquipe = (tournoiId: string, equipeId: string) => {
    if (!confirm("Annuler l'inscription de cette équipe ?")) return;
    setEquipes(prev => ({
      ...prev,
      [tournoiId]: prev[tournoiId].filter(e => e.id !== equipeId),
    }));
  };

  // CRUD Tournoi
  const soumettreFormTournoi = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    const body = {
      ...formTournoi,
      dateDebut: formTournoi.dateDebut ? new Date(formTournoi.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: formTournoi.dateFin ? new Date(formTournoi.dateFin).toISOString() : null,
      maxEquipes: Number(formTournoi.maxEquipes),
      prixInscription: Number(formTournoi.prixInscription),
    };
    try {
      const url = tournoiEdition ? API_URL + '/tournois/' + tournoiEdition.id : API_URL + '/tournois';
      const methode = tournoiEdition ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method: methode,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (tournoiEdition) {
          setTournois(prev => prev.map(t => t.id === tournoiEdition.id ? { ...t, ...data } : t));
        } else {
          setTournois(prev => [{ ...data, _count: { equipes: 0, matchs: 0 } }, ...prev]);
        }
      } else throw new Error();
    } catch {
      if (tournoiEdition) {
        setTournois(prev => prev.map(t => t.id === tournoiEdition.id ? { ...t, ...formTournoi } : t));
      } else {
        const newId = 'T' + Date.now();
        setTournois(prev => [{ id: newId, ...formTournoi, _count: { equipes: 0, matchs: 0 } }, ...prev]);
        setEquipes(prev => ({ ...prev, [newId]: [] }));
      }
    } finally {
      setEnvoi(false);
      setModalTournoi(false);
      setTournoiEdition(null);
      setFormTournoi(FORM_TOURNOI_VIDE);
    }
  };

  const supprimerTournoi = async (id: string) => {
    if (!confirm('Supprimer ce tournoi définitivement ?')) return;
    try {
      await fetch(API_URL + '/tournois/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + getToken() },
      });
    } catch {}
    setTournois(prev => prev.filter(t => t.id !== id));
  };

  const ouvrirEditionTournoi = (tournoi: any) => {
    setTournoiEdition(tournoi);
    setFormTournoi({
      nom: tournoi.nom,
      description: tournoi.description,
      dateDebut: tournoi.dateDebut?.slice(0, 16) || '',
      dateFin: tournoi.dateFin?.slice(0, 16) || '',
      maxEquipes: tournoi.maxEquipes,
      lieu: tournoi.lieu || '',
      prixInscription: tournoi.prixInscription || 0,
      statut: tournoi.statut,
    });
    setModalTournoi(true);
  };

  const getMedaille = (rang: number) => {
    if (rang === 1) return '🥇';
    if (rang === 2) return '🥈';
    if (rang === 3) return '🥉';
    return '#' + rang;
  };

  const inputStyle = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const getStatutEquipeStyle = (statut: string) => {
    if (statut === 'CONFIRME') return 'bg-green-100 text-green-700';
    if (statut === 'EN_ATTENTE') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const CarteTournoi = ({ tournoi, couleur }: { tournoi: any; couleur: string }) => {
    const equipesTournoi = equipes[tournoi.id] || [];
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
        <div className="w-2 flex-shrink-0" style={{ background: couleur }} />
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: couleur + '20', color: couleur }}>
                  {tournoi.statut === 'EN_COURS' ? '⚔️ En cours' :
                   tournoi.statut === 'INSCRIPTION' ? '📝 Inscriptions ouvertes' : '✅ Terminé'}
                </span>
                {tournoi.lieu && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">📍 {tournoi.lieu}</span>
                )}
              </div>
              <a href={"/tournois/" + tournoi.id} className="hover:text-blue-700 cursor-pointer"><h3 className="font-bold text-gray-900 text-base mb-1">{tournoi.nom}</h3></a>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{tournoi.description}</p>
              <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                <span>👥 {equipesTournoi.length}/{tournoi.maxEquipes} équipes</span>
                <span>⚔️ {tournoi._count?.matchs ?? 0} matchs</span>
                <span>📅 {new Date(tournoi.dateDebut).toLocaleDateString('fr-FR')}</span>
                {tournoi.dateFin && (
                  <span>🏁 {new Date(tournoi.dateFin).toLocaleDateString('fr-FR')}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              {tournoi.statut === 'INSCRIPTION' && !estAdmin && (
                <button
                  onClick={() => estConnecte ? setModalInscription(tournoi) : window.location.href = '/auth/inscription'}
                  className="text-sm font-medium px-4 py-2 rounded-lg text-white whitespace-nowrap transition"
                  style={{ background: couleur }}
                >
                  {estConnecte ? "Inscrire mon équipe" : "Se connecter"}
                </button>
              )}
              {tournoi.statut === 'TERMINE' && !estAdmin && (
                <a href="#classement" className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition whitespace-nowrap">
                  Voir les résultats
                </a>
              )}
              {estAdmin && (
                <>
                  {tournoi.statut === 'INSCRIPTION' && (
                    <button
                      onClick={() => setModalInscription(tournoi)}
                      className="text-sm font-medium px-4 py-2 rounded-lg text-white whitespace-nowrap transition"
                      style={{ background: couleur }}
                    >
                      + Inscrire une équipe
                    </button>
                  )}
                  <button
                    onClick={() => setTournoiEquipesOuvert(tournoi)}
                    className="text-sm font-medium px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition whitespace-nowrap"
                  >
                    👥 Équipes inscrites ({equipesTournoi.length})
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => ouvrirEditionTournoi(tournoi)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                      ✏️ Modifier
                    </button>
                    <button onClick={() => supprimerTournoi(tournoi.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                      🗑 Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Message succès */}
      {messageSucces && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm flex justify-between items-center">
          <span>✅ {messageSucces}</span>
          <button onClick={() => setMessageSucces('')} className="text-green-500 hover:text-green-700 ml-4">✕</button>
        </div>
      )}

      {/* Bandeau sponsors défilant */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 mb-8 text-white">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">
            Partenaires & Sponsors
          </p>
        </div>

        {/* Défilement en boucle */}
        <div ref={defileurRef} className="flex gap-8 overflow-hidden" style={{ scrollBehavior: 'auto' }}>
          {(sponsors.length > 0 ? [...sponsors, ...sponsors, ...sponsors] : []).map((sponsor, i) => (
            <div key={i} className="flex-shrink-0 flex items-center justify-center" style={{ width: '140px', height: '48px' }}>
              {sponsor.logoUrl && !sponsor.logoUrl.startsWith('#') ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.nom}
                  style={{ maxWidth: '130px', maxHeight: '44px', width: 'auto', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                />
              ) : (
                <div className="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap text-white text-opacity-80"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  {sponsor.nom}
                </div>
              )}
            </div>
          ))}
          {sponsors.length === 0 && (
            <p className="text-blue-300 text-sm italic">Aucun sponsor actif — ajoutez-en depuis le dashboard admin</p>
          )}
        </div>
      </div>

      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">🏆 Tournois de débat</h1>
          <p className="text-gray-500 text-sm mt-1">
            Calendrier et matchs gérés automatiquement par l'IA Claude
          </p>
        </div>
        {estAdmin && (
          <button
            onClick={() => { setTournoiEdition(null); setFormTournoi(FORM_TOURNOI_VIDE); setModalTournoi(true); }}
            className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-300 transition text-sm"
          >
            + Nouveau tournoi
          </button>
        )}
      </div>

      {/* Tournois en cours */}
      {enCours.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse inline-block" />
            Tournois en cours
          </h2>
          <div className="space-y-4">
            {enCours.map(t => <CarteTournoi key={t.id} tournoi={t} couleur="#D97706" />)}
          </div>
        </div>
      )}

      {/* Inscriptions ouvertes */}
      {aVenir.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Inscriptions ouvertes
          </h2>
          <div className="space-y-4">
            {aVenir.map(t => <CarteTournoi key={t.id} tournoi={t} couleur="#1e40af" />)}
          </div>
        </div>
      )}

      {/* Terminés */}
      {termines.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">✅</span>
            Tournois terminés
          </h2>
          <div className="space-y-4">
            {termines.map(t => <CarteTournoi key={t.id} tournoi={t} couleur="#6b7280" />)}
          </div>
        </div>
      )}

      {tournois.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-lg font-medium">Aucun tournoi pour le moment</p>
          <p className="text-sm mt-2">Revenez bientôt !</p>
        </div>
      )}

      {/* Classement */}
      <div id="classement" className="mt-12">
        <h2 className="text-xl font-bold text-blue-900 mb-6">🏅 Classement général — Saison 2026</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Rang</th>
                <th className="px-4 py-3 text-left font-semibold">Équipe</th>
                <th className="px-4 py-3 text-left font-semibold">Ville</th>
                <th className="px-4 py-3 text-center font-semibold">Matchs</th>
                <th className="px-4 py-3 text-center font-semibold">Victoires</th>
                <th className="px-4 py-3 text-center font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              {classement.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-xl text-center">{getMedaille(item.rang)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.equipe}</td>
                  <td className="px-4 py-3 text-gray-500">{item.ville}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.matchs}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{item.victoires}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-900">{item.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info IA */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-6 flex gap-4 items-start">
        <div className="text-3xl">🤖</div>
        <div>
          <h3 className="font-bold text-blue-900 mb-1">Gestion intelligente par IA</h3>
          <p className="text-gray-600 text-sm">
            Le calendrier des matchs, le tirage au sort des sujets et l'avancement des rounds sont entièrement gérés par Claude. L'administrateur saisit uniquement les résultats de chaque match.
          </p>
        </div>
      </div>

      {/* ============ MODAL ÉQUIPES INSCRITES (ADMIN) ============ */}
      {tournoiEquipesOuvert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-blue-900">👥 Équipes inscrites</h2>
                <p className="text-sm text-gray-500 mt-0.5">{tournoiEquipesOuvert.nom}</p>
              </div>
              <button onClick={() => setTournoiEquipesOuvert(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {(equipes[tournoiEquipesOuvert.id] || []).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-gray-500 font-medium">Aucune équipe inscrite pour le moment</p>
                  <p className="text-gray-400 text-sm mt-1">Les inscriptions apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(equipes[tournoiEquipesOuvert.id] || []).map((equipe) => (
                    <div key={equipe.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{equipe.nom}</h3>
                          {equipe.contact && (
                            <p className="text-xs text-gray-400 mt-0.5">📱 {equipe.contact}</p>
                          )}
                        </div>
                        <select
                          value={equipe.statut}
                          onChange={e => changerStatutEquipe(tournoiEquipesOuvert.id, equipe.id, e.target.value)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer border-0 outline-none ${getStatutEquipeStyle(equipe.statut)}`}
                        >
                          <option value="EN_ATTENTE">⏳ En attente</option>
                          <option value="CONFIRME">✅ Confirmée</option>
                          <option value="REFUSE">❌ Refusée</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Membres de l'équipe :</p>
                        <div className="flex flex-wrap gap-2">
                          {equipe.membres.map((membre: string, i: number) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                              {membre}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => supprimerEquipe(tournoiEquipesOuvert.id, equipe.id)}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        🗑 Annuler l'inscription
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-blue-50 rounded-xl p-4 text-xs text-blue-700">
                🤖 Une fois les inscriptions closes, allez dans l'onglet <strong>Admin → Tournois</strong> pour générer le calendrier automatiquement avec l'IA.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL INSCRIPTION ÉQUIPE ============ */}
      {modalInscription && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-blue-900">Inscrire une équipe</h2>
                <p className="text-sm text-gray-500 mt-0.5">{modalInscription.nom}</p>
              </div>
              <button onClick={() => setModalInscription(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>
            <form onSubmit={inscrireEquipe} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipe</label>
                <input
                  type="text"
                  value={formEquipe.nom}
                  onChange={e => setFormEquipe({ ...formEquipe, nom: e.target.value })}
                  placeholder="Ex : Les Aigles du Droit"
                  required
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membres (2 à 4 personnes)
                </label>
                {formEquipe.membres.map((m, i) => (
                  <input
                    key={i}
                    type="text"
                    value={m}
                    onChange={e => {
                      const n = [...formEquipe.membres];
                      n[i] = e.target.value;
                      setFormEquipe({ ...formEquipe, membres: n });
                    }}
                    placeholder={`Membre ${i + 1}${i < 2 ? ' (obligatoire)' : ' (optionnel)'}`}
                    required={i < 2}
                    className={inputStyle + ' mb-2'}
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact du capitaine</label>
                <input
                  type="text"
                  value={formEquipe.contact}
                  onChange={e => setFormEquipe({ ...formEquipe, contact: e.target.value })}
                  placeholder="Téléphone ou WhatsApp"
                  className={inputStyle}
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                🤖 L'IA générera automatiquement le calendrier et les sujets une fois les inscriptions closes.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalInscription(null)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={envoi} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50">
                  {envoi ? 'Inscription...' : "Confirmer l'inscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL CRÉATION/ÉDITION TOURNOI (ADMIN) ============ */}
      {modalTournoi && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-blue-900">
                {tournoiEdition ? 'Modifier le tournoi' : 'Créer un tournoi'}
              </h2>
              <button onClick={() => setModalTournoi(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>
            <form onSubmit={soumettreFormTournoi} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du tournoi</label>
                <input type="text" value={formTournoi.nom} onChange={e => setFormTournoi({ ...formTournoi, nom: e.target.value })} placeholder="Ex : Championnat National 2026" required className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formTournoi.description} onChange={e => setFormTournoi({ ...formTournoi, description: e.target.value })} placeholder="Décrivez le tournoi..." className={inputStyle + ' h-20 resize-none'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input type="datetime-local" value={formTournoi.dateDebut} onChange={e => setFormTournoi({ ...formTournoi, dateDebut: e.target.value })} required className={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input type="datetime-local" value={formTournoi.dateFin} onChange={e => setFormTournoi({ ...formTournoi, dateFin: e.target.value })} className={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input type="text" value={formTournoi.lieu} onChange={e => setFormTournoi({ ...formTournoi, lieu: e.target.value })} placeholder="Port-au-Prince" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. équipes</label>
                  <select value={formTournoi.maxEquipes} onChange={e => setFormTournoi({ ...formTournoi, maxEquipes: Number(e.target.value) })} className={inputStyle}>
                    <option value={4}>4 équipes</option>
                    <option value={8}>8 équipes</option>
                    <option value={16}>16 équipes</option>
                    <option value={32}>32 équipes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={formTournoi.statut} onChange={e => setFormTournoi({ ...formTournoi, statut: e.target.value })} className={inputStyle}>
                  <option value="INSCRIPTION">Inscriptions ouvertes</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalTournoi(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={envoi} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50">
                  {envoi ? 'Enregistrement...' : tournoiEdition ? 'Enregistrer' : 'Créer le tournoi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}