# 📄 Guide : Système de Templates PDF (Devis/Factures)

**Date** : 13 novembre 2025  
**Version** : 1.0.0

---

## 📊 RÉSUMÉ DE L'ARCHITECTURE ACTUELLE

### ✅ Ce qui fonctionne

1. **4 templates PDF disponibles** :
   - `minimal` : Épuré, élégant, sans fioritures
   - `classique` : Équilibré, professionnel, standard (défaut)
   - `bandeBleue` : Moderne, coloré, professionnel
   - `premium` : Haut de gamme noir & or, pour artisans premium et devis importants

2. **Stockage** :
   - Colonne `brand_settings.template_default` (TEXT, défaut `'classique'`)
   - Stocké par utilisateur (multi-tenant)

3. **UI de sélection** :
   - **Écran** : `SettingsScreen` (accessible via bouton rouage dans `DocumentsScreen`)
   - **Section** : "Modèle de document"
   - **4 boutons** : Minimal / Classique / Bande Bleue / Premium (noir & or)

4. **Génération PDF** :
   - Fonction principale : `generateDevisPDFFromDB(devisId)` dans `utils/utils/pdf.js`
   - Récupère automatiquement le template depuis `brand_settings.template_default`
   - Validation du template avec fallback sur `'classique'` si invalide

### 📁 Fichiers clés

| Fichier | Rôle |
|---------|------|
| `types/documentTemplates.ts` | Types TypeScript + config centralisée |
| `utils/utils/pdf.js` | Génération PDF avec templates |
| `screens/SettingsScreen.js` | UI de sélection du template |
| `services/documentTemplateService.js` | Service pour lire/écrire le template |
| `sql/create_brand_settings_table.sql` | Schéma DB (colonne `template_default`) |

---

## 🔧 COMMENT ÇA MARCHE

### 1. Configuration centralisée

**Fichier** : `types/documentTemplates.ts`

```typescript
export type DocumentTemplateId = 'minimal' | 'classique' | 'bandeBleue' | 'premium';

export const DOCUMENT_TEMPLATES = {
  minimal: { id: 'minimal', label: 'Minimal', description: '...' },
  classique: { id: 'classique', label: 'Classique', description: '...' },
  bandeBleue: { id: 'bandeBleue', label: 'Bande Bleue', description: '...' },
};
```

### 2. Stockage dans Supabase

**Table** : `brand_settings`  
**Colonne** : `template_default` (TEXT, défaut `'classique'`)

```sql
template_default TEXT DEFAULT 'classique'
```

### 3. Génération PDF

**Fichier** : `utils/utils/pdf.js`

```javascript
// Récupération du template depuis les settings
const templateRaw = brandSettings?.template_default || DEFAULT_TEMPLATE;
const template = isValidTemplateId(templateRaw) ? templateRaw : DEFAULT_TEMPLATE;

// Utilisation dans buildDevisHTML()
const html = buildDevisHTML({ ..., template });
```

### 4. UI de sélection

**Fichier** : `screens/SettingsScreen.js`

- Section "Modèle de document"
- 3 boutons radio (Minimal / Classique / Bande Bleue)
- Sauvegarde dans `brand_settings.template_default` au clic

---

## ✅ VÉRIFICATION : LE SYSTÈME EST-IL UTILISÉ ?

**OUI, le système est fonctionnel** :

1. ✅ Le template est stocké dans `brand_settings.template_default`
2. ✅ Le template est récupéré dans `generateDevisPDFFromDB()` (ligne 363)
3. ✅ Le template est utilisé dans `buildDevisHTML()` (ligne 43)
4. ✅ L'UI permet de choisir le template dans `SettingsScreen`
5. ✅ La sauvegarde fonctionne (ligne 286 de `SettingsScreen.js`)

**Conclusion** : Le système est **complet et fonctionnel**. Pas de code mort.

---

## 🆕 AJOUTER UN NOUVEAU TEMPLATE

### Étape 1 : Ajouter le type

**Fichier** : `types/documentTemplates.ts`

```typescript
export type DocumentTemplateId = 'minimal' | 'classique' | 'bandeBleue' | 'nouveau';

export const DOCUMENT_TEMPLATES = {
  // ... existants
  nouveau: {
    id: 'nouveau',
    label: 'Nouveau',
    description: 'Description du nouveau template',
  },
};

export const AVAILABLE_TEMPLATES = ['minimal', 'classique', 'bandeBleue', 'nouveau'];
```

### Étape 2 : Ajouter les styles CSS

**Fichier** : `utils/utils/pdf.js`

Dans la fonction `buildDevisHTML()`, ajouter un `else if` :

```javascript
} else if (template === 'nouveau') {
  templateStyles = `
    body { ... }
    .header { ... }
    // ... styles CSS du nouveau template
  `;
} else { // classique (défaut)
```

### Étape 3 : Ajouter dans l'UI

**Fichier** : `screens/SettingsScreen.js`

Ajouter le nouveau template dans le tableau :

```javascript
{['minimal', 'classique', 'bandeBleue', 'nouveau'].map((template) => {
  const templateLabels = {
    minimal: 'Minimal',
    classique: 'Classique',
    bandeBleue: 'Bande Bleue',
    nouveau: 'Nouveau', // ← Ajouter ici
  };
  // ...
})}
```

### Étape 4 : Mettre à jour le type DB (optionnel)

Si tu veux forcer la validation au niveau DB, tu peux créer une contrainte CHECK :

```sql
ALTER TABLE brand_settings 
ADD CONSTRAINT check_template_default 
CHECK (template_default IN ('minimal', 'classique', 'bandeBleue', 'nouveau'));
```

---

## 🧹 NETTOYAGE EFFECTUÉ

### Code mort supprimé

Aucun code mort trouvé. Le système est propre.

### Améliorations apportées

1. ✅ **Type TypeScript centralisé** : `DocumentTemplateId` dans `types/documentTemplates.ts`
2. ✅ **Configuration centralisée** : `DOCUMENT_TEMPLATES` avec labels et descriptions
3. ✅ **Validation** : Fonction `isValidTemplateId()` pour valider les templates
4. ✅ **Service dédié** : `documentTemplateService.js` pour lire/écrire le template
5. ✅ **UI améliorée** : Label "Modèle de document" au lieu de "Template par défaut"

---

## 📝 NOTES IMPORTANTES

### Templates de devis réutilisables ≠ Templates de PDF

⚠️ **Attention** : Il existe **DEUX systèmes de templates** différents :

1. **Templates de PDF** (layout/style) : `minimal`, `classique`, `bandeBleue`
   - Géré dans `brand_settings.template_default`
   - Utilisé pour le rendu visuel du PDF

2. **Templates de devis** (lignes réutilisables) : `devis_templates` (table Supabase)
   - Géré dans `TemplatesScreen.js`
   - Permet de créer des devis avec des lignes pré-définies

Ces deux systèmes sont **indépendants** et ne doivent pas être confondus.

---

## 🌟 TEMPLATE PREMIUM (NOIR & OR)

### Description visuelle

Le template **Premium** est conçu pour les artisans haut de gamme et les devis importants. Il offre un design sophistiqué avec :

- **En-tête noir** (`#080B12`) : Bandeau horizontal sur toute la largeur avec fond sombre
- **Accents dorés** (`#F4C542`) : Titre "DEVIS/FACTURE" en doré, Total TTC mis en valeur
- **Tableau élégant** : En-tête noir avec texte blanc, lignes alternées très discrètes
- **Blocs destinataire/chantier** : Fond très léger (`#F6F6F9`) avec bordures fines
- **Conditions générales** : Titre en majuscules noir, texte lisible avec marges suffisantes

### Quand l'utiliser

- ✅ Artisans haut de gamme (luxe, design, rénovation premium)
- ✅ Devis importants (montants élevés, projets prestigieux)
- ✅ Image professionnelle renforcée
- ✅ Clients exigeants en matière de présentation

### Caractéristiques techniques

- **Couleurs** :
  - Principal : `#080B12` (noir/bleu nuit)
  - Accent : `#F4C542` (doré)
  - Fond : `#fff` (blanc pour impression)
- **Police** : Arial/Helvetica (sans-serif)
- **Structure** : Identique aux autres templates (mêmes sections HTML)

---

## 🎯 RÉSUMÉ EXÉCUTIF

### ✅ Système fonctionnel

- **4 templates PDF** disponibles et fonctionnels
- **Stockage** : `brand_settings.template_default`
- **UI** : Sélection dans `SettingsScreen` (accessible via Documents)
- **Génération** : Template utilisé automatiquement lors de la génération PDF

### ✅ Améliorations apportées

1. Type TypeScript centralisé
2. Configuration centralisée avec labels
3. Validation des templates
4. Service dédié pour gestion
5. UI améliorée

### 📚 Pour ajouter un nouveau template

1. Ajouter le type dans `types/documentTemplates.ts`
2. Ajouter les styles CSS dans `utils/utils/pdf.js`
3. Ajouter dans l'UI de `SettingsScreen.js`
4. (Optionnel) Mettre à jour la contrainte DB

---

**Le système est prêt et fonctionnel !** 🎉

