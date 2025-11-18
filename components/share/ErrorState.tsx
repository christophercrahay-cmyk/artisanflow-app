import React from 'react';
import Link from 'next/link';
import { XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  type: 'not-found' | 'revoked';
}

export const ErrorState: React.FC<ErrorStateProps> = ({ type }) => {
  if (type === 'not-found') {
    return (
      <div className="text-center py-16">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-3">
          Lien introuvable
        </h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Ce lien n&apos;existe pas ou a expiré.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <Ban className="h-16 w-16 text-orange-400 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-slate-100 mb-3">
        Accès révoqué
      </h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        L&apos;accès à ce chantier a été révoqué par l&apos;artisan.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
};

