'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';

const MOCK_CLASSEMENT = [
  { userId:'u1', points:2840, niveau:12, user:{ prenom:'Marie',  nom:'Joseph',  role:'APPRENANT' }},
  { userId:'u2', points:2180, niveau:10, user:{ prenom:'Paul',   nom:'Duval',   role:'APPRENANT' }},
  { userId:'u3', points:1950, niveau:9,  user:{ prenom:'Sarah',  nom:'Luc',     role:'FORMATEUR' }},
  { userId:'u4', points:1720, niveau:8,  user:{ prenom:'René',   nom:'Fils',    role:'APPRENANT' }},
  { userId:'u5', points:1480, niveau:7,  user:{ prenom:'Jean',   nom:'Charles', role:'APPRENANT' }},
  { userId:'u6', points:1230, niveau:6,  user:{ prenom:'Anne',   nom:'Michel',  role:'APPRENANT' }},
  { userId:'u7', points:980,  niveau:5,  user:{ prenom:'Patrick',nom:'Fils',    role:'APPRENANT' }},
];

const ROLE_LABEL: Record<string,string> = {
  ADMIN:'Admin', FORMATEUR:'Formateur', APPRENANT:'Apprenant', SPECTATEUR:'Spectateur',
};

const initiales = (p:string,n:string) => (p[0]||'')+(n[0]||'');

export default function PageClassement() {
  const [classement, setClassement] = useState<any[]>(MOCK_CLASSEMENT);

  useEffect(() => {
    api.get('/gamification/classement?limite=20')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setClassement(data); })
      .catch(() => {});
  }, []);

  const top3  = classement.slice(0, 3);
  const reste = classement.slice(3);

  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <ProtectedRoute>
      <div style={{ maxWidth:'900px', margin:'0 auto' }}>
        {/* Header */}
        <div style={{ padding:'48px 40px 24px', borderBottom:'1px solid var(--line2)' }}>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'30px', fontWeight:'normal', letterSpacing:'-.015em', marginBottom:'4px' }}>
            Classement général
          </h1>
          <p style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif", fontSize:'12px', color:'var(--muted)' }}>
            Les meilleurs débatteurs — Saison 2026
          </p>
        </div>

        {/* Stats */}
        <div className="dh-stat-grid" style={{ margin:'0', borderTop:'none', borderLeft:'none', borderRight:'none' }}>
          {[['500+','Débatteurs'],['347','Débats'],['18','Tournois'],['50+','Formations']].map(([n,l])=>(
            <div key={l} className="dh-stat-card">
              <div className="dh-stat-card-n">{n}</div>
              <div className="dh-stat-card-l">{l}</div>
            </div>
          ))}
        </div>

        {/* Podium top 3 */}
        {top3.length >= 3 && (
          <div className="dh-podium" style={{ marginTop:'1px' }}>
            {podiumOrder.map((item, i) => {
              const rang = classement.indexOf(item) + 1;
              const isPremier = rang === 1;
              return (
                <div key={item.userId} className={`dh-pod dh-pod-${rang}`}>
                  <div className="dh-pod-rank">{String(rang).padStart(2,'0')}</div>
                  <div className="dh-pod-av">{initiales(item.user.prenom, item.user.nom)}</div>
                  <div className="dh-pod-name">{item.user.prenom} {item.user.nom}</div>
                  <div className="dh-pod-pts">{item.points.toLocaleString('fr-FR')}</div>
                  <div className="dh-pod-lbl">Points · Niveau {item.niveau}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reste de la liste */}
        <div className="dh-rank-list">
          {reste.map((item, i) => {
            const rang = i + 4;
            const av = initiales(item.user.prenom, item.user.nom);
            return (
              <div key={item.userId} className="dh-rank-row">
                <div className="dh-rank-n">{rang}</div>
                <div className="dh-rank-av" style={{ background:'var(--page3)', color:'var(--ink)' }}>{av}</div>
                <div style={{ flex:1 }}>
                  <div className="dh-rank-name">{item.user.prenom} {item.user.nom}</div>
                  <div className="dh-rank-role">Niveau {item.niveau} · {ROLE_LABEL[item.user.role]||item.user.role}</div>
                </div>
                <div className="dh-rank-pts">{item.points.toLocaleString('fr-FR')}</div>
                <div style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif", fontSize:'10px', color:'var(--muted)', marginLeft:'4px' }}>pts</div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
