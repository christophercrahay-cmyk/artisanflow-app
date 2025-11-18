'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { cn } from '@/lib/utils/cn';

const faqs = [
  {
    question: 'Combien ça coûte ?',
    answer:
      '29,90€/mois avec 14 jours d\'essai gratuit, sans carte bancaire. Vous pouvez aussi payer à l\'année (299€) pour économiser 2 mois.',
  },
  {
    question: 'Ça marche sur Android et iOS ?',
    answer:
      'Oui, ArtisanFlow est disponible sur les deux plateformes. Vous pouvez même l\'utiliser sur plusieurs appareils avec le même compte.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument. Vos données sont hébergées en France sur des serveurs conformes RGPD. Nous ne vendons jamais vos données.',
  },
  {
    question: 'Je peux annuler quand je veux ?',
    answer:
      'Oui, annulation en 1 clic depuis l\'application, aucune question posée, aucun frais.',
  },
  {
    question: 'Y a-t-il une limite au nombre de devis ?',
    answer:
      'Non. Devis illimités, clients illimités, photos illimitées, chantiers illimités. Tout inclus dans le prix.',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <Container>
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-16">
            Questions fréquentes
          </h2>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <AnimatedSection key={faq.question} delay={index * 0.05}>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-slate-500 transition-transform',
                      openIndex === index && 'transform rotate-180'
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

