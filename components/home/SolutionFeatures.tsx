'use client';

import React from 'react';
import { Mic, Share2, WifiOff } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Badge } from '@/components/ui/Badge';

const features = [
  {
    icon: Mic,
    title: 'Devis en 20 secondes',
    subtitle: 'Dictez, l\'IA fait le reste',
    description:
      'Parlez naturellement de votre chantier. L\'IA génère un devis professionnel conforme avec vos tarifs, vos mentions légales, votre SIRET. Prêt à envoyer.',
    stat: 'De 45 min à 20 sec = Gagnez 2h/jour',
    imagePosition: 'right' as const,
  },
  {
    icon: Share2,
    title: 'Suivi client en temps réel',
    subtitle: 'Vos clients suivent leur chantier',
    description:
      'Un simple lien. Ils voient les photos, les devis, les factures en temps réel. Plus d\'appels, plus de stress. Client rassuré = recommandations.',
    stat: '90% des clients partagent le lien',
    imagePosition: 'left' as const,
  },
  {
    icon: WifiOff,
    title: 'Fonctionne PARTOUT',
    subtitle: 'Cave, montagne, tunnel',
    description:
      'Mode hors ligne complet. Prenez des photos, ajoutez des notes, consultez vos chantiers. Synchronisation automatique dès que le réseau revient.',
    stat: '100% du temps, pas 80%',
    imagePosition: 'right' as const,
  },
];

export const SolutionFeatures: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <Container>
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-16">
            ArtisanFlow résout ces 3 problèmes
          </h2>
        </AnimatedSection>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={index * 0.1}>
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  feature.imagePosition === 'left' ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Content */}
                <div
                  className={
                    feature.imagePosition === 'left' ? 'lg:col-start-2' : ''
                  }
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 text-blue-600 mb-6">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-blue-600 font-semibold mb-4">
                    {feature.subtitle}
                  </p>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Badge variant="green">{feature.stat}</Badge>
                </div>

                {/* Image Placeholder */}
                <div
                  className={
                    feature.imagePosition === 'left' ? 'lg:col-start-1' : ''
                  }
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">📸</div>
                      <p className="text-slate-600 font-medium">
                        Capture d&apos;écran
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

