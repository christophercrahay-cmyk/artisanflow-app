'use client';

import React from 'react';
import { Download, Mic, TrendingUp } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const steps = [
  {
    number: '01',
    icon: Download,
    title: 'Installez ArtisanFlow',
    description:
      'Disponible sur iOS et Android. Installation en 2 minutes. Importez vos clients en un clic (CSV, photos, contacts).',
  },
  {
    number: '02',
    icon: Mic,
    title: 'Générez votre premier devis',
    description:
      'Appuyez, parlez de votre chantier. L\'IA comprend et génère un devis PDF professionnel. Signez sur place avec le client.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Gagnez 2h par jour',
    description:
      'Moins de paperasse, plus de chantiers. Clients satisfaits, recommandations en hausse, chiffre d\'affaires en croissance.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-slate-50">
      <Container>
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-16">
            3 étapes pour transformer votre quotidien
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-blue-200 -z-10" />

          {steps.map((step, index) => (
            <AnimatedSection key={step.number} delay={index * 0.1}>
              <Card className="relative">
                {/* Step Number */}
                <div className="absolute -top-4 left-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>

                <div className="mt-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 text-blue-600 mb-6">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

