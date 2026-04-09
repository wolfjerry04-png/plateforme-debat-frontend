'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function ClochNotifications() {
  const { notifications, nonLues, marquerToutesLues } = useNotifications();
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => { setOuvert(!ouvert); marquerToutesLues(); }}
        className="relative p-2 text-white hover:text-blue-200 transition"
      >
        🔔
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {/* Panneau notifications */}
      {ouvert && (
        <div className="absolute right-0 top-10 w-80    border border-gray-100 z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">
                Aucune notification
              </p>
            ) : (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${
                    !notif.lue ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{notif.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.contenu}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}