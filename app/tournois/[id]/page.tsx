'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PageDetailTournoi() {
  const { id } = useParams();
  const router = useRouter();
  const { utilisateur } = useAuthStore();
  const [tournoi, setTournoi] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [generationEnCours, setGenerationEnCours] = useState(false);
  const [saisieResultat, setSaisieResultat] = useState<any>(null);
  const [scores, setScores] = useState({ score1: '', score2: '' });

  const charger = async () => {
    try {
      const { data } = await api.get('/tournois/' + id);
      setTournoi(data);
    } catch {
      toast.error('Tournoi introuvable');
      router.push('/tournois');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, [id]);

  const genererCalendrier = async () => {
    setGenerationEnCours(true);
    try {
      await api.post('/tournois/' + id + '/generer-calendrier');
      toast.success('🤖 Calendrier généré par IA !');
      await charger();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerationEnCours(false);
    }
  };

  const enregistrerResultat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/tournois/matchs/' + saisieResultat.id + '/resultat', {
        scoreEquipe1: Number(scores.score1),
        scoreEquipe2: Number(scores.score2),
      });
      toast.success('Résultat enregistré !');
      setSaisieResultat(null);
      setScores({ score1: '', score2: '' });
      await charger();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  if (chargement) return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </ProtectedRoute>
  );

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '');

  // Grouper les matchs par round
  const matchsParRound: Record<number, any[]> = {};
  (tournoi?.matchs || []).forEach((m: any) => {
    if (!matchsParRound[m.round]) matchsParRound[m.round] = [];
    matchsParRound[m.round].push(m);
  });
  const rounds = Object.keys(matchsParRound).map(Number).sort((a, b) => a - b);

  const getRoundLabel = (round: number, totalRounds: number) => {
    if (round === totalRounds && totalRounds > 1) return '🏆 Finale';
    if (round === totalRounds - 1 && totalRounds > 2) return '🥈 Demi-finales';
    if (round === totalRounds - 2 && totalRounds > 3) return '🥉 Quarts de finale';
    return `Round ${round}`;
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'PROGRAMME': return { bg: '#EFF6FF', color: '#1D4ED8', label: '📅 Programmé' };
      case 'EN_DIRECT': return { bg: '#FEF2F2', color: '#DC2626', label: '🔴 En direct' };
      case 'TERMINE': return { bg: '#F0FDF4', color: '#16A34A', label: '✅ Terminé' };
      default: return { bg: '#F9FAFB', color: '#6B7280', label: statut };
    }
  };

  const getStatutTournoiBadge = (statut: string) => {
    switch (statut) {
      case 'INSCRIPTION': return { bg: '#EFF6FF', color: '#1D4ED8', label: '📝 Inscriptions ouvertes' };
      case 'EN_COURS': return { bg: '#FEF9C3', color: '#92400E', label: '⚔️ En cours' };
      case 'TERMINE': return { bg: '#F0FDF4', color: '#166534', label: '🏆 Terminé' };
      case 'ANNULE': return { bg: '#FEF2F2', color: '#991B1B', label: '❌ Annulé' };
      default: return { bg: '#F9FAFB', color: '#6B7280', label: statut };
    }
  };

  const statutT = getStatutTournoiBadge(tournoi?.statut);
  const peutGenerer = estAdmin && tournoi?.statut === 'INSCRIPTION' && (tournoi?.equipes?.length || 0) >= 4;

  return (
    <ProtectedRoute>
      <div className="dh-simple-page">

        {/* En-tête du tournoi */}
        <div style={{ background: 'linear-gradient(135deg, #0A2540, #001F3F)', borderRadius: '20px', padding: '32px', marginBottom: '24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ background: statutT.bg, color: statutT.color, fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
                {statutT.label}
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>{tournoi?.nom}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', fontSize: '14px' }}>{tournoi?.description}</p>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
                <span>👥 {tournoi?.equipes?.length}/{tournoi?.maxEquipes} équipes</span>
                <span>⚔️ {tournoi?.matchs?.length} matchs</span>
                <span>📅 {new Date(tournoi?.dateDebut).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <button onClick={() => router.push('/tournois')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>
              ← Retour
            </button>
          </div>
        </div>

        {/* Bouton génération IA */}
        {peutGenerer && (
          <div style={{ background: 'linear-gradient(135deg, #065F46, #047857)', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ color: 'white' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>🤖 Prêt à générer le calendrier</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                {tournoi?.equipes?.length} équipes inscrites · L'IA Claude va tirer les sujets de débat et créer les matchs automatiquement
              </div>
            </div>
            <button
              onClick={genererCalendrier}
              disabled={generationEnCours}
              style={{ background: '#F59E0B', color: '#1C1917', fontWeight: 700, padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: generationEnCours ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              {generationEnCours ? '⏳ Génération en cours...' : '🤖 Générer avec IA'}
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

          {/* Colonne équipes */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F', marginBottom: '12px' }}>
              👥 Équipes ({tournoi?.equipes?.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tournoi?.equipes?.map((equipe: any, i: number) => (
                <div key={equipe.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: 700, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{equipe.nom}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 2px 30px' }}>
                    Cap. {equipe.capitaine?.prenom} {equipe.capitaine?.nom}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 0 30px' }}>
                    {equipe.membres?.length} membre(s)
                  </p>
                </div>
              ))}
              {tournoi?.equipes?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF', background: 'white', borderRadius: '12px' }}>
                  Aucune équipe inscrite
                </div>
              )}
            </div>
          </div>

          {/* Colonne calendrier */}
          <div>
            {rounds.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#9CA3AF', border: '2px dashed #E5E7EB' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: '#6B7280', marginBottom: '8px' }}>
                  Calendrier non encore généré
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  {peutGenerer
                    ? 'Cliquez sur le bouton vert pour que l\'IA génère automatiquement les matchs et sujets de débat.'
                    : `Il faut au moins 4 équipes inscrites pour générer le calendrier. (${tournoi?.equipes?.length || 0}/4)`
                  }
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {rounds.map(round => (
                  <div key={round}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A5F', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getRoundLabel(round, rounds.length)}
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400 }}>
                        ({matchsParRound[round].length} match{matchsParRound[round].length > 1 ? 's' : ''})
                      </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {matchsParRound[round].map((match: any) => {
                        const statut = getStatutBadge(match.statut);
                        return (
                          <div key={match.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
                            {/* Sujet IA */}
                            <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#166534', fontStyle: 'italic', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <span style={{ flexShrink: 0 }}>🤖</span>
                              <span>{match.sujet}</span>
                            </div>

                            {/* Équipes */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                              <div style={{ textAlign: 'center', padding: '10px', background: match.gagnantId === match.equipe1Id ? '#F0FDF4' : '#F9FAFB', borderRadius: '10px', border: match.gagnantId === match.equipe1Id ? '1px solid #86EFAC' : '1px solid #F1F5F9' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{match.equipe1?.nom}</div>
                                {match.statut === 'TERMINE' && (
                                  <div style={{ fontSize: '22px', fontWeight: 800, color: match.gagnantId === match.equipe1Id ? '#16A34A' : '#9CA3AF', marginTop: '4px' }}>
                                    {match.scoreEquipe1}
                                  </div>
                                )}
                              </div>
                              <div style={{ textAlign: 'center', color: '#9CA3AF', fontWeight: 700, fontSize: '12px' }}>VS</div>
                              <div style={{ textAlign: 'center', padding: '10px', background: match.gagnantId === match.equipe2Id ? '#F0FDF4' : '#F9FAFB', borderRadius: '10px', border: match.gagnantId === match.equipe2Id ? '1px solid #86EFAC' : '1px solid #F1F5F9' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{match.equipe2?.nom}</div>
                                {match.statut === 'TERMINE' && (
                                  <div style={{ fontSize: '22px', fontWeight: 800, color: match.gagnantId === match.equipe2Id ? '#16A34A' : '#9CA3AF', marginTop: '4px' }}>
                                    {match.scoreEquipe2}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Bas de carte */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ background: statut.bg, color: statut.color, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                                  {statut.label}
                                </span>
                                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                  {new Date(match.dateMatch).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              {estAdmin && match.statut !== 'TERMINE' && (
                                <button
                                  onClick={() => { setSaisieResultat(match); setScores({ score1: '', score2: '' }); }}
                                  style={{ fontSize: '11px', background: '#1E3A5F', color: 'white', padding: '4px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Saisir résultat
                                </button>
                              )}
                              {match.gagnantId && (
                                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                                  🏆 {match.gagnantId === match.equipe1Id ? match.equipe1?.nom : match.equipe2?.nom}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal saisie résultat */}
        {saisieResultat && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F', marginBottom: '8px' }}>Saisir le résultat</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '20px', fontStyle: 'italic' }}>
                🤖 {saisieResultat.sujet}
              </p>
              <form onSubmit={enregistrerResultat}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{saisieResultat.equipe1?.nom}</div>
                    <input
                      type="number"
                      min="0"
                      value={scores.score1}
                      onChange={e => setScores(s => ({ ...s, score1: e.target.value }))}
                      required
                      style={{ width: '100%', textAlign: 'center', fontSize: '24px', fontWeight: 800, padding: '12px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ fontWeight: 800, color: '#9CA3AF', fontSize: '16px' }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{saisieResultat.equipe2?.nom}</div>
                    <input
                      type="number"
                      min="0"
                      value={scores.score2}
                      onChange={e => setScores(s => ({ ...s, score2: e.target.value }))}
                      required
                      style={{ width: '100%', textAlign: 'center', fontSize: '24px', fontWeight: 800, padding: '12px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setSaisieResultat(null)} style={{ flex: 1, padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#6B7280' }}>
                    Annuler
                  </button>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: '#1E3A5F', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                    Confirmer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
