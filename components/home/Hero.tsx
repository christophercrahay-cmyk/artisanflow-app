'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { GradientBlur } from '@/components/ui/GradientBlur';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 lg:py-32">
      <GradientBlur position="top" />
      <GradientBlur position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <AnimatedSection>
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-700">
                🇫🇷 Fabriqué en France
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-700">
                ✅ Sans engagement
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-700">
                📱 iOS & Android
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Générez vos devis en{' '}
              <span className="text-blue-600">20 secondes</span> avec l&apos;IA
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              L&apos;application mobile qui fait gagner 2h par jour aux artisans
              du bâtiment. Devis instantanés, suivi chantier en temps réel,
              mode hors ligne complet.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button variant="primary" size="lg" asChild>
                <Link href="/essai-gratuit">Essai gratuit 14 jours</Link>
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Données hébergées en France</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Conforme RGPD</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Visual Placeholder */}
          <AnimatedSection delay={0.2}>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/aperçu devis généré.jpg"
                  alt="Aperçu de l'application mobile ArtisanFlow avec plusieurs écrans"
                  width={1200}
                  height={900}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

