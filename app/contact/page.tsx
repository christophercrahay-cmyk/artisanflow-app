'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  metier: z.string().min(1, 'Veuillez sélectionner un métier'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const metiers = [
  'Électricien',
  'Plombier',
  'Maçon',
  'Peintre',
  'Menuisier',
  'Carreleur',
  'Couvreur',
  'Autre',
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Replace with your form submission endpoint
      // For now, using a placeholder
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 lg:py-32">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Une question ? Contactez-nous
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
                Nous répondons en moins de 24h, souvent en quelques heures
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container>
          <AnimatedSection>
            <div className="max-w-2xl mx-auto px-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Prénom et nom"
                  {...register('name')}
                  error={errors.name?.message}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />

                <Input
                  label="Téléphone (optionnel)"
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Métier <span className="text-red-600">*</span>
                  </label>
                  <select
                    {...register('metier')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionnez un métier</option>
                    {metiers.map((metier) => (
                      <option key={metier} value={metier}>
                        {metier}
                      </option>
                    ))}
                  </select>
                  {errors.metier && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.metier.message}
                    </p>
                  )}
                </div>

                <Textarea
                  label="Message"
                  rows={6}
                  {...register('message')}
                  error={errors.message?.message}
                  required
                />

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    Message envoyé ! Nous vous répondons sous 24h.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    Une erreur est survenue. Réessayez ou écrivez-nous
                    directement à acontrecourant25@gmail.com
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                >
                  Envoyer le message
                </Button>
              </form>

              {/* Alternative Contact */}
              <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-600 mb-2">
                  Vous préférez un email direct ?
                </p>
                <a
                  href="mailto:acontrecourant25@gmail.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  acontrecourant25@gmail.com
                </a>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </div>
  );
}

