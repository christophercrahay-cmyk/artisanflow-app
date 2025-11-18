'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative z-10">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Prêt à gagner 2h par jour ?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Rejoignez les artisans qui transforment leur quotidien avec
              ArtisanFlow.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="mb-6"
              asChild
            >
              <Link href="/essai-gratuit">Me prévenir dès l&apos;ouverture</Link>
            </Button>
            <p className="text-blue-100 text-base md:text-lg mb-8 leading-relaxed">
              Les abonnements seront disponibles très bientôt
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <span>🇫🇷</span>
                <span>Hébergé en France</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Conforme RGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Support 7j/7</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
};

