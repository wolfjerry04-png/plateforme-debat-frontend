'use client';

import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Link from 'next/link';

export default function PageDashboard() {
  const { utilisateur } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="dh-dashboard">

        <div className="bg-blue-900 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">
            Bonjour, {utilisateur?.prenom} {utilisateur?.nom} 👋
          </h1>
          <p className="text-blue-200 mt-1">
            Rôle : {utilisateur?.role}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Link href="/debats" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-900">💬 Débats</h2>
            <p className="text-gray-500 text-sm mt-1">Voir et participer aux débats</p>
          </Link>

          {['ADMIN', 'FORMATEUR'].includes(utilisateur?.role || '') && (
            <Link href="/admin" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h2 className="text-lg font-semibold text-blue-900">➕ Créer un débat</h2>
              <p className="text-gray-500 text-sm mt-1">Ouvrir un nouveau sujet de débat</p>
            </Link>
          )}

          <Link href="/classement" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-900">🏆 Classement</h2>
            <p className="text-gray-500 text-sm mt-1">Voir mon classement et mes points</p>
          </Link>

          <Link href="/formations" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-900">📚 Mes formations</h2>
            <p className="text-gray-500 text-sm mt-1">Accéder à mes cours en cours</p>
          </Link>

          <Link href="/tournois" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-900">⚔️ Tournois</h2>
            <p className="text-gray-500 text-sm mt-1">Voir les tournois disponibles</p>
          </Link>

          <Link href="/profil/modifier" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-900">🗳️ Mon profil</h2>
            <p className="text-gray-500 text-sm mt-1">Modifier mes informations personnelles</p>
          </Link>

          {utilisateur?.role === 'ADMIN' && (
            <Link href="/admin" className="bg-blue-900 text-white rounded-xl p-5 shadow-sm hover:bg-blue-800 transition">
              <h2 className="text-lg font-semibold">⚙️ Administration</h2>
              <p className="text-blue-200 text-sm mt-1">Gestion des utilisateurs et des contenus</p>
            </Link>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}