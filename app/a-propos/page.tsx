import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Découvrez l\'histoire d\'ArtisanFlow, créé par un artisan pour les artisans.',
};

const values = [
  {
    title: 'Simplicité',
    description:
      'Pas besoin d\'un manuel de 50 pages. Vous installez, vous parlez, ça marche.',
  },
  {
    title: 'Fiabilité',
    description:
      'Que vous soyez en cave ou en montagne, ArtisanFlow fonctionne. Toujours.',
  },
  {
    title: 'Honnêteté',
    description:
      'Pas de frais cachés, pas d\'engagement piège, pas de fausses promesses. Just honest work.',
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Créé par un artisan. Pour les artisans.
              </h1>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Founder Story */}
      <section className="py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Image Placeholder */}
                <div className="md:col-span-1">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👷</div>
                      <p className="text-slate-600 font-medium">Photo</p>
                    </div>
                  </div>
                </div>

                {/* Story */}
                <div className="md:col-span-2">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Je m&apos;appelle Chris.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Électricien depuis 15 ans dans la région de Pontarlier.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Pendant des années, j&apos;ai perdu des heures chaque soir
                      à faire des devis à 23h. J&apos;ai testé tous les
                      logiciels du marché : trop lents, trop complexes, trop
                      chers, ou les trois à la fois.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Un jour, j&apos;ai réalisé que j&apos;avais deux choix :
                    </p>
                    <ul className="list-disc list-inside text-lg text-slate-700 mb-4 space-y-2">
                      <li>
                        Continuer à perdre 2h par jour sur de la paperasse
                      </li>
                      <li>
                        Créer l&apos;outil que j&apos;aurais aimé avoir il y a
                        10 ans
                      </li>
                    </ul>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      J&apos;ai choisi la deuxième option.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      ArtisanFlow est né de cette frustration quotidienne.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Pas de bullshit marketing. Pas de fonctionnalités
                      inutiles. Juste ce qui marche, tous les jours, sur le
                      terrain.
                    </p>
                    <p className="text-lg font-semibold text-slate-900 mb-4">
                      Simple. Rapide. Fiable.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Développé par un artisan, pour les artisans.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Si vous en avez marre de perdre votre temps sur des tâches
                      administratives au lieu d&apos;être sur chantier,
                      ArtisanFlow est fait pour vous.
                    </p>
                    <p className="text-lg text-slate-700 leading-relaxed">
                      — Chris
                      <br />
                      <span className="text-slate-600">
                        Fondateur d&apos;ArtisanFlow
                        <br />
                        Électricien depuis 2009, Développeur depuis 2024
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-slate-50">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Notre mission
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                Redonner aux artisans du temps pour ce qui compte vraiment :
                leur métier, leurs clients, leur famille. La paperasse doit
                prendre 5 minutes, pas 2 heures.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <Container>
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
              Nos valeurs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <AnimatedSection key={value.title} delay={index * 0.1}>
                  <Card>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-blue-600 text-white">
        <Container>
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Envie de rejoindre l&apos;aventure ?
              </h2>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/tarifs">Essayer gratuitement</Link>
              </Button>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </div>
  );
}

