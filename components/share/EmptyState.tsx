import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-6">📭</div>
      <h2 className="text-2xl font-bold text-slate-100 mb-3">
        Bientôt disponible
      </h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Votre artisan n&apos;a pas encore ajouté de photos ou documents.
        Revenez plus tard !
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
};

