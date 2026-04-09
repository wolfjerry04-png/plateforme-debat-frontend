'use client';

import Link from 'next/link';

interface Props {
  debat: {
    id: string;
    titre: string;
    description: string;
    statut: string;
    createur: { prenom: string; nom: string };
    _count: { messages: number };
  };
}

export default function CarteDebat({ debat }: Props) {
  return (
    <div className="bg-white   border border-gray-100 p-5 hover: transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            debat.statut === 'OUVERT'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {debat.statut}
          </span>
          <h2 className="text-lg font-semibold text-gray-900 mt-2">
            {debat.titre}
          </h2>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {debat.description}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Par {debat.createur.prenom} {debat.createur.nom} ·{' '}
            {debat._count.messages} message{debat._count.messages !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={`/debats/${debat.id}`}
          className="ml-4 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition whitespace-nowrap"
        >
          Participer →
        </Link>
      </div>
    </div>
  );
}