'use client';

import React, { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function EssaiGratuitPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Pour l'instant, aucune logique backend - juste un preventDefault
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setEmail('');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 lg:py-32">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Essai gratuit bientôt disponible
              </h1>
              <div className="text-lg md:text-xl text-slate-600 space-y-6 text-left max-w-3xl mx-auto">
                <p className="leading-relaxed">
                  L&apos;application ArtisanFlow sera disponible très bientôt.
                  L&apos;essai gratuit sera activé dès que le système
                  d&apos;abonnement sera en place.
                </p>
                <p className="leading-relaxed">
                  Pour toute question ou demande liée à vos données personnelles,
                  vous pouvez nous contacter à l&apos;adresse suivante :
                </p>
                <p className="leading-relaxed text-center">
                  <a
                    href="mailto:acontrecourant25@gmail.com"
                    className="text-blue-600 hover:text-blue-700 underline font-medium text-lg"
                  >
                    acontrecourant25@gmail.com
                  </a>
                </p>
                <p className="leading-relaxed">
                  Une réponse vous sera apportée dans un délai maximal de 30 jours.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </div>
  );
}

