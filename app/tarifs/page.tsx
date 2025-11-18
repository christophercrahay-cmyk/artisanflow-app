import Link from 'next/link';
import { Check } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    '29,90€/mois tout inclus. Devis illimités, clients illimités, sans engagement. Essai gratuit 14 jours.',
};

const features = [
  'Devis illimités avec IA vocale',
  'Clients illimités',
  'Chantiers illimités',
  'Photos illimitées',
  'Partage client en temps réel',
  'Mode hors ligne complet',
  'Signature électronique',
  'Factures conformes',
  'Import données (CSV, Excel, contacts)',
  'Templates personnalisables',
  'Support prioritaire',
  'Mises à jour incluses',
  'Données hébergées en France',
  'Sans engagement',
];

const faqs = [
  {
    question: 'Est-ce que je peux annuler à tout moment ?',
    answer:
      'Oui, annulation en 1 clic depuis l\'app, aucune question, aucun frais.',
  },
  {
    question: 'Y a-t-il des frais cachés ?',
    answer: 'Non. 29,90€/mois, point final. Tout illimité, rien en plus.',
  },
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer:
      '14 jours complets, toutes les fonctionnalités, aucune carte bancaire demandée. À la fin, si vous aimez, vous vous abonnez. Sinon, rien ne se passe.',
  },
  {
    question: 'Puis-je avoir une facture ?',
    answer:
      'Oui, facture automatique chaque mois par email, conforme pour votre comptabilité.',
  },
  {
    question: 'Y a-t-il une réduction pour engagement annuel ?',
    answer:
      'Oui : 299€/an au lieu de 358,80€ = 2 mois offerts (16% d\'économie).',
  },
  {
    question: 'Que se passe-t-il si je dépasse des limites ?',
    answer:
      'Il n\'y a aucune limite. Devis, clients, chantiers, photos : tout illimité. Utilisez autant que vous voulez.',
  },
];

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Un tarif simple, tout inclus
              </h1>
              <p className="text-xl text-slate-600">
                Aucun frais caché. Aucune surprise. Tout illimité.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Pricing Card */}
      <section className="py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border-2 border-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="blue">Le plus populaire</Badge>
                </div>

                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    Plan Artisan
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-bold text-slate-900">
                      29,90€
                    </span>
                    <span className="text-xl text-slate-600">/mois</span>
                  </div>
                  <p className="text-slate-600">
                    (ou 299€/an - économisez 2 mois)
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="primary" size="lg" className="w-full" asChild>
                  <Link href="/tarifs">Essayer 14 jours gratuits</Link>
                </Button>
                <p className="text-center text-sm text-slate-600 mt-4">
                  Sans carte bancaire requise
                </p>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-slate-50">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                ArtisanFlow vs Autres apps
              </h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">
                        Fonctionnalité
                      </th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-900">
                        Autres apps
                      </th>
                      <th className="px-6 py-4 text-center font-semibold text-blue-600">
                        ArtisanFlow
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-6 py-4 text-slate-700">Devis IA</td>
                      <td className="px-6 py-4 text-center text-red-600">❌</td>
                      <td className="px-6 py-4 text-center text-green-600">
                        ✅
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-slate-700">Mode offline</td>
                      <td className="px-6 py-4 text-center text-red-600">❌</td>
                      <td className="px-6 py-4 text-center text-green-600">
                        ✅
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-slate-700">
                        Partage client
                      </td>
                      <td className="px-6 py-4 text-center text-red-600">❌</td>
                      <td className="px-6 py-4 text-center text-green-600">
                        ✅
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-slate-700">Prix</td>
                      <td className="px-6 py-4 text-center text-slate-700">
                        40-60€/mois
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-blue-600">
                        29,90€/mois
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-slate-700">Engagement</td>
                      <td className="px-6 py-4 text-center text-slate-700">
                        12 mois
                      </td>
                      <td className="px-6 py-4 text-center text-green-600">
                        Aucun
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Questions fréquentes
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Guarantee */}
      <section className="py-16 md:py-24 bg-blue-600 text-white">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="green" className="mb-6">
                Garantie satisfait ou remboursé
              </Badge>
              <p className="text-xl mb-8">
                Si ArtisanFlow ne répond pas à vos attentes dans les 30
                premiers jours, nous vous remboursons intégralement, sans
                justification.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/tarifs">Commencer l&apos;essai gratuit</Link>
              </Button>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </div>
  );
}

