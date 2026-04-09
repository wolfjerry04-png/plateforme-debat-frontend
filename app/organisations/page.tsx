'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function PageOrganisations() {
  const [organisations, setOrganisations] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const { data } = await api.get('/tenants');
        setOrganisations(data);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  return (
    <div className="dh-simple-page">
      <h1 className="text-2xl font-bold text-blue-900 mb-2">
        Organisations partenaires
      </h1>
      <p className="text-gray-500 mb-8">
        Communautes de debat utilisant notre plateforme
      </p>

      {chargement ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {organisations.map((org: any) => (
            <div
              key={org.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              {org.logoUrl && (
                <img
                  src={org.logoUrl}
                  alt={org.nom}
                  className="w-12 h-12 object-contain mb-3"
                />
              )}
              <div
                className="w-3 h-3 rounded-full mb-3"
                style={{ backgroundColor: org.couleur }}
              />
              <h2 className="font-semibold text-gray-900">{org.nom}</h2>
              {org.description && (
                <p className="text-gray-500 text-sm mt-1">{org.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                  {org.pays}
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  {org.langue}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
