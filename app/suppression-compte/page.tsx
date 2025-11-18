import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suppression de compte',
  description:
    'Demande de suppression des données personnelles - ArtisanFlow',
};

export default function SuppressionComptePage() {
  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <Container>
        <AnimatedSection>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">
              Suppression des données – ArtisanFlow
            </h1>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                L&apos;application <strong>ArtisanFlow</strong> ne nécessite pas
                de compte utilisateur. Toutefois, si vous souhaitez supprimer
                toutes les données liées à votre utilisation (clients, chantiers,
                photos, notes vocales, devis, factures), vous pouvez en faire la
                demande à l&apos;adresse suivante :
              </p>

              <div className="text-2xl mb-6">
                <a
                  href="mailto:christophercrahay@gmail.com"
                  className="text-blue-600 hover:text-blue-700 underline font-semibold"
                >
                  📧 christophercrahay@gmail.com
                </a>
              </div>

              <p className="text-slate-700 leading-relaxed">
                Votre demande sera traitée dans un délai maximal de 30 jours.
                Toutes les données associées à votre utilisation seront
                définitivement supprimées des serveurs sécurisés (hébergés en
                Europe via Supabase).
              </p>
            </div>

            <nav className="mt-8">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                ← Retour à l&apos;accueil
              </Link>
            </nav>
          </div>
        </AnimatedSection>
      </Container>
    </div>
  );
}

