'use client';

import React, { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const stats = [
  { value: 20, suffix: 'sec', label: 'Temps de génération devis' },
  { value: 2, suffix: 'h/jour', label: 'Temps économisé' },
  { value: 100, suffix: '%', label: 'Fonctionne partout (offline)' },
  { value: 29.9, suffix: '€', label: 'Prix par mois' },
];

const AnimatedCounter: React.FC<{
  value: number;
  suffix: string;
  label: string;
}> = ({ value, suffix, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
        {value === 29.9 ? (
          <>
            {count.toFixed(2).replace('.', ',')}
            <span className="text-2xl align-top ml-1">{suffix}</span>
          </>
        ) : (
          <>
            {count.toFixed(value % 1 !== 0 ? 1 : 0)}
            <span className="text-2xl align-top ml-1">{suffix}</span>
          </>
        )}
      </div>
      <div className="text-white/90 font-medium">{label}</div>
    </div>
  );
};

export const Stats: React.FC = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-blue-600 text-white">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedSection key={stat.label} delay={index * 0.1}>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

