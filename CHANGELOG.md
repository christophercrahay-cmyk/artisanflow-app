# Changelog

All notable changes to ArtisanFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- 🔜 RLS activé sur toutes les tables (sécurité production)
- 🔜 CI/CD avec GitHub Actions
- 🔜 Tests automatisés (coverage > 70%)
- 🔜 Monitoring production (Sentry + Analytics)
- 🔜 Pagination sur toutes les listes
- 🔜 Compression images avant upload
- 🔜 Génération PDF pour factures
- 🔜 Mode vocal en temps réel (Push-to-Talk)

---

## [1.0.1] - 2025-11-07

### Added ✨
- **Écran Documents unifié** : Gestion centralisée des devis et factures
- **Filtres Documents** : Tous / Devis / Factures
- **Gestion des statuts** : Brouillon → Envoyé → Signé (badge cliquable)
- **Bouton "Voir PDF"** : Génération et partage PDF depuis la liste
- **Bouton Paramètres** : Accès rapide aux paramètres depuis l'écran Documents
- **IA Conversationnelle** : Génération de devis avec questions/réponses
- **Questions IA génériques** : Adaptées à tous les métiers (pas seulement électricité)
- **Génération PDF depuis BDD** : Fonction `generateDevisPDFFromDB()` avec vraies lignes
- **Table devis_lignes** : Stockage structuré des lignes de devis
- **Bouton "œil"** : Afficher/masquer mot de passe sur écran connexion
- **Composant VoiceRecorderSimple** : Réponses vocales aux questions IA
- **Mode texte ET vocal** : Pour répondre aux questions de l'IA

### Changed 🔄
- **Icône FACTURES** : Emoji 💰 → Icône Feather `file-text` (plus neutre)
- **Lisibilité champs** : Contraste amélioré (#E5E5E5 sur #222), taille 16px
- **Modal PDF** : Passage en plein écran (transparent=false) avec bouton fermer
- **Prompt GPT** : Refondu pour être générique (tous métiers)
- **Edge Function** : Maximum 5 questions par tour (au lieu de 3)
- **Padding DocumentsScreen** : Suppression du double padding

### Fixed 🐛
- **Emoji FACTURES** : Affichait "?" sur certains devices
- **Modal PDF transparente** : Corrigée avec SafeAreaView
- **Erreur JSX** : Balises `<Pressable>` mal fermées
- **Double padding** : Dans aiGeneratorSection
- **Bouton "Générer devis IA"** : Largeur 100% pour meilleur affichage mobile

### Security 🔒
- **Variables d'environnement** : Création de `env.example` (template)
- **RLS** : Script SQL fourni pour activer en production (`sql/enable_rls_production.sql`)
- **Clés API** : Documentation pour migration vers .env

### Documentation 📚
- **AUDIT_TECHNIQUE_COMPLET_2025.md** : Audit technique détaillé (500+ lignes)
- **AUDIT_EXECUTIF_RESUME.md** : Résumé exécutif pour investisseurs
- **PLAN_ACTION_IMMEDIAT.md** : Plan Quick Wins avec code prêt à l'emploi
- **AMELIORATIONS_DEVIS_IA.md** : Documentation module Devis IA
- **ECRAN_DOCUMENTS_IMPLEMENTATION.md** : Documentation écran Documents
- **PARAMETRES_ET_ICONES_CORRECTION.md** : Documentation paramètres
- **GUIDE_TEST_DEVIS_IA.md** : Checklist de test (8 tests)

---

## [1.0.0] - 2025-11-03

### Added ✨
- 🎉 **Release initiale** sur Play Store (accès anticipé)
- **Gestion clients** : Création, consultation, modification, suppression
- **Gestion projets** : Création, consultation, statuts (actif/pause/terminé)
- **Notes vocales** : Enregistrement, upload, transcription Whisper
- **Photos** : Capture caméra, galerie, suppression (clients + projets)
- **Devis** : Création, modification, statuts (brouillon/envoyé/accepté/refusé)
- **Factures** : Création, modification, statuts (brouillon/envoyé/payé/impayée)
- **Génération PDF** : Template basique pour devis
- **Thème sombre** : Design moderne et professionnel
- **Navigation** : Bottom tabs + Stack navigation
- **Authentification** : Supabase Auth (email/password)
- **Storage** : Supabase Storage pour photos et audio

### Technical 🛠️
- **Stack** : Expo SDK 54, React Native 0.81.5, React 19.1.0
- **Backend** : Supabase (PostgreSQL + Storage + Auth)
- **IA** : OpenAI (Whisper + GPT-4o-mini)
- **State** : Zustand
- **Validation** : Zod
- **Navigation** : React Navigation v7
- **Tests** : Jest + React Testing Library

---

## [0.1.0] - 2025-10-15

### Added ✨
- 🎉 **Projet initialisé**
- Structure de base React Native Expo
- Configuration Supabase
- Écrans de base (Dashboard, Clients, Projets)

---

## Légende

- ✨ **Added** : Nouvelles fonctionnalités
- 🔄 **Changed** : Modifications de fonctionnalités existantes
- 🐛 **Fixed** : Corrections de bugs
- 🔒 **Security** : Améliorations de sécurité
- 📚 **Documentation** : Ajouts/modifications de documentation
- 🛠️ **Technical** : Changements techniques (dépendances, config, etc.)
- ⚠️ **Deprecated** : Fonctionnalités obsolètes (à supprimer prochainement)
- ❌ **Removed** : Fonctionnalités supprimées
- 🔥 **Breaking** : Changements incompatibles avec versions précédentes

---

**Dernière mise à jour** : 7 novembre 2025

