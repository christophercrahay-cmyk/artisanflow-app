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
    'Tarifs ArtisanFlow. Les modalités d\'abonnement seront précisées lors de la mise en service du système d\'abonnement.',
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
      'Les modalités d\'abonnement (durée de l\'essai, tarif mensuel et conditions) seront précisées lors de la mise en service du système d\'abonnement. À ce jour, aucun abonnement n\'est encore actif.',
  },
  {
    question: 'Y a-t-il des frais cachés ?',
    answer:
      'Les modalités d\'abonnement (durée de l\'essai, tarif mensuel et conditions) seront précisées lors de la mise en service du système d\'abonnement. À ce jour, aucun abonnement n\'est encore actif.',
  },
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer:
      'Les modalités d\'abonnement (durée de l\'essai, tarif mensuel et conditions) seront précisées lors de la mise en service du système d\'abonnement. À ce jour, aucun abonnement n\'est encore actif.',
  },
  {
    question: 'Puis-je avoir une facture ?',
    answer:
      'Les modalités d\'abonnement (durée de l\'essai, tarif mensuel et conditions) seront précisées lors de la mise en service du système d\'abonnement. À ce jour, aucun abonnement n\'est encore actif.',
  },
  {
    question: 'Y a-t-il une réduction pour engagement annuel ?',
    answer:
      'Les modalités d\'abonnement (durée de l\'essai, tarif mensuel et conditions) seront précisées lors de la mise en service du système d\'abonnement. À ce jour, aucun abonnement n\'est encore actif.',
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
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 lg:py-32">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Un tarif simple, tout inclus
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
                Aucun frais caché. Aucune surprise. Tout illimité.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Pricing Card */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container>
          <AnimatedSection>
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-white border-2 border-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="blue">Le plus populaire</Badge>
                </div>

                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    Plan Artisan
                  </div>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Les modalités d&apos;abonnement (durée de l&apos;essai, tarif
                    mensuel et conditions) seront précisées lors de la mise en
                    service du système d&apos;abonnement. À ce jour, aucun
                    abonnement n&apos;est encore actif.
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
                  <Link href="/essai-gratuit">Essayer 14 jours gratuits</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 lg:py-32 bg-slate-50">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12 leading-tight">
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
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12 leading-tight">
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
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Guarantee */}
      <section className="py-16 md:py-24 lg:py-32 bg-blue-600 text-white">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center px-4">
              <p className="text-xl mb-8 leading-relaxed">
                Les modalités d&apos;abonnement (durée de l&apos;essai, tarif
                mensuel et conditions) seront précisées lors de la mise en
                service du système d&apos;abonnement. À ce jour, aucun
                abonnement n&apos;est encore actif.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/essai-gratuit">Me prévenir dès l&apos;ouverture</Link>
              </Button>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </div>
  );
}

