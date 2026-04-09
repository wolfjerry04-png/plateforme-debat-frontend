'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useDebatSocket } from '@/hooks/useDebatSocket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const MOCK_DEBATS = [
  { id: '1', titre: 'La réforme de la Constitution haïtienne est-elle nécessaire ?', description: 'Analyse des enjeux constitutionnels et démocratiques en Haïti.', statut: 'OUVERT', categorie: 'Politique', dateDebut: new Date(Date.now() - 3600000).toISOString(), vues: 142, createur: { prenom: 'Marie', nom: 'Dupont', role: 'FORMATEUR' }, messages: [] },
  { id: '2', titre: "L'économie informelle : frein ou moteur pour Haïti ?", description: "Débat sur le rôle du secteur informel dans l'économie haïtienne.", statut: 'OUVERT', categorie: 'Économie', dateDebut: new Date(Date.now() - 7200000).toISOString(), vues: 89, createur: { prenom: 'Jean', nom: 'Pierre', role: 'FORMATEUR' }, messages: [] },
  { id: '3', titre: 'La place de la religion dans la politique haïtienne', description: "Quelle est l'influence des Églises sur les décisions politiques ?", statut: 'BROUILLON', categorie: 'Religion', dateDebut: new Date(Date.now() + 86400000).toISOString(), vues: 0, createur: { prenom: 'Paul', nom: 'Henri', role: 'ADMIN' }, messages: [] },
  { id: '4', titre: 'Philosophie du droit et justice sociale en Haïti', description: 'Entre idéal philosophique et réalité judiciaire haïtienne.', statut: 'BROUILLON', categorie: 'Philosophie', dateDebut: new Date(Date.now() + 172800000).toISOString(), vues: 0, createur: { prenom: 'Anne', nom: 'Louis', role: 'FORMATEUR' }, messages: [] },
  { id: '5', titre: "Égalité hommes-femmes dans la société haïtienne", description: 'Débat sur les inégalités de genre et les solutions possibles.', statut: 'OUVERT', categorie: 'Société', dateDebut: new Date(Date.now() - 604800000).toISOString(), vues: 312, createur: { prenom: 'Clara', nom: 'René', role: 'FORMATEUR' }, messages: [] },
];

const MODULES_PAR_CATEGORIE: Record<string, string[]> = {
  'Politique': ['Introduction au débat politique', 'Argumentation et rhétorique', 'Analyse des systèmes constitutionnels'],
  'Économie': ['Économie haïtienne — bases', 'Argumentation économique', 'Données et sources fiables'],
  'Société': ['Débat sociétal et éthique', 'Argumentation inclusive', 'Communication persuasive'],
  'Religion': ['Neutralité et débat', 'Argumentation philosophique', 'Sources et références'],
  'Philosophie': ['Logique formelle', 'Éthique et débat', 'Pensée critique avancée'],
  'default': ['Introduction au débat', 'Argumentation de base', 'Communication efficace'],
};

interface FeedbackIA {
  scores: { logique: number; sources: number; persuasion: number };
  pointsForts: string[];
  pointsAmeliorer: string[];
  suggestion: string;
  moduleRecommande: string;
}

export default function PageDebat() {
  const { id } = useParams();
  const { utilisateur } = useAuthStore();
  const [debat, setDebat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [contenu, setContenu] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [feedbackIA, setFeedbackIA] = useState<FeedbackIA | null>(null);
  const [analyseEnCours, setAnalyseEnCours] = useState(false);
  const [argumentAnalyse, setArgumentAnalyse] = useState('');
  const [onglet, setOnglet] = useState<'debat' | 'feedback'>('debat');

  const peutParticiper = ['ADMIN', 'FORMATEUR', 'APPRENANT'].includes(utilisateur?.role || '');

  // ── Temps réel via WebSocket ──
  useDebatSocket({
    debatId: id as string,
    onNouveauMessage: (msg) => {
      setMessages(prev => {
        // Éviter les doublons si le message vient de nous
        if (prev.find((m: any) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
    onVotesMisAJour: (stats) => {
      setDebat((prev: any) => prev ? { ...prev, votes: stats } : prev);
    },
    onStatutDebat: (data) => {
      setDebat((prev: any) => prev ? { ...prev, statut: data.statut } : prev);
    },
  });
  const estSpectateur = utilisateur?.role === 'SPECTATEUR';

  useEffect(() => {
    const charger = async () => {
      try {
        const { data } = await api.get('/debats/' + id);
        setDebat(data);
        setMessages(data.messages || []);
      } catch {
        try {
          const res = await fetch(API_URL + '/debats/' + id);
          if (res.ok) { const data = await res.json(); setDebat(data); setMessages(data.messages || []); }
          else { const mock = MOCK_DEBATS.find(d => d.id === id); if (mock) { setDebat(mock); setMessages([]); } }
        } catch {
          const mock = MOCK_DEBATS.find(d => d.id === id); if (mock) { setDebat(mock); setMessages([]); }
        }
      } finally { setChargement(false); }
    };
    charger();
  }, [id]);

  const analyserAvecIA = async (argument: string) => {
    if (!argument.trim() || analyseEnCours) return;
    setAnalyseEnCours(true);
    setArgumentAnalyse(argument);
    setOnglet('feedback');

    const derniersMessages = messages.slice(-3).map((m: any) => m.contenu);

    try {
      // Appel sécurisé via le backend — clé Anthropic protégée côté serveur
      const { data } = await api.post('/ia/analyser-argument', {
        argument,
        titreDebat:        debat?.titre,
        categorie:         debat?.categorie,
        derniersArguments: derniersMessages,
      });
      setFeedbackIA(data);
    } catch {
      toast.error("Erreur lors de l'analyse IA");
      setOnglet('debat');
    } finally {
      setAnalyseEnCours(false);
    }
  };

  const voterDebat = async (type: 'POUR' | 'CONTRE') => {
    if (!utilisateur) { toast.error('Connectez-vous pour voter'); return; }
    try {
      await api.post('/votes', { type, debatId: id });
      // Recharger les stats du débat
      const { data } = await api.get(`/votes/debat/${id}`);
      if (data) {
        setDebat((prev: any) => prev ? { ...prev, votes: data } : prev);
      }
      toast.success('Vote enregistré');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du vote');
    }
  };

  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    setEnvoi(true);
    try {
      const { data } = await api.post('/messages', { contenu, debatId: id });
      setMessages(prev => [...prev, data]);
      setContenu('');
      toast.success('Argument envoyé !');
    } catch {
      const messageLocal = { id: Date.now().toString(), contenu, createdAt: new Date().toISOString(), auteur: { id: utilisateur?.id, prenom: utilisateur?.prenom, nom: utilisateur?.nom, role: utilisateur?.role } };
      setMessages(prev => [...prev, messageLocal]);
      setContenu('');
      toast.success('Argument envoyé !');
    } finally { setEnvoi(false); }
  };

  const Jauge = ({ label, score, couleur }: { label: string; score: number; couleur: string }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 800, color: couleur }}>{score}/10</span>
      </div>
      <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 10}%`, background: couleur, borderRadius: '100px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );

  if (chargement) return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #1e3a5f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: '#9CA3AF' }}>Chargement du débat...</p>
    </div>
  );

  if (!debat) return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
      <p style={{ color: '#374151', fontWeight: 600 }}>Débat introuvable</p>
    </div>
  );

  return (
    <div className="dh-debate-detail">

      {/* En-tête débat */}
      <div className="dh-debate-header">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, background: debat.statut === 'OUVERT' ? '#D1FAE5' : '#F3F4F6', color: debat.statut === 'OUVERT' ? '#065F46' : '#6B7280' }}>
            {debat.statut === 'OUVERT' ? '💬 OUVERT' : '🔒 ' + debat.statut}
          </span>
          {debat.categorie && <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '100px', fontWeight: 600 }}>{debat.categorie}</span>}
        </div>
        <h1 className="dh-debate-q">{debat.titre}</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 12px 0' }}>{debat.description}</p>
        {debat.createur && <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Par <strong style={{ color: '#6B7280' }}>{debat.createur.prenom} {debat.createur.nom}</strong> · {debat.createur.role}</p>}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
          <span>💬 {messages.length} argument{messages.length > 1 ? 's' : ''}</span>
          <span>👁️ {debat.vues ?? 0} vues</span>
          <span>📅 {new Date(debat.dateDebut).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:'flex', gap:'0', borderBottom:'1px solid var(--line2)', marginBottom:'24px' }}>
        {[['debat', 'Débat'], ['feedback', 'Feedback IA']].map(([val, label]) => (
          <button key={val} onClick={() => setOnglet(val as any)} className="dh-filter-tab" style={{ fontSize:'10px' , ...(onglet===val ? { color:'var(--ink)', borderBottomColor:'var(--ink)' } : {}) }}>
            {label}
          </button>
        ))}
        {analyseEnCours && <span style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif", fontSize:'11px', color:'var(--muted)', display:'flex', alignItems:'center', padding:'0 16px' }}>Analyse en cours...</span>}
      </div>

      {/* ONGLET DÉBAT */}
      {onglet === 'debat' && (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

          <div style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>💬 {messages.length} argument{messages.length > 1 ? 's' : ''}</span>
            {debat.statut === 'OUVERT' && <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />En cours</span>}
          </div>

          <div style={{ padding: '16px', minHeight: '320px', maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💭</div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Aucun argument pour le moment</p>
                <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Soyez le premier à partager votre point de vue !</p>
              </div>
            ) : messages.map((msg: any) => {
              const estMoi = msg.auteur?.id === utilisateur?.id;
              return (
                <div key={msg.id} style={{ display: 'flex', gap: '12px', flexDirection: estMoi ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: estMoi ? '#059669' : '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                    {(msg.auteur?.prenom?.[0] || '?').toUpperCase()}
                  </div>
                  <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: estMoi ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>
                      {estMoi ? 'Vous' : `${msg.auteur?.prenom} ${msg.auteur?.nom}`}
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.6, background: estMoi ? '#059669' : '#F3F4F6', color: estMoi ? 'white' : '#1F2937', borderBottomRightRadius: estMoi ? '4px' : '16px', borderBottomLeftRadius: estMoi ? '16px' : '4px' }}>
                      {msg.contenu}
                    </div>
                    {/* Bouton analyser cet argument */}
                    {peutParticiper && (
                      <button
                        onClick={() => analyserAvecIA(msg.contenu)}
                        style={{ marginTop: '6px', fontSize: '11px', color: '#7B61FF', background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)', borderRadius: '8px', padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        🤖 Analyser cet argument
                      </button>
                    )}
                    <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zone saisie */}
          {debat.statut === 'OUVERT' && peutParticiper && (
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px', background: '#F9FAFB' }}>
              <form onSubmit={envoyerMessage}>
                <textarea
                  value={contenu}
                  onChange={e => setContenu(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerMessage(e as any); } }}
                  placeholder="Partagez votre argument... (Entrée pour envoyer)"
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '10px' }}
                  rows={3}
                  maxLength={1000}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{contenu.length}/1000</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {contenu.trim() && (
                      <button type="button" onClick={() => analyserAvecIA(contenu)} style={{ background: 'rgba(123,97,255,0.1)', border: '1px solid rgba(123,97,255,0.3)', color: '#7B61FF', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        🤖 Analyser avant d'envoyer
                      </button>
                    )}
                    <button type="submit" disabled={envoi || !contenu.trim()} style={{ background: '#059669', color: 'white', padding: '8px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: envoi || !contenu.trim() ? 0.5 : 1 }}>
                      {envoi ? '...' : 'Envoyer'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {debat.statut !== 'OUVERT' && (
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px', textAlign: 'center', background: '#F9FAFB' }}>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>🔒 Ce débat est fermé.</p>
            </div>
          )}
          {debat.statut === 'OUVERT' && estSpectateur && (
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px', textAlign: 'center', background: '#F9FAFB' }}>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>👁️ Mode spectateur — lecture seule.</p>
            </div>
          )}
          {debat.statut === 'OUVERT' && !utilisateur && (
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px', textAlign: 'center', background: '#EFF6FF' }}>
              <p style={{ color: '#1D4ED8', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Connectez-vous pour participer</p>
              <a href="/auth/connexion" style={{ background: '#1e3a5f', color: 'white', padding: '8px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Se connecter</a>
            </div>
          )}
        </div>
      )}

      {/* ONGLET FEEDBACK IA */}
      {onglet === 'feedback' && (
        <div>
          {analyseEnCours ? (
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Analyse en cours...</p>
              <p style={{ fontSize: '14px', color: '#9CA3AF' }}>L'IA analyse votre argument dans le contexte du débat</p>
            </div>
          ) : feedbackIA ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Argument analysé */}
              <div style={{ background: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '16px 20px' }}>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Argument analysé</p>
                <p style={{ fontSize: '14px', color: '#374151', fontStyle: 'italic', margin: 0 }}>"{argumentAnalyse}"</p>
              </div>

              {/* Scores — 3 jauges */}
              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>📊 Scores de l'argument</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Jauge label="🧠 Logique" score={feedbackIA.scores.logique} couleur="#10B981" />
                  <Jauge label="📚 Sources & Preuves" score={feedbackIA.scores.sources} couleur="#3B82F6" />
                  <Jauge label="🎯 Persuasion" score={feedbackIA.scores.persuasion} couleur="#F59E0B" />
                </div>
                <div style={{ marginTop: '20px', padding: '12px 16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>Score moyen : </span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a5f' }}>
                    {((feedbackIA.scores.logique + feedbackIA.scores.sources + feedbackIA.scores.persuasion) / 3).toFixed(1)}/10
                  </span>
                </div>
              </div>

              {/* Points forts et à améliorer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0', padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#065F46', marginBottom: '12px' }}>✅ Points forts</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {feedbackIA.pointsForts.map((p, i) => (
                      <li key={i} style={{ fontSize: '13px', color: '#047857', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: '#FFF7ED', borderRadius: '16px', border: '1px solid #FED7AA', padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#9A3412', marginBottom: '12px' }}>💡 À améliorer</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {feedbackIA.pointsAmeliorer.map((p, i) => (
                      <li key={i} style={{ fontSize: '13px', color: '#C2410C', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestion IA — encadré jaune */}
              <div style={{ background: '#FFFBEB', borderRadius: '16px', border: '2px solid #FCD34D', padding: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#92400E', marginBottom: '8px' }}>💡 Suggestion de l'IA</h4>
                <p style={{ fontSize: '14px', color: '#78350F', lineHeight: 1.6, margin: 0 }}>{feedbackIA.suggestion}</p>
              </div>

              {/* Module recommandé — encadré bleu */}
              <div style={{ background: '#EFF6FF', borderRadius: '16px', border: '2px solid #BFDBFE', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '32px', flexShrink: 0 }}>📚</div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D4ED8', marginBottom: '4px' }}>Module recommandé</h4>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f', margin: '0 0 8px 0' }}>{feedbackIA.moduleRecommande}</p>
                  <a href="/formations" style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Accéder à la formation →</a>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { setFeedbackIA(null); setOnglet('debat'); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: '#374151' }}>
                  ← Retour au débat
                </button>
                <button onClick={() => { setFeedbackIA(null); setArgumentAnalyse(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7B61FF, #00D4FF)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  🤖 Nouvelle analyse
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ fontWeight: 800, color: '#374151', marginBottom: '8px' }}>Feedback IA</h3>
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                Cliquez sur "Analyser cet argument" sous n'importe quel message, ou écrivez votre argument et cliquez "Analyser avant d'envoyer".
              </p>
              <button onClick={() => setOnglet('debat')} style={{ background: '#1e3a5f', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                ← Aller au débat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}