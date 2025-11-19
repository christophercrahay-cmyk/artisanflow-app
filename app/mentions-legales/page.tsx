import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site ArtisanFlow.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <AnimatedSection>
          <div className="max-w-4xl mx-auto px-4 prose prose-slate prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">
              Mentions légales
            </h1>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                1. Éditeur du site
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Le site artisanflow.fr est édité par :
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Raison sociale : SASU À Contre Courant</li>
                <li>SIRET : 98356287700024</li>
                <li>Email : acontrecourant25@gmail.com</li>
                <li>Directeur de publication : Christopher Crahay</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                2. Hébergement
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Le site est hébergé par :
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Hébergeur : Vercel Inc.</li>
                <li>
                  Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, USA
                </li>
                <li>Site web : vercel.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                3. Propriété intellectuelle et Copyright
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
                <p className="text-slate-900 font-semibold mb-2">
                  Copyright © 2025 À Contre Courant (SASU)
                </p>
                <p className="text-slate-700 mb-4">
                  <strong>Marque déposée :</strong> ArtisanFlow® – Marque déposée INPI n° 5157297
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Ce projet est protégé par le droit d&apos;auteur et la propriété intellectuelle française.
                  Toute reproduction, diffusion, modification ou utilisation commerciale, partielle ou totale,
                  du code, des fichiers, du design, du logo ou des visuels associés est strictement interdite
                  sans autorisation écrite du titulaire.
                </p>
                
                <div className="mt-4">
                  <p className="text-slate-900 font-semibold mb-2">Usage autorisé :</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 mb-4">
                    <li>Consultation et exécution locale à titre personnel.</li>
                    <li>Réutilisation partielle du code uniquement à des fins d&apos;apprentissage ou de test non commercial,
                      sous réserve de mentionner explicitement la source « ArtisanFlow® ».</li>
                  </ul>
                  
                  <p className="text-slate-900 font-semibold mb-2">Usage interdit :</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 mb-4">
                    <li>Revente, redistribution, publication, ou hébergement du code sous un autre nom.</li>
                    <li>Création d&apos;un produit concurrent ou dérivé sans autorisation écrite préalable.</li>
                  </ul>
                  
                  <p className="text-slate-700">
                    Pour toute demande de partenariat ou licence commerciale :{' '}
                    <a
                      href="mailto:acontrecourant25@gmail.com"
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      acontrecourant25@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                4. Données personnelles
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Pour plus d&apos;informations sur le traitement de vos données
                personnelles, consultez notre{' '}
                <a
                  href="/confidentialite"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  politique de confidentialité
                </a>
                .
              </p>
            </section>
          </div>
        </AnimatedSection>
      </Container>
    </div>
  );
}

