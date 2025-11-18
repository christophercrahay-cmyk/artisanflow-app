'use client';

import React from 'react';
import { Clock, Phone, WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const problems = [
  {
    icon: Clock,
    title: '45 minutes par devis',
    description:
      'Rédaction, calculs, mise en page... Le devis devient une corvée qui vous empêche d\'être sur chantier.',
  },
  {
    icon: Phone,
    title: '10 appels clients par jour',
    description:
      '"Où en êtes-vous ?" - Vos clients stressent et vous interrompent constamment pendant que vous travaillez.',
  },
  {
    icon: WifiOff,
    title: 'Cave, montagne, tunnel...',
    description:
      'Pas de réseau = impossible de travailler. Votre app plante, vous perdez des données.',
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-slate-50">
      <Container>
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12">
            Vous perdez combien de temps par jour ?
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <AnimatedSection key={problem.title} delay={index * 0.1}>
              <Card icon={problem.icon}>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {problem.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {problem.description}
                </p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

