'use client';

import { useState } from 'react';
import Link from 'next/link';
import ModalPaiement from '@/components/paiement/ModalPaiement';

export default function PagePremium() {
  const [modal, setModal] = useState<{ montant: number; description: string } | null>(null);

  return (
    <style>{`.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; } @media (max-width: 900px) { .plans-grid { grid-template-columns: 1fr; } } @media (max-width: 480px) { .plans-grid { gap: 16px; } }`}</style>
    <div style={{ background: '#0A0F1E', minHeight: '100vh', color: 'white', padding: '80px 24px' }}>
      {modal && <ModalPaiement montant={modal.montant} description={modal.description} onFermer={() => setModal(null)} />}

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '100px', padding: '6px 20px', marginBottom: '20px', fontSize: '13px', color: '#00D4FF', letterSpacing: '1px' }}>PLANS & TARIFS</div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>Choisissez votre plan</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>Investissez dans votre maîtrise du débat</p>
        </div>

        <div className="plans-grid">

          {/* Gratuit */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Gratuit</h2>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', lineHeight: 1 }}>0$</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>pour toujours</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['💬 Accès aux débats publics', '🤖 3 feedbacks IA / jour', '📚 2 formations gratuites', '🎥 Voir les replays'].map(a => (
                <li key={a} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{a}</li>
              ))}
            </ul>
            <Link href="/auth/inscription" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
              S'inscrire gratuitement
            </Link>
          </div>

          {/* Premium */}
          <div style={{ background: 'rgba(0,212,255,0.05)', border: '2px solid #00D4FF', borderRadius: '24px', padding: '32px', position: 'relative', transform: 'scale(1.03)', boxShadow: '0 0 40px rgba(0,212,255,0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00D4FF, #7B61FF)', borderRadius: '100px', padding: '4px 20px', fontSize: '12px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>⭐ RECOMMANDÉ</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#00D4FF', marginBottom: '8px' }}>Premium</h2>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', lineHeight: 1 }}>100$</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>par 3 mois</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['🤖 Feedbacks IA illimités', '📚 Toutes les formations', '🏆 Inscription aux tournois', '🎖️ Badge débatteur certifié', '⭐ Support prioritaire', '🎥 Replays HD illimités'].map(a => (
                <li key={a} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{a}</li>
              ))}
            </ul>

            {/* Méthodes acceptées */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {['📱 MonCash', '🅿️ PayPal', '💜 Zelle', '💳 Visa/MC'].map(m => (
                <span key={m} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 8px', color: 'rgba(255,255,255,0.7)' }}>{m}</span>
              ))}
            </div>

            <button onClick={() => setModal({ montant: 100, description: 'Plan Premium 3 mois' })} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #00D4FF, #7B61FF)', color: 'white', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
              💳 Payer maintenant
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>MonCash · PayPal · Zelle · Visa/Mastercard</p>
          </div>

          {/* Offres cours */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(123,97,255,0.4)', borderRadius: '24px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#7B61FF', marginBottom: '20px' }}>Offres Cours</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {[{ label: '2 cours au choix', prix: '60$', remise: '-14%' }, { label: '3 cours au choix', prix: '80$', remise: '-24%' }].map(o => (
                <div key={o.label} style={{ background: 'rgba(123,97,255,0.1)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: '16px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{o.label}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Formations payantes</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#7B61FF' }}>{o.prix}</div>
                      <div style={{ fontSize: '11px', background: 'rgba(62,180,137,0.2)', color: '#3EB489', borderRadius: '6px', padding: '2px 8px' }}>{o.remise}</div>
                    </div>
                  </div>
                  <button onClick={() => setModal({ montant: o.prix === '60$' ? 60 : 80, description: o.label + ' - Débat Haïti' })} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #7B61FF, #00D4FF)', color: 'white', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                    💳 Payer {o.prix}
                  </button>
                </div>
              ))}
            </div>

            {/* WhatsApp secondaire */}
            <a href="https://wa.me/50999999999" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', padding: '12px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              💬 Questions ? WhatsApp
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: '80px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>Questions fréquentes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              { q: 'Quels moyens de paiement acceptez-vous ?', r: 'MonCash, PayPal, Zelle, et Visa/Mastercard. Cliquez sur "Payer" pour voir les instructions.' },
              { q: 'Le plan est-il renouvelable ?', r: 'Oui, tous les 3 mois. Vous pouvez annuler à tout moment via WhatsApp.' },
              { q: 'Les formations sont-elles incluses ?', r: 'Le plan Premium inclut toutes les formations. En Gratuit, 2 formations sont accessibles.' },
            ].map(faq => (
              <div key={faq.q} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 24px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>❓ {faq.q}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{faq.r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
