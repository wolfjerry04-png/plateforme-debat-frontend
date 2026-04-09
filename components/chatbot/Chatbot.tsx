'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  contenu: string;
}

const LANGUES_LABELS: Record<string, string> = {
  fr: 'français',
  kr: 'kreyòl ayisyen',
  en: 'English',
};

const MESSAGES_ACCUEIL: Record<string, string> = {
  fr: "Bonjour ! Je suis l'assistant IA de Débat Haïti. Comment puis-je vous aider ?",
  kr: "Bonjou ! Mwen se asistan IA Débat Haïti a. Kijan mwen ka ede ou ?",
  en: "Hello! I'm the Débat Haïti AI assistant. How can I help you?",
};

const SUGGESTIONS: Record<string, string[]> = {
  fr: [
    'Comment participer à un débat ?',
    'Comment inscrire mon équipe ?',
    'Comment accéder aux formations ?',
    'Comment devenir Premium ?',
  ],
  kr: [
    'Kijan pou patisipe nan yon débat ?',
    'Kijan pou enskri ekip mwen ?',
    'Kijan pou jwenn aksè nan fòmasyon yo ?',
    'Kijan pou vin Premium ?',
  ],
  en: [
    'How to join a debate?',
    'How to register my team?',
    'How to access courses?',
    'How to become Premium?',
  ],
};

const PLACEHOLDER: Record<string, string> = {
  fr: 'Votre question...',
  kr: 'Kesyon ou...',
  en: 'Your question...',
};

const BTN_ENVOYER: Record<string, string> = {
  fr: 'Envoyer',
  kr: 'Voye',
  en: 'Send',
};

const TRADUCTION_BTN: Record<string, string> = {
  fr: '🌐 Traduire cette page',
  kr: '🌐 Tradui paj sa a',
  en: '🌐 Translate this page',
};

export default function Chatbot() {
  const [ouvert, setOuvert] = useState(false);
  const [langue, setLangue] = useState('fr');
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState('');
  const [chargement, setChargement] = useState(false);
  const [traductionActive, setTraductionActive] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // Écouter le changement de langue
  useEffect(() => {
    const syncLangue = () => {
      const saved = localStorage.getItem('debat-ht-lang') || 'fr';
      setLangue(saved);
      // Réinitialiser le message d'accueil dans la nouvelle langue
      setMessages([{
        role: 'assistant',
        contenu: MESSAGES_ACCUEIL[saved] || MESSAGES_ACCUEIL.fr,
      }]);
      setTraductionActive(false);
    };

    syncLangue();
    window.addEventListener('languagechange', syncLangue);
    window.addEventListener('storage', syncLangue);
    return () => {
      window.removeEventListener('languagechange', syncLangue);
      window.removeEventListener('storage', syncLangue);
    };
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saisie.trim() || chargement) return;

    const messageUser: Message = { role: 'user', contenu: saisie };
    setMessages(prev => [...prev, messageUser]);
    setSaisie('');
    setChargement(true);

    try {
      // On envoie la langue au backend pour que l'IA réponde dans la bonne langue
      const { data } = await api.post('/ia/chatbot', {
        message: saisie,
        langue: langue,
        instruction: `Réponds toujours en ${LANGUES_LABELS[langue] || 'français'}. Tu es l'assistant de la plateforme Débat Haïti.`,
      });
      setMessages(prev => [...prev, { role: 'assistant', contenu: data.reponse }]);
    } catch {
      const erreurs: Record<string, string> = {
        fr: 'Désolé, je rencontre une difficulté. Contactez-nous sur WhatsApp.',
        kr: 'Padon, mwen gen yon pwoblèm. Kontakte nou sou WhatsApp.',
        en: 'Sorry, I encountered an issue. Contact us on WhatsApp.',
      };
      setMessages(prev => [...prev, {
        role: 'assistant',
        contenu: erreurs[langue] || erreurs.fr,
      }]);
    } finally {
      setChargement(false);
    }
  };

  const traduirePage = async () => {
    if (langue === 'fr' || traductionActive) return;
    setTraductionActive(true);
    setChargement(true);

    // Récupérer le texte visible de la page
    const contenuPage = document.body.innerText.slice(0, 2000);
    const demande = langue === 'kr'
      ? `Tradui kontni prensipal paj sa a an kreyòl ayisyen. Rezime prensipal enfòmasyon yo: ${contenuPage}`
      : `Translate the main content of this page to English. Summarize the key information: ${contenuPage}`;

    const messageTraduction: Message = {
      role: 'user',
      contenu: langue === 'kr' ? '🌐 Tradui paj sa a an Kreyòl' : '🌐 Translate this page to English',
    };
    setMessages(prev => [...prev, messageTraduction]);

    try {
      const { data } = await api.post('/ia/chatbot', {
        message: demande,
        langue: langue,
        instruction: `Tu es un traducteur expert. Traduis en ${LANGUES_LABELS[langue]}. Sois concis et clair.`,
      });
      setMessages(prev => [...prev, { role: 'assistant', contenu: data.reponse }]);
    } catch {
      const erreur = langue === 'kr'
        ? 'Padon, tradiksyon pa disponib kounye a.'
        : 'Sorry, translation is not available right now.';
      setMessages(prev => [...prev, { role: 'assistant', contenu: erreur }]);
    } finally {
      setChargement(false);
    }
  };

  const suggestions = SUGGESTIONS[langue] || SUGGESTIONS.fr;

  return (
    <>
      <button
        onClick={() => setOuvert(!ouvert)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px',
          background: 'var(--ink)',
          color: 'white', borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0,212,255,0.4)',
          border: 'none', cursor: 'pointer',
          fontSize: '14px', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, transition: 'transform 0.2s',
        }}
      >
        {ouvert ? '✕' : '🤖'}
      </button>

      {ouvert && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px',
          width: '320px', height: '480px',
          background: 'white', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid rgba(0,0,0,0.08)',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0A2540, #001F3F)', color: 'white', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>🤖 Assistant IA</h3>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                  Débat Haïti · {langue === 'fr' ? 'Français' : langue === 'kr' ? 'Kreyòl' : 'English'}
                </p>
              </div>
              {/* Bouton traduire page si langue non-fr */}
              {langue !== 'fr' && !traductionActive && (
                <button
                  onClick={traduirePage}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white', borderRadius: '8px',
                    padding: '4px 8px', fontSize: '10px',
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {TRADUCTION_BTN[langue]}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: '16px',
                  fontSize: '13px', lineHeight: 1.5,
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #00D4FF, #7B61FF)' : '#F3F4F6',
                  color: msg.role === 'user' ? 'white' : '#1F2937',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                }}>
                  {msg.contenu}
                </div>
              </div>
            ))}
            {chargement && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#F3F4F6', padding: '10px 14px', borderRadius: '16px', borderBottomLeftRadius: '4px', fontSize: '13px', color: '#6B7280' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>●●●</span>
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSaisie(s)}
                  style={{
                    fontSize: '11px', background: '#EEF2FF', color: '#4F46E5',
                    padding: '4px 10px', borderRadius: '20px',
                    border: '1px solid #C7D2FE', cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={envoyer} style={{ padding: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder={PLACEHOLDER[langue] || PLACEHOLDER.fr}
              style={{
                flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px',
                padding: '8px 12px', fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={chargement}
              style={{
                background: 'var(--ink)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '8px 14px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', opacity: chargement ? 0.5 : 1,
              }}
            >
              {BTN_ENVOYER[langue] || 'Envoyer'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}