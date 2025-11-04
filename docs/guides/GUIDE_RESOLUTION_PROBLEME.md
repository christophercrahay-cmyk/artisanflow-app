# 🔧 GUIDE DE RÉSOLUTION - Détection de Prestations ArtisanFlow



## 📋 Résumé du problème



La fonctionnalité principale de l'app (génération automatique de devis depuis notes vocales) ne fonctionne pas car le système ne détecte pas correctement les prestations dans les transcriptions.



## ✅ Solution proposée (4 fichiers à modifier)



### 1️⃣ **services/quoteAnalysisService.js**

**Problème identifié :**

- Prompt système GPT pas assez précis

- Format de réponse JSON mal structuré

- Pas de validation du type retourné



**Corrections apportées :**

- ✅ Prompt système optimisé avec mots-clés explicites

- ✅ Format JSON strict avec `response_format: { type: "json_object" }`

- ✅ Température réduite à 0.3 pour plus de cohérence

- ✅ Validation et parsing robuste du JSON

- ✅ Logs détaillés pour debug



### 2️⃣ **components/VoiceRecorder.js** 

**Problème identifié :**

- Logique de détection de prestation trop simple

- Pas de sauvegarde de l'analyse dans la BD

- Manque de feedback visuel



**Corrections apportées :**

- ✅ Multiple vérifications pour détecter une prestation

- ✅ Sauvegarde de `analysis_data` en JSON dans la table `notes`

- ✅ Badges visuels par type de note

- ✅ Logs détaillés à chaque étape



### 3️⃣ **utils/ai_quote_generator.js**

**Problème identifié :**

- Ne récupère pas les données de l'analyse GPT

- Parsing fallback insuffisant



**Corrections apportées :**

- ✅ Utilisation prioritaire des données d'analyse GPT

- ✅ Fallback amélioré avec détection par mots-clés

- ✅ Normalisation des catégories et unités

- ✅ Tarifs par défaut configurables



### 4️⃣ **Base de données Supabase**

**Modification requise :**

```sql

-- Ajouter la colonne analysis_data si elle n'existe pas

ALTER TABLE notes 

ADD COLUMN IF NOT EXISTS analysis_data TEXT;

```



## 🧪 Tests à effectuer



### Test 1 : Vérifier la configuration OpenAI

```javascript

// Dans config/openai.js

export const OPENAI_CONFIG = {

  apiKey: 'sk-proj-...', // Vérifier que la clé est valide

  apiUrl: 'https://api.openai.com/v1',

  models: {

    whisper: 'whisper-1',

    gpt: 'gpt-4o-mini'

  }

};

```



### Test 2 : Lancer le script de test

```bash

node test/testPrestationDetection.js

```



### Test 3 : Exemples de phrases à tester dans l'app



#### ✅ Prestations (doivent générer un devis) :

1. "Repeindre le salon qui fait 20 mètres carrés"

2. "Installation de 3 prises électriques dans la cuisine"

3. "Refaire la salle de bain complète"

4. "Poser du parquet dans les chambres, 35 m²"

5. "Remplacer le chauffe-eau par un 200 litres"



#### ❌ Non-prestations (ne doivent PAS générer de devis) :

1. "Le client préfère les tons clairs"

2. "Rappel acheter les vis pour demain"

3. "Madame Dupont n'aime pas le blanc"

4. "RDV mardi 14h avec le plombier"



## 🔍 Points de vérification (Checklist Debug)



### Console Logs à surveiller :



1. **[Transcription]** : Vérifier que le texte est bien capturé

   ```

   [Transcription] Texte reçu: "..."

   ```



2. **[Analyse]** : Vérifier le retour GPT

   ```

   [Analyse] Résultat: { type: "prestation", data: {...} }

   ```



3. **[VoiceRecorder]** : Vérifier la détection

   ```

   🔍 [VoiceRecorder] Type détecté: prestation

   🔍 [VoiceRecorder] Est-ce une prestation ? true

   ```



4. **[QuoteGenerator]** : Vérifier la génération

   ```

   [QuoteGenerator] ✅ Devis sauvegardé avec succès: UUID

   ```



## 📊 Tableau de diagnostic



| Étape | Succès ✅ | Échec ❌ | Solution |

|-------|-----------|----------|----------|

| Transcription audio | ✅ Texte obtenu | ❌ Vide/erreur | Vérifier clé OpenAI |

| Analyse GPT | ✅ JSON valide | ❌ Parse error | Vérifier format réponse |

| Détection type | ✅ "prestation" | ❌ Autre type | Ajuster prompt GPT |

| Génération devis | ✅ ID devis créé | ❌ Null | Vérifier données requises |

| Sauvegarde BD | ✅ Note + devis | ❌ Erreur SQL | Vérifier colonnes BD |



## 🚀 Étapes d'implémentation



1. **Backup des fichiers actuels**

   ```bash

   cp services/quoteAnalysisService.js services/quoteAnalysisService.backup.js

   cp components/VoiceRecorder.js components/VoiceRecorder.backup.js

   cp utils/ai_quote_generator.js utils/ai_quote_generator.backup.js

   ```



2. **Remplacer par les versions corrigées**

   - Copier le contenu des fichiers corrigés fournis



3. **Mettre à jour la base de données**

   ```sql

   -- Dans Supabase SQL Editor

   ALTER TABLE notes ADD COLUMN IF NOT EXISTS analysis_data TEXT;

   ```



4. **Redémarrer l'application**

   ```bash

   npm start

   ```



5. **Tester avec une phrase simple**

   - "Repeindre salon 20 mètres carrés"

   - Vérifier les logs console

   - Confirmer création du devis



## 💡 Améliorations futures recommandées



1. **Interface utilisateur**

   - Ajouter un indicateur visuel "Devis en cours de génération..."

   - Permettre l'édition manuelle du type détecté

   - Afficher un aperçu du devis généré



2. **Gestion des erreurs**

   - Retry automatique si échec API

   - Queue de traitement pour notes hors ligne

   - Notifications push quand devis prêt



3. **Intelligence artificielle**

   - Fine-tuning du modèle avec exemples spécifiques

   - Détection multi-prestations dans une seule note

   - Extraction automatique des prix si mentionnés



4. **Base de données**

   - Table `tarifs` pour personnalisation par artisan

   - Historique des modifications de devis

   - Templates de devis réutilisables



## 📞 Support



Si le problème persiste après application de ces corrections :



1. Vérifier les logs complets dans Metro/Expo

2. Tester l'API OpenAI directement avec curl/Postman

3. Vérifier les permissions Supabase (RLS policies)

4. Consulter la doc technique complète dans README.md



---



**Version:** 1.0  

**Date:** Janvier 2025  

**Auteur:** Assistant IA Claude
