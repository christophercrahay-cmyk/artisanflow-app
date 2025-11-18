import Link from 'next/link';
import { Mic, Building2, Share2, WifiOff, Users, DollarSign } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fonctionnalités',
  description:
    'Découvrez toutes les fonctionnalités d\'ArtisanFlow : devis IA, gestion chantiers, partage client, mode offline, et bien plus.',
};

const features = [
  {
    icon: Mic,
    title: 'Génération Devis IA',
    description:
      'Transcription vocale en temps réel, reconnaissance automatique des prestations, calcul automatique des montants, génération PDF professionnelle.',
    list: [
      'Transcription vocale en temps réel',
      'Reconnaissance automatique des prestations',
      'Calcul automatique des montants',
      'Génération PDF professionnelle',
      'Mentions légales conformes (SIRET, assurances, CGV)',
      'Signature électronique sur place',
      'Envoi par email/SMS automatique',
      'Templates personnalisables par métier',
    ],
  },
  {
    icon: Building2,
    title: 'Gestion Chantiers',
    description:
      'Créez et gérez vos chantiers en quelques clics. Suivez la progression, ajoutez photos et notes.',
    list: [
      'Création rapide de chantier (1 minute)',
      'Liaison automatique client ↔ chantier',
      'Photos horodatées géolocalisées',
      'Notes vocales converties en texte',
      'Journal de bord automatique',
      'Suivi progression (à faire, en cours, terminé)',
      'Historique complet',
    ],
  },
  {
    icon: Share2,
    title: 'Partage Client',
    description:
      'Partagez un lien unique avec vos clients pour qu\'ils suivent l\'avancement de leur chantier en temps réel.',
    list: [
      'Génération lien unique sécurisé',
      'Le client voit : nom, adresse, photos, devis, factures',
      'Pas d\'app à installer côté client',
      'Mis à jour en temps réel',
      'Révocable à tout moment',
      'Statistiques de consultation',
    ],
  },
  {
    icon: WifiOff,
    title: 'Mode Hors Ligne',
    description:
      'Travaillez même sans connexion internet. Synchronisation automatique dès le retour du réseau.',
    list: [
      'Consultation clients/chantiers en cache',
      'Prise de photos offline (sync auto)',
      'Création notes offline (sync auto)',
      'Indicateurs visuels clairs',
      'Synchronisation automatique',
      'Zéro perte de données',
    ],
  },
  {
    icon: Users,
    title: 'Gestion Clients',
    description:
      'Importez et gérez tous vos clients en un seul endroit. Recherche rapide, historique complet.',
    list: [
      'Import multi-format (CSV, Excel, contacts, scan carte visite)',
      'Fiche client complète',
      'Recherche rapide',
      'Tri par critères multiples',
      'Historique interactions',
    ],
  },
  {
    icon: DollarSign,
    title: 'Facturation',
    description:
      'Générez des factures conformes en quelques secondes. Numérotation automatique, export comptable.',
    list: [
      'Génération factures conformes',
      'Numérotation automatique',
      'Mentions légales incluses',
      'Export comptable',
      'Suivi paiements',
    ],
  },
];

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Toutes les fonctionnalités ArtisanFlow
              </h1>
              <p className="text-xl text-slate-600">
                L&apos;application mobile la plus complète pour artisans du
                bâtiment
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="space-y-16">
            {features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.1}>
                <Card icon={feature.icon} className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.list.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start gap-3 text-slate-700"
                      >
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-600 text-white">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Essayez toutes ces fonctionnalités gratuitement pendant 14 jours
              </h2>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/tarifs">Commencer l&apos;essai</Link>
              </Button>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </div>
  );
}

