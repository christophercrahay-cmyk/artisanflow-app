'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const testimonials = [
  {
    rating: 5,
    quote:
      'J\'ai gagné 10h par semaine sur la paperasse. Je prends 2 chantiers de plus par mois grâce au temps économisé.',
    author: 'Marc D.',
    role: 'Électricien, Pontarlier',
    avatar: 'MD',
  },
  {
    rating: 5,
    quote:
      'Mes clients adorent le suivi en temps réel. Je reçois 3x plus de recommandations qu\'avant. Game changer.',
    author: 'Sophie L.',
    role: 'Plombière, Besançon',
    avatar: 'SL',
  },
  {
    rating: 5,
    quote:
      'Le mode hors ligne sauve ma vie. Je bosse souvent en cave ou montagne, plus jamais bloqué.',
    author: 'Thomas R.',
    role: 'Maçon, Métabief',
    avatar: 'TR',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-slate-50">
      <Container>
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-16">
            Ce que disent les artisans
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.author} delay={index * 0.1}>
              <Card>
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 mb-6 leading-relaxed italic">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-slate-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

