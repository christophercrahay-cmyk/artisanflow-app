import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="text-blue-400 mx-auto mb-4" />
        <p className="text-slate-400">Chargement de votre chantier...</p>
      </div>
    </div>
  );
}

