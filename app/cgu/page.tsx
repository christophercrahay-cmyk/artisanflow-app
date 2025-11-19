import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
  description: 'Conditions Générales d\'Utilisation de l\'application ArtisanFlow.',
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <AnimatedSection>
          <div className="max-w-4xl mx-auto px-4 prose prose-slate prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-slate-600 mb-8">
              Dernière mise à jour : 13 novembre 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                1. Objet
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Les présentes Conditions Générales d&apos;Utilisation (ci-après
                « CGU ») régissent l&apos;utilisation de l&apos;application
                mobile <strong>ArtisanFlow</strong> (ci-après «
                l&apos;Application »), éditée par{' '}
                <strong>À Contre Courant (SASU)</strong> (ci-après «
                l&apos;Éditeur »).
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                L&apos;Application permet aux artisans et professionnels du
                bâtiment de :
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Gérer leurs clients et leurs chantiers ;</li>
                <li>
                  Capturer des notes vocales avec transcription automatique ;
                </li>
                <li>Générer des devis et factures professionnels ;</li>
                <li>Stocker et organiser des photos de chantiers.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                En créant un compte et en utilisant l&apos;Application, vous
                acceptez sans réserve les présentes CGU.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                2. Accès au service
              </h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                2.1 Inscription
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                L&apos;utilisation de l&apos;Application nécessite la création
                d&apos;un compte utilisateur avec une adresse email valide.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                2.2 Abonnement
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Les modalités d&apos;abonnement (durée de l&apos;essai, tarif
                mensuel et conditions) seront précisées lors de la mise en
                service du système d&apos;abonnement. À ce jour, aucun
                abonnement n&apos;est encore actif.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                2.3 Résiliation
              </h3>
              <p className="text-slate-700 leading-relaxed">
                L&apos;abonnement est résiliable à tout moment depuis
                l&apos;Application ou depuis votre compte App Store / Play
                Store. La résiliation prend effet à la fin de la période
                d&apos;abonnement en cours. Aucun remboursement au prorata
                n&apos;est effectué.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                3. Fonctionnalités
              </h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.1 Transcription vocale
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                L&apos;Application utilise l&apos;intelligence artificielle
                (OpenAI Whisper) pour transcrire vos notes vocales. La précision
                dépend de la qualité audio.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.2 Génération de devis IA
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                L&apos;Application utilise OpenAI GPT-4o-mini pour générer
                automatiquement des devis.{' '}
                <strong>
                  Vous restez responsable du contenu des devis générés
                </strong>{' '}
                et devez les vérifier avant envoi.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.3 Export PDF
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Les devis et factures sont exportés au format PDF professionnel.
                L&apos;utilisateur est responsable de la conformité légale des
                documents (mentions obligatoires, TVA, etc.).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                4. Propriété intellectuelle
              </h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                4.1 Application
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                L&apos;Application, son code source, son design, ses bases de
                données et tous les éléments qui la composent sont la propriété
                exclusive de l&apos;Éditeur.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                4.2 Contenus utilisateur
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Vous conservez l&apos;entière propriété des contenus que vous
                créez (notes, devis, factures, photos, etc.). En utilisant
                l&apos;Application, vous accordez à l&apos;Éditeur une licence
                non exclusive pour stocker et traiter vos contenus, utiliser vos
                données vocales pour la transcription (via OpenAI) et améliorer
                les services de l&apos;Application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                5. Données personnelles
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Le traitement de vos données personnelles est régi par notre{' '}
                <strong>Politique de Confidentialité</strong>, disponible ici :{' '}
                <a
                  href="/confidentialite"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  https://artisanflow.fr/confidentialite
                </a>
                .
              </p>
              <p className="text-slate-700 leading-relaxed mb-2">En résumé :</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Hébergement en Europe (Supabase, Irlande) ;</li>
                <li>Conformité RGPD ;</li>
                <li>Aucune revente de données ;</li>
                <li>
                  Droit d&apos;accès, de rectification et de suppression à tout
                  moment.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                6. Obligations de l&apos;utilisateur
              </h2>
              <p className="text-slate-700 leading-relaxed mb-2">
                Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>
                  Fournir des informations exactes lors de l&apos;inscription ;
                </li>
                <li>Respecter les lois en vigueur ;</li>
                <li>
                  Ne pas tenter de contourner les mesures de sécurité ;
                </li>
                <li>
                  Respecter les droits de propriété intellectuelle ;
                </li>
                <li>
                  Vérifier les devis/factures générés avant envoi.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                7. Responsabilité
              </h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                7.1 Responsabilité de l&apos;Éditeur
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                L&apos;Éditeur s&apos;engage à fournir un service de qualité mais
                ne peut garantir la disponibilité continue, l&apos;exactitude à
                100% des transcriptions ou l&apos;absence de bugs.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                7.2 Responsabilité de l&apos;utilisateur
              </h3>
              <p className="text-slate-700 leading-relaxed">
                L&apos;utilisateur est seul responsable des contenus qu&apos;il
                crée, de la conformité de ses documents et de la sauvegarde de
                ses données.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                8. Suspension et résiliation
              </h2>
              <p className="text-slate-700 leading-relaxed">
                L&apos;utilisateur peut résilier son abonnement à tout moment.
                Les données sont conservées 30 jours après résiliation, puis
                supprimées définitivement. L&apos;Éditeur peut suspendre
                l&apos;accès en cas de non-paiement, fraude ou non-respect des
                CGU.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                9. Modification des CGU
              </h2>
              <p className="text-slate-700 leading-relaxed">
                L&apos;Éditeur se réserve le droit de modifier les CGU. Les
                utilisateurs sont informés par email ou notification in-app 30
                jours avant l&apos;entrée en vigueur des nouvelles dispositions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                10. Droit applicable et juridiction
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Les présentes CGU sont régies par le droit français. Tout litige
                sera soumis aux tribunaux compétents de Besançon.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                11. Contact
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Pour toute question relative aux présentes CGU :
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>
                  <strong>Email :</strong>{' '}
                  <a
                    href="mailto:acontrecourant25@gmail.com"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    acontrecourant25@gmail.com
                  </a>
                </li>
              </ul>
              <p className="text-slate-600 text-sm">
                Date de dernière mise à jour : 13 novembre 2025 — Version 1.0.0
              </p>
            </section>

            <nav className="mt-12 pt-8 border-t border-slate-200">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                ← Retour à l&apos;accueil
              </a>
            </nav>
          </div>
        </AnimatedSection>
      </Container>
    </div>
  );
}

