'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PageContact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [envoi, setEnvoi] = useState(false);

  const WHATSAPP_NUMBER = '50912345678';

  const envoyerWhatsApp = () => {
    const texte = 'Bonjour, je suis ' + form.nom + '. Sujet : ' + form.sujet + '. ' + form.message;
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texte);
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setTimeout(() => {
      toast.success('Message envoyé avec succès !');
      setForm({ nom: '', email: '', sujet: '', message: '' });
      setEnvoi(false);
    }, 1000);
  };

  return (
    <div className="dh-simple-page">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Nous contacter</h1>
        <p className="text-gray-500">Nous sommes là pour vous aider</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-blue-900 mb-4">Envoyer un message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Votre nom"
              value={form.nom}
              onChange={(e) => setForm({...form, nom: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Votre e-mail"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Sujet"
              value={form.sujet}
              onChange={(e) => setForm({...form, sujet: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            />
            <textarea
              placeholder="Votre message"
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={envoi}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition disabled:opacity-50"
            >
              {envoi ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-2">WhatsApp</h3>
            <p className="text-green-700 text-sm mb-4">
              Contactez-nous directement pour une réponse rapide
            </p>
            <button
              onClick={envoyerWhatsApp}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition"
            >
              Ouvrir WhatsApp
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-1">E-mail</h3>
            <p className="text-blue-700">contact@debat-haiti.ht</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-1">Localisation</h3>
            <p className="text-gray-600 text-sm">Port-au-Prince, Haïti</p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-6">
            <h3 className="font-bold text-yellow-900 mb-3">Questions fréquentes</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>Comment participer à un tournoi ?</p>
              <p>Comment devenir formateur ?</p>
              <p>Comment sponsoriser un événement ?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}