'use client';

import React from 'react';
import { Clock, Sparkles, FileText, Scale, Unlock, LifeBuoy } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const benefits = [
  {
    icon: Clock,
    title: 'Gagnez du temps',
    description: '2h économisées par jour minimum',
  },
  {
    icon: Sparkles,
    title: 'Image professionnelle',
    description: 'Devis impeccables, suivi client moderne',
  },
  {
    icon: FileText,
    title: 'Zéro papier',
    description: 'Tout numérique, tout sauvegardé, sécurisé',
  },
  {
    icon: Scale,
    title: 'Conformité garantie',
    description: 'Mentions légales, SIRET, assurances incluses',
  },
  {
    icon: Unlock,
    title: 'Sans engagement',
    description: 'Annulez quand vous voulez, 14 jours gratuits',
  },
  {
    icon: LifeBuoy,
    title: 'Support réactif',
    description: 'Un artisan qui aide des artisans',
  },
];

export const Benefits: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <Container>
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-16">
            Pourquoi les artisans choisissent ArtisanFlow
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.title} delay={index * 0.05}>
              <Card icon={benefit.icon}>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600">{benefit.description}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

