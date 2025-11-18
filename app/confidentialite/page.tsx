import { Container } from '@/components/layout/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description:
    'Politique de confidentialité et protection des données personnelles ArtisanFlow.',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <Container>
        <AnimatedSection>
          <div className="max-w-4xl mx-auto prose prose-slate">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-slate-600 mb-8">
              Dernière mise à jour : 13 novembre 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-slate-700 leading-relaxed">
                La protection de vos données personnelles est une priorité pour{' '}
                <strong>ArtisanFlow</strong> (ci-après « l&apos;Application »),
                éditée par <strong>À Contre Courant (SASU)</strong>. Cette
                politique explique quelles données nous collectons, comment elles
                sont utilisées et vos droits conformément au RGPD.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                2. Responsable du traitement
              </h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>
                  <strong>Responsable :</strong> À Contre Courant (SASU)
                </li>
                <li>
                  <strong>Adresse :</strong> 7 Rue Royale, 25300 Chaffois, France
                </li>
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
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                3. Données collectées
              </h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.1 Données de compte
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Adresse email (obligatoire)</li>
                <li>Nom et prénom (optionnel)</li>
                <li>Numéro de téléphone (optionnel)</li>
              </ul>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.2 Données professionnelles
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Nom de l&apos;entreprise, SIRET, adresse professionnelle</li>
                <li>Numéro de TVA intracommunautaire</li>
                <li>Informations d&apos;assurance (RCP, décennale)</li>
              </ul>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.3 Données clients et chantiers
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>
                  Informations clients (nom, adresse, téléphone, email)
                </li>
                <li>Données chantiers (nom, adresse, statut)</li>
                <li>Photos, notes vocales et transcriptions</li>
              </ul>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.4 Données techniques
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Adresse IP, type d&apos;appareil, version de l&apos;app</li>
                <li>Logs d&apos;erreurs anonymisés</li>
              </ul>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3.5 Données d&apos;utilisation OpenAI
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>
                  Enregistrements vocaux (temporairement, pour transcription)
                </li>
                <li>Transcriptions textuelles et nombre de tokens utilisés</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                4. Base légale
              </h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>
                  <strong>Exécution du contrat :</strong> Fourniture du service
                </li>
                <li>
                  <strong>Consentement :</strong> Transcription et analyse IA
                </li>
                <li>
                  <strong>Obligation légale :</strong> Conservation fiscale des
                  factures
                </li>
                <li>
                  <strong>Intérêt légitime :</strong> Amélioration du service et
                  support
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                5. Finalités du traitement
              </h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                5.1 Fourniture du service
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Créer et gérer votre compte, stocker vos clients/chantiers,
                générer vos devis et factures, synchroniser vos données.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                5.2 Transcription & analyse IA
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Transcrire vos notes vocales (OpenAI Whisper) et générer des
                devis automatiquement (OpenAI GPT-4o-mini). Les données envoyées
                à OpenAI sont anonymisées et conservées au maximum 30 jours.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                5.3 Amélioration du service
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Statistiques d&apos;usage, détection de bugs, développement de
                nouvelles fonctionnalités.
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                5.4 Communication
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Emails transactionnels, support client, notifications
                d&apos;information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                6. Destinataires
              </h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>
                  <strong>Supabase (Irlande, UE)</strong> : Hébergement base de
                  données et stockage fichiers
                </li>
                <li>
                  <strong>OpenAI (États-Unis)</strong> : Transcription et
                  génération IA (Clauses Contractuelles Types)
                </li>
                <li>
                  <strong>Apple / Google / RevenueCat</strong> : Gestion des
                  abonnements
                </li>
                <li>
                  <strong>Aucun autre partage</strong> : Pas de revente de
                  données marketing
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                7. Durée de conservation
              </h2>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-slate-300 rounded-lg">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">
                        Type de données
                      </th>
                      <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">
                        Durée
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        Compte utilisateur
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        Durée de l&apos;abonnement
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        Clients / chantiers / photos
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        Durée de l&apos;abonnement
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        Notes vocales
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        Durée de l&apos;abonnement
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        Devis / factures
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        10 ans (obligation légale)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        Logs techniques
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        90 jours
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        Données OpenAI
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        30 jours max
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Après résiliation : conservation 30 jours (réactivation possible)
                puis suppression définitive.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                8. Sécurité
              </h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Chiffrement HTTPS/TLS</li>
                <li>Authentification Supabase (tokens JWT)</li>
                <li>Isolation multi-tenant (RLS)</li>
                <li>Backups quotidiens chiffrés</li>
                <li>Journalisation des accès</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                9. Vos droits (RGPD)
              </h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Droit d&apos;accès</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement</li>
                <li>Droit d&apos;opposition</li>
                <li>Droit à la portabilité</li>
                <li>Droit de limitation</li>
                <li>Droit de réclamation (CNIL)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                Pour exercer ces droits :{' '}
                <a
                  href="mailto:privacy@artisanflow.app"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  privacy@artisanflow.app
                </a>{' '}
                ou courrier au 7 Rue Royale, 25300 Chaffois, France. Réponse sous
                30 jours maximum.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                10. Cookies et traceurs
              </h2>
              <p className="text-slate-700 leading-relaxed">
                L&apos;application n&apos;utilise aucun cookie publicitaire. Seuls
                des traceurs techniques essentiels sont utilisés
                (authentification, préférences, analytics anonymisés).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                11. Transferts internationaux
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Les données peuvent être transférées hors UE uniquement vers OpenAI
                (États-Unis) dans le cadre des Clauses Contractuelles Types. Pas
                d&apos;autres transferts hors UE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                12. Mineurs
              </h2>
              <p className="text-slate-700 leading-relaxed">
                L&apos;application est destinée aux professionnels majeurs (18 ans et
                plus). Nous ne collectons pas sciemment de données sur des mineurs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                13. Modifications
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Nous pouvons modifier cette politique. Les utilisateurs sont
                informés par email, notification in-app ou bannière. Les changements
                prennent effet 30 jours après notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                14. Contact
              </h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>
                  Email :{' '}
                  <a
                    href="mailto:acontrecourant25@gmail.com"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    acontrecourant25@gmail.com
                  </a>
                </li>
                <li>Adresse : 7 Rue Royale, 25300 Chaffois, France</li>
              </ul>
              <p className="text-slate-600 text-sm">
                Date de dernière mise à jour : 13 novembre 2025 — Version 1.0.0
              </p>
            </section>

            <nav className="mt-12 pt-8 border-t border-slate-200">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                ← Retour à l&apos;accueil
              </Link>
            </nav>
          </div>
        </AnimatedSection>
      </Container>
    </div>
  );
}
