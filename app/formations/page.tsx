'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plateforme-debat-backend.onrender.com/api';

const MOCK_FORMATIONS = [
  {
    id: 'F1',
    titre: 'Introduction au débat juridique',
    description: 'Apprenez les fondamentaux du débat structuré et de l\'argumentation juridique en contexte haïtien.',
    niveau: 'DEBUTANT',
    categorie: 'Droit',
    duree: '4h 30min',
    modules: 8,
    prix: 0,
    publie: true,
    formats: ['PDF', 'Quiz'],
    prerequis: 'Aucun prérequis nécessaire',
    apercu: true,
    resume: 'Ce cours vous initie aux règles fondamentales du débat structuré. Vous apprendrez à construire un argument solide, à réfuter efficacement et à vous exprimer avec clarté devant un public.',
    videoUrl: '',
    lecons: [
      { titre: 'Introduction au débat structuré', dureeMin: 20 },
      { titre: 'Les règles fondamentales', dureeMin: 25 },
      { titre: 'Construction d\'un argument', dureeMin: 30 },
      { titre: 'La réfutation efficace', dureeMin: 25 },
      { titre: 'Prise de parole en public', dureeMin: 35 },
      { titre: 'Quiz final', dureeMin: 15 },
    ],
    inscrits: [
      { id: 'U1', prenom: 'Jean', nom: 'Pierre', email: 'jean@mail.com', statut: 'EN_COURS', progression: 60, certificat: false },
      { id: 'U2', prenom: 'Marie', nom: 'Paul', email: 'marie@mail.com', statut: 'TERMINE', progression: 100, certificat: true },
      { id: 'U3', prenom: 'Louis', nom: 'René', email: 'louis@mail.com', statut: 'EN_COURS', progression: 30, certificat: false },
    ],
    _count: { lecons: 8, inscriptions: 124 },
  },
  {
    id: 'F2',
    titre: 'Droit constitutionnel haïtien',
    description: 'Maîtrisez les grands principes constitutionnels et leur application dans le système judiciaire haïtien.',
    niveau: 'INTERMEDIAIRE',
    categorie: 'Droit',
    duree: '8h 15min',
    modules: 14,
    prix: 35,
    publie: true,
    formats: ['PDF', 'Quiz', 'Vidéo'],
    prerequis: 'Avoir complété Introduction au débat juridique ou équivalent',
    apercu: true,
    resume: 'Ce cours approfondit votre compréhension du système constitutionnel haïtien. Vous étudierez les droits fondamentaux, la séparation des pouvoirs et la jurisprudence locale.',
    videoUrl: '',
    lecons: [
      { titre: 'Histoire constitutionnelle d\'Haïti', dureeMin: 40 },
      { titre: 'Les droits fondamentaux', dureeMin: 45 },
      { titre: 'Séparation des pouvoirs', dureeMin: 35 },
      { titre: 'La justice constitutionnelle', dureeMin: 50 },
      { titre: 'Analyse de jurisprudence', dureeMin: 60 },
    ],
    inscrits: [
      { id: 'U4', prenom: 'Anne', nom: 'Joseph', email: 'anne@mail.com', statut: 'EN_COURS', progression: 75, certificat: false },
      { id: 'U5', prenom: 'Marc', nom: 'Dupont', email: 'marc@mail.com', statut: 'TERMINE', progression: 100, certificat: true },
    ],
    _count: { lecons: 14, inscriptions: 67 },
  },
  {
    id: 'F3',
    titre: 'Rhétorique et persuasion avancée',
    description: 'Techniques avancées de persuasion, de plaidoirie et de négociation pour les débatteurs expérimentés.',
    niveau: 'AVANCE',
    categorie: 'Rhétorique',
    duree: '12h 00min',
    modules: 18,
    prix: 35,
    publie: true,
    formats: ['PDF', 'Quiz', 'Vidéo'],
    prerequis: 'Minimum 6 mois de pratique du débat et niveau intermédiaire validé',
    apercu: false,
    resume: 'Maîtrisez les techniques avancées de la rhétorique et de la persuasion. Ce cours s\'adresse aux débatteurs expérimentés souhaitant perfectionner leur plaidoirie.',
    videoUrl: '',
    lecons: [
      { titre: 'Les figures de style avancées', dureeMin: 55 },
      { titre: 'Plaidoirie et éloquence', dureeMin: 70 },
      { titre: 'Négociation stratégique', dureeMin: 65 },
    ],
    inscrits: [],
    _count: { lecons: 18, inscriptions: 32 },
  },
  {
    id: 'F4',
    titre: 'Prise de parole en public',
    description: 'Développez votre confiance et votre aisance pour intervenir efficacement dans tout type de débat.',
    niveau: 'DEBUTANT',
    categorie: 'Communication',
    duree: '3h 15min',
    modules: 6,
    prix: 0,
    publie: true,
    formats: ['PDF', 'Quiz', 'Vidéo'],
    prerequis: 'Aucun prérequis',
    apercu: true,
    resume: 'Apprenez à gérer votre stress, structurer vos interventions et capter l\'attention de votre audience. Ce cours pratique vous donne les outils pour prendre la parole avec assurance.',
    videoUrl: '',
    lecons: [
      { titre: 'Gérer le trac', dureeMin: 25 },
      { titre: 'Structurer son discours', dureeMin: 30 },
      { titre: 'Le langage non-verbal', dureeMin: 35 },
    ],
    inscrits: [
      { id: 'U7', prenom: 'Patrick', nom: 'Fils', email: 'patrick@mail.com', statut: 'TERMINE', progression: 100, certificat: false },
      { id: 'U8', prenom: 'Nadège', nom: 'Saint', email: 'nadege@mail.com', statut: 'EN_COURS', progression: 50, certificat: false },
    ],
    _count: { lecons: 6, inscriptions: 203 },
  },
  {
    id: 'F5',
    titre: 'Philosophie du droit',
    description: 'Explorer les fondements philosophiques du droit et leur impact sur la justice sociale en Haïti.',
    niveau: 'AVANCE',
    categorie: 'Philosophie',
    duree: '10h 30min',
    modules: 16,
    prix: 35,
    publie: true,
    formats: ['PDF', 'Vidéo'],
    prerequis: 'Culture juridique et philosophique de niveau baccalauréat',
    apercu: true,
    resume: 'Une exploration rigoureuse des fondements philosophiques du droit. Vous analyserez les grands courants de la pensée juridique et leur application dans le contexte haïtien.',
    videoUrl: '',
    lecons: [
      { titre: 'Justice et droit naturel', dureeMin: 60 },
      { titre: 'Positivisme juridique', dureeMin: 55 },
      { titre: 'Droit et morale', dureeMin: 65 },
    ],
    inscrits: [],
    _count: { lecons: 16, inscriptions: 21 },
  },
];

const FORM_COURS_VIDE = {
  titre: '',
  description: '',
  resume: '',
  niveau: 'DEBUTANT',
  categorie: 'Droit',
  duree: '',
  modules: 8,
  prix: 0,
  prerequis: '',
  publie: true,
};

const CATEGORIES_LISTE = ['Tous', 'Droit', 'Rhétorique', 'Philosophie', 'Communication'];
const CATEGORIES_OPTIONS = ['Droit', 'Rhétorique', 'Philosophie', 'Communication', 'Autre'];
const NIVEAUX = [
  { id: 'tous', label: 'Tous les niveaux' },
  { id: 'DEBUTANT', label: '🟢 Débutant' },
  { id: 'INTERMEDIAIRE', label: '🟡 Intermédiaire' },
  { id: 'AVANCE', label: '🔴 Avancé' },
];
const FILTRES_PRIX = [
  { id: 'tous', label: 'Tous' },
  { id: 'gratuit', label: '🆓 Gratuits' },
  { id: 'payant', label: '💳 Payants (35 USD)' },
];

export default function PageFormations() {
  const [formations, setFormations] = useState<any[]>(MOCK_FORMATIONS);
  const [formationSelectionnee, setFormationSelectionnee] = useState<any>(null);
  const [vueInscrits, setVueInscrits] = useState<any>(null);
  const [modalCours, setModalCours] = useState(false);
  const [coursEdition, setCoursEdition] = useState<any>(null);
  const [formCours, setFormCours] = useState<any>(FORM_COURS_VIDE);
  const [videoFichier, setVideoFichier] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [videoExistante, setVideoExistante] = useState<string>('');
  const [uploadProgression, setUploadProgression] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [filtrePrix, setFiltrePrix] = useState('tous');
  const [filtreNiveau, setFiltreNiveau] = useState('tous');
  const [filtreCategorie, setFiltreCategorie] = useState('Tous');
  const [modalPaiement, setModalPaiement] = useState<any>(null);
  const [avecCertificat, setAvecCertificat] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { estConnecte, utilisateur } = useAuthStore();
  const router = useRouter();

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '');
  const getToken = () => localStorage.getItem('access_token') || '';

  useEffect(() => {
    fetch(API_URL + '/cours')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length) setFormations(data); })
      .catch(() => {});
  }, []);

  const formationsFiltrees = formations.filter(f => {
    if (filtrePrix === 'gratuit' && f.prix > 0) return false;
    if (filtrePrix === 'payant' && f.prix === 0) return false;
    if (filtreNiveau !== 'tous' && f.niveau !== filtreNiveau) return false;
    if (filtreCategorie !== 'Tous' && f.categorie !== filtreCategorie) return false;
    return true;
  });

  const getNiveauInfo = (niveau: string) => {
    if (niveau === 'DEBUTANT') return { label: 'Débutant', emoji: '🟢', bg: 'bg-green-100', text: 'text-green-700' };
    if (niveau === 'INTERMEDIAIRE') return { label: 'Intermédiaire', emoji: '🟡', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    return { label: 'Avancé', emoji: '🔴', bg: 'bg-red-100', text: 'text-red-700' };
  };

  const getStatutStyle = (statut: string) => {
    if (statut === 'TERMINE') return 'bg-green-100 text-green-700';
    if (statut === 'EN_COURS') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  const inputStyle = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Gestion vidéo
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    const maxTaille = 500 * 1024 * 1024; // 500 MB
    if (fichier.size > maxTaille) {
      alert('La vidéo ne doit pas dépasser 500 MB');
      return;
    }

    const formatsAcceptes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!formatsAcceptes.includes(fichier.type)) {
      alert('Format accepté : MP4, WebM, MOV, AVI');
      return;
    }

    setVideoFichier(fichier);
    const url = URL.createObjectURL(fichier);
    setVideoPreview(url);
  };

  const supprimerVideo = () => {
    setVideoFichier(null);
    setVideoPreview('');
    setVideoExistante('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const formatTaille = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // CRUD Admin
  const ouvrirCreation = () => {
    setCoursEdition(null);
    setFormCours(FORM_COURS_VIDE);
    setVideoFichier(null);
    setVideoPreview('');
    setVideoExistante('');
    setModalCours(true);
  };

  const ouvrirEdition = (cours: any) => {
    setCoursEdition(cours);
    setFormCours({
      titre: cours.titre,
      description: cours.description,
      resume: cours.resume || '',
      niveau: cours.niveau,
      categorie: cours.categorie,
      duree: cours.duree,
      modules: cours.modules,
      prix: cours.prix,
      prerequis: cours.prerequis || '',
      publie: cours.publie,
    });
    setVideoFichier(null);
    setVideoPreview('');
    setVideoExistante(cours.videoUrl || '');
    setModalCours(true);
  };

  const soumettreFormCours = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);

    const prixFinal = formCours.prix === 0 ? 0 : 35;
    let videoUrl = videoExistante;

    // Simuler upload vidéo si fichier sélectionné
    if (videoFichier) {
      setUploading(true);
      // Simulation progression upload
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setUploadProgression(i);
      }

      try {
        const formData = new FormData();
        formData.append('video', videoFichier);
        const res = await fetch(API_URL + '/cours/upload-video', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + getToken() },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          videoUrl = data.url;
        } else {
          // Mode démo — utiliser URL locale
          videoUrl = videoPreview;
        }
      } catch {
        videoUrl = videoPreview;
      }
      setUploading(false);
      setUploadProgression(0);
    }

    const formats = ['PDF', 'Quiz'];
    if (videoUrl) formats.push('Vidéo');

    const body = { ...formCours, prix: prixFinal, videoUrl, formats };

    try {
      const url = coursEdition ? API_URL + '/cours/' + coursEdition.id : API_URL + '/cours';
      const methode = coursEdition ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method: methode,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (coursEdition) {
          setFormations(prev => prev.map(f => f.id === coursEdition.id ? { ...f, ...data } : f));
        } else {
          setFormations(prev => [{ ...data, inscrits: [], lecons: [], _count: { lecons: body.modules, inscriptions: 0 } }, ...prev]);
        }
      } else throw new Error();
    } catch {
      if (coursEdition) {
        setFormations(prev => prev.map(f => f.id === coursEdition.id ? { ...f, ...body } : f));
      } else {
        setFormations(prev => [{
          id: 'F' + Date.now(), ...body, inscrits: [], lecons: [],
          _count: { lecons: body.modules, inscriptions: 0 },
        }, ...prev]);
      }
    } finally {
      setEnvoi(false);
      setModalCours(false);
      setCoursEdition(null);
      setVideoFichier(null);
      setVideoPreview('');
    }
  };

  const supprimerCours = async (id: string) => {
    if (!confirm('Supprimer ce cours définitivement ?')) return;
    try {
      await fetch(API_URL + '/cours/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + getToken() },
      });
    } catch {}
    setFormations(prev => prev.filter(f => f.id !== id));
    if (formationSelectionnee?.id === id) setFormationSelectionnee(null);
  };

  const montantTotal = (formation: any) => formation.prix + (avecCertificat ? 15 : 0);

  // Modal formation
  const ModalFormCours = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-blue-900">
              {coursEdition ? 'Modifier le cours' : 'Créer un cours'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Les cours sont créés par les formateurs — l'IA est un outil de support</p>
          </div>
          <button onClick={() => setModalCours(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={soumettreFormCours} className="p-6 space-y-5">

          {/* Informations textuelles */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
              📝 Informations du cours
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du cours <span className="text-red-500">*</span></label>
              <input type="text" value={formCours.titre} onChange={e => setFormCours({ ...formCours, titre: e.target.value })}
                placeholder="Ex : Introduction au débat juridique" required className={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description courte <span className="text-red-500">*</span></label>
              <textarea value={formCours.description} onChange={e => setFormCours({ ...formCours, description: e.target.value })}
                placeholder="Description affichée sur la carte du cours (2-3 lignes)..." required
                className={inputStyle + ' h-16 resize-none'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résumé détaillé
                <span className="text-gray-400 font-normal ml-1">(visible par tous les visiteurs)</span>
              </label>
              <textarea value={formCours.resume} onChange={e => setFormCours({ ...formCours, resume: e.target.value })}
                placeholder="Décrivez en détail ce que l'étudiant va apprendre, les compétences acquises, la méthodologie utilisée..."
                className={inputStyle + ' h-28 resize-none'} />
              <p className="text-xs text-gray-400 mt-1">Ce résumé est affiché à tous — même aux visiteurs non inscrits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
              <input type="text" value={formCours.prerequis} onChange={e => setFormCours({ ...formCours, prerequis: e.target.value })}
                placeholder="Ex : Aucun prérequis / Avoir complété le cours X" className={inputStyle} />
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
              ⚙️ Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select value={formCours.niveau} onChange={e => setFormCours({ ...formCours, niveau: e.target.value })} className={inputStyle}>
                  <option value="DEBUTANT">🟢 Débutant</option>
                  <option value="INTERMEDIAIRE">🟡 Intermédiaire</option>
                  <option value="AVANCE">🔴 Avancé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={formCours.categorie} onChange={e => setFormCours({ ...formCours, categorie: e.target.value })} className={inputStyle}>
                  {CATEGORIES_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée totale</label>
                <input type="text" value={formCours.duree} onChange={e => setFormCours({ ...formCours, duree: e.target.value })}
                  placeholder="Ex : 4h 30min" className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de modules</label>
                <input type="number" value={formCours.modules} onChange={e => setFormCours({ ...formCours, modules: Number(e.target.value) })}
                  min={1} className={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setFormCours({ ...formCours, prix: 0 })}
                  className={'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ' + (formCours.prix === 0 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300')}>
                  🆓 Gratuit
                </button>
                <button type="button" onClick={() => setFormCours({ ...formCours, prix: 35 })}
                  className={'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ' + (formCours.prix === 35 ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-500 hover:border-blue-300')}>
                  💳 Payant — 35 USD
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">💡 Le certificat est toujours disponible en option à +15 USD, quel que soit le prix du cours</p>
            </div>
          </div>

          {/* Upload vidéo */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
              🎥 Vidéo du cours
            </h3>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-3">
                Formats acceptés : <span className="font-medium">MP4, WebM, MOV, AVI</span> · Taille max : <span className="font-medium">500 MB</span>
              </p>

              {/* Zone de dépôt */}
              {!videoFichier && !videoExistante ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition cursor-pointer"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <div className="text-4xl mb-3">🎬</div>
                  <p className="font-medium text-gray-700 text-sm">Cliquez pour choisir une vidéo</p>
                  <p className="text-xs text-gray-400 mt-1">ou glissez-déposez votre fichier ici</p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">MP4 · WebM · MOV · AVI — max 500 MB</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Aperçu vidéo */}
                  {(videoPreview || videoExistante) && (
                    <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                      <video
                        src={videoPreview || videoExistante}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    </div>
                  )}

                  {/* Infos fichier */}
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎥</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                          {videoFichier?.name || 'Vidéo existante'}
                        </p>
                        {videoFichier && (
                          <p className="text-xs text-gray-400">{formatTaille(videoFichier.size)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition"
                      >
                        Changer
                      </button>
                      <button
                        type="button"
                        onClick={supprimerVideo}
                        className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>

            {/* Barre de progression upload */}
            {uploading && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900">Upload en cours...</span>
                  <span className="text-sm font-bold text-blue-700">{uploadProgression}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: uploadProgression + '%' }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2">Veuillez patienter pendant le téléchargement de la vidéo...</p>
              </div>
            )}

            {/* Note IA */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-2 items-start">
              <span className="text-lg flex-shrink-0">🤖</span>
              <div>
                <p className="text-xs font-semibold text-indigo-800">Support IA automatiquement inclus</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  L'IA Claude fournit un feedback sur les quiz, des explications complémentaires et des ressources additionnelles pour chaque cours. La génération de vidéo IA sera disponible prochainement.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <button type="button" onClick={() => setModalCours(false)}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={envoi || uploading}
              className="flex-1 bg-blue-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition disabled:opacity-50">
              {uploading ? 'Upload vidéo...' : envoi ? 'Enregistrement...' : coursEdition ? 'Enregistrer' : 'Créer le cours'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===== VUE INSCRITS (ADMIN) =====
  if (vueInscrits) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setVueInscrits(null)} className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-6">
          ← Retour aux formations
        </button>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-blue-900">👥 Inscrits — {vueInscrits.titre}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {(vueInscrits.inscrits || []).length} inscrit(s) · Prix : {vueInscrits.prix === 0 ? 'Gratuit' : '35 USD'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', val: (vueInscrits.inscrits || []).length, bg: 'bg-blue-50', text: 'text-blue-900' },
            { label: 'En cours', val: (vueInscrits.inscrits || []).filter((i: any) => i.statut === 'EN_COURS').length, bg: 'bg-yellow-50', text: 'text-yellow-700' },
            { label: 'Terminés', val: (vueInscrits.inscrits || []).filter((i: any) => i.statut === 'TERMINE').length, bg: 'bg-green-50', text: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className={s.bg + ' rounded-xl p-4 text-center'}>
              <div className={'text-2xl font-bold ' + s.text}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {(vueInscrits.inscrits || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p>Aucun inscrit pour le moment</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Étudiant</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Progression</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Certificat</th>
                </tr>
              </thead>
              <tbody>
                {(vueInscrits.inscrits || []).map((inscrit: any, i: number) => (
                  <tr key={inscrit.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{inscrit.prenom} {inscrit.nom}</p>
                      <p className="text-xs text-gray-400">{inscrit.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'text-xs px-2 py-1 rounded-full font-medium ' + getStatutStyle(inscrit.statut)}>
                        {inscrit.statut === 'TERMINE' ? '✅ Terminé' : inscrit.statut === 'EN_COURS' ? '📖 En cours' : '📋 Inscrit'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: inscrit.progression + '%' }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{inscrit.progression}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {inscrit.certificat ? (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">🏆 Obtenu</span>
                      ) : inscrit.statut === 'TERMINE' ? (
                        <span className="text-xs text-gray-400">Non demandé</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ===== VUE DÉTAIL =====
  if (formationSelectionnee) {
    const niv = getNiveauInfo(formationSelectionnee.niveau);
    const total = montantTotal(formationSelectionnee);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <button onClick={() => setFormationSelectionnee(null)} className="flex items-center gap-2 text-blue-700 text-sm font-medium">
            ← Retour aux formations
          </button>
          {estAdmin && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => ouvrirEdition(formationSelectionnee)} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">✏️ Modifier</button>
              <button onClick={() => supprimerCours(formationSelectionnee.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">🗑 Supprimer</button>
              <button onClick={() => setVueInscrits(formationSelectionnee)} className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition">
                👥 Inscrits ({(formationSelectionnee.inscrits || []).length})
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">

            {/* En-tête */}
            <div>
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + niv.bg + ' ' + niv.text}>{niv.emoji} {niv.label}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{formationSelectionnee.categorie}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{formationSelectionnee.titre}</h1>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Résumé du cours</p>
                <p className="text-gray-700 text-sm leading-relaxed">{formationSelectionnee.resume || formationSelectionnee.description}</p>
              </div>
            </div>

            {/* Lecteur vidéo */}
            {formationSelectionnee.videoUrl && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-lg">🎥</span>
                  <span className="font-semibold text-gray-900 text-sm">Vidéo du cours</span>
                </div>
                <div style={{ aspectRatio: '16/9' }} className="bg-black">
                  <video
                    src={formationSelectionnee.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    poster=""
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              </div>
            )}

            {/* Infos rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Durée', val: formationSelectionnee.duree, emoji: '⏱️' },
                { label: 'Modules', val: formationSelectionnee.modules + ' modules', emoji: '📚' },
                { label: 'Inscrits', val: formationSelectionnee._count?.inscriptions ?? 0, emoji: '👥' },
                { label: 'Vidéo', val: formationSelectionnee.videoUrl ? 'Incluse' : 'Non disponible', emoji: '🎥' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <div className="font-semibold text-gray-900 text-sm">{item.val}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Support IA */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 items-start">
              <div className="text-2xl">🤖</div>
              <div>
                <p className="font-semibold text-indigo-900 text-sm">Support pédagogique IA inclus</p>
                <p className="text-indigo-700 text-xs mt-1">
                  L'IA Claude accompagne votre apprentissage : feedback personnalisé sur vos quiz, explications complémentaires et ressources additionnelles. Les cours sont créés et validés par nos formateurs certifiés.
                </p>
              </div>
            </div>

            {/* Prérequis */}
            {formationSelectionnee.prerequis && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-900 mb-1 text-sm">📋 Prérequis</h3>
                <p className="text-yellow-800 text-sm">{formationSelectionnee.prerequis}</p>
              </div>
            )}

            {/* Modalités */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">🎓 Modalités d'accès</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {[
                  'Auto-formation en ligne — accès immédiat après inscription',
                  'Accompagnement possible par un formateur certifié (sur demande)',
                  'Accès illimité au contenu après achat',
                  'Support IA disponible 24h/24 pour répondre à vos questions',
                  'Certificat de complétion disponible en option à +15 USD',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan du cours */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">📖 Plan du cours</h3>
              <div className="space-y-2">
                {(formationSelectionnee.lecons || []).map((lecon: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-sm text-gray-700 flex-1">{lecon.titre}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{lecon.dureeMin} min</span>
                  </div>
                ))}
                {formationSelectionnee.modules > (formationSelectionnee.lecons?.length || 0) && (
                  <div className="text-center text-sm text-gray-400 pt-2">
                    + {formationSelectionnee.modules - (formationSelectionnee.lecons?.length || 0)} autres modules
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne achat */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-8">
              <div className="text-center mb-4">
                {formationSelectionnee.prix === 0 ? (
                  <div>
                    <span className="text-3xl font-bold text-green-600">Gratuit</span>
                    <p className="text-gray-400 text-xs mt-1">Accès complet inclus</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-blue-900">35 USD</span>
                    <p className="text-gray-400 text-xs mt-1">≈ {35 * 130} HTG</p>
                  </div>
                )}
              </div>

              {/* Option certificat */}
              <div
                className={'border-2 rounded-xl p-3 mb-4 cursor-pointer transition ' + (avecCertificat ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300')}
                onClick={() => setAvecCertificat(!avecCertificat)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Certificat de complétion</p>
                    <p className="text-xs text-gray-500">+15 USD · Attestation officielle</p>
                  </div>
                  <div className={'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ' + (avecCertificat ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300')}>
                    {avecCertificat && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              </div>

              {/* Total */}
              {(formationSelectionnee.prix > 0 || avecCertificat) && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Formation</span>
                    <span>{formationSelectionnee.prix === 0 ? 'Gratuit' : '35 USD'}</span>
                  </div>
                  {avecCertificat && (
                    <div className="flex justify-between text-gray-600 mt-1">
                      <span>Certificat</span>
                      <span>15 USD</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{total} USD</span>
                  </div>
                </div>
              )}

              {estConnecte ? (
                <div className="space-y-2">
                  {formationSelectionnee.prix === 0 && !avecCertificat ? (
                    <button
                      onClick={() => router.push('/formations/' + formationSelectionnee.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition"
                    >
                      ✅ Commencer gratuitement →
                    </button>
                  ) : (
                    <button onClick={() => setModalPaiement(formationSelectionnee)} className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 py-3 rounded-xl font-bold transition">
                      💳 S'inscrire — {total} USD
                    </button>
                  )}
                  {formationSelectionnee.apercu && formationSelectionnee.prix > 0 && (
                    <button className="w-full bg-blue-50 text-blue-700 py-2.5 rounded-xl font-medium border border-blue-200 text-sm">👁️ Aperçu gratuit</button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <a href="/auth/inscription" className="block w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-center">Créer un compte pour accéder</a>
                  {formationSelectionnee.apercu && (
                    <button className="w-full bg-blue-50 text-blue-700 py-2.5 rounded-xl font-medium border border-blue-200 text-sm">👁️ Aperçu gratuit</button>
                  )}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                {[
                  { label: '⏱️ Durée', val: formationSelectionnee.duree },
                  { label: '📚 Modules', val: formationSelectionnee.modules + ' modules' },
                  { label: '🎥 Vidéo', val: formationSelectionnee.videoUrl ? 'Incluse' : 'Non disponible' },
                  { label: '🤖 Support IA', val: 'Inclus' },
                  { label: '📜 Certificat', val: '+15 USD en option' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs text-gray-500">
                    <span>{item.label}</span>
                    <span className="font-medium text-gray-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {modalPaiement && (
  <ModalPaiement
    montant={montantTotal(modalPaiement)}
    description={modalPaiement.titre}
    onFermer={() => setModalPaiement(null)}
  />
)}

        {modalCours && <ModalFormCours />}
      </div>
    );
  }

  // ===== VUE LISTE =====
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">📚 Formations</h1>
          <p className="text-gray-500 text-sm mt-1">
            {formationsFiltrees.length} formation{formationsFiltrees.length > 1 ? 's' : ''} · Résumés accessibles à tous · Support IA inclus
          </p>
        </div>
        {estAdmin && (
          <button onClick={ouvrirCreation} className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-300 transition text-sm">
            + Nouveau cours
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {FILTRES_PRIX.map(f => (
            <button key={f.id} onClick={() => setFiltrePrix(f.id)}
              className={'px-4 py-1.5 rounded-full text-sm font-medium border transition ' + (filtrePrix === f.id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}>
              {f.label}
            </button>
          ))}
          <div className="border-l border-gray-200 mx-1" />
          {NIVEAUX.map(n => (
            <button key={n.id} onClick={() => setFiltreNiveau(n.id)}
              className={'px-4 py-1.5 rounded-full text-sm font-medium border transition ' + (filtreNiveau === n.id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}>
              {n.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES_LISTE.map(cat => (
            <button key={cat} onClick={() => setFiltreCategorie(cat)}
              className={'px-4 py-1.5 rounded-full text-sm font-medium border transition ' + (filtreCategorie === cat ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300')}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      {formationsFiltrees.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-medium">Aucune formation dans cette catégorie</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formationsFiltrees.map(formation => {
            const niv = getNiveauInfo(formation.niveau);
            return (
              <div key={formation.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col cursor-pointer"
                onClick={() => setFormationSelectionnee(formation)}>
                <div className="p-5 flex-1">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + niv.bg + ' ' + niv.text}>{niv.emoji} {niv.label}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{formation.categorie}</span>
                    {formation.videoUrl && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🎥 Vidéo</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">{formation.titre}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{formation.description}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mb-3 flex-wrap">
                    <span>⏱️ {formation.duree}</span>
                    <span>📚 {formation.modules} modules</span>
                    <span>👥 {formation._count?.inscriptions ?? 0} inscrits</span>
                  </div>

                  {/* Résumé visible par tous */}
                  <div className="bg-blue-50 rounded-lg p-2.5 mb-3">
                    <p className="text-xs text-blue-700 line-clamp-2">{formation.resume || formation.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                    <span>🤖</span><span>Support IA inclus</span>
                  </div>

                  {estAdmin && (
                    <div className="mt-3 flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                      <button onClick={() => ouvrirEdition(formation)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">✏️ Modifier</button>
                      <button onClick={() => supprimerCours(formation.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">🗑 Supprimer</button>
                      <button onClick={() => setVueInscrits(formation)} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100">👥 Inscrits</button>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      {formation.prix === 0 ? (
                        <span className="text-lg font-bold text-green-600">Gratuit</span>
                      ) : (
                        <div>
                          <span className="text-lg font-bold text-blue-900">35 USD</span>
                          <span className="text-xs text-gray-400 ml-1">≈ {35 * 130} HTG</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">+15 USD certificat</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFormationSelectionnee(formation); }}
                      className={'text-sm px-4 py-1.5 rounded-lg font-medium transition ' + (formation.prix === 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900')}>
                      {formation.prix === 0 ? 'Commencer' : "S'inscrire"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!estConnecte && (
        <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Accédez à toutes les formations</h2>
          <p className="text-gray-600 mb-4">Créez un compte gratuit pour commencer et recevoir un support IA personnalisé.</p>
          <a href="/auth/inscription" className="inline-block bg-blue-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition">
            Créer un compte gratuitement
          </a>
        </div>
      )}

      {modalCours && <ModalFormCours />}
    </div>
  );
}