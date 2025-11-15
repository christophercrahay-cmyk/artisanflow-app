# Audit Mentions Légales PDF

**Date** : 13 novembre 2025  
**Objectif** : Vérifier conformité légale des devis/factures PDF

---

## ✅ Ce qui est présent

### Informations entreprise (`utils/utils/pdf.js`)

- ✅ Nom entreprise (ligne 31)
- ✅ SIRET (ligne 32)
- ✅ Adresse (ligne 33)
- ✅ Téléphone (ligne 34)
- ✅ Email (ligne 35)

### Mentions commerciales (lignes 211-214)

- ✅ Validité du devis : 30 jours
- ✅ Conditions de paiement : Acompte 30% + Solde

---

## ❌ Ce qui MANQUE (obligatoire légalement)

### 1. Numéro de TVA intracommunautaire

**Obligation** : Article 289 du CGI  
**Statut** : ❌ Absent

```html
<!-- À ajouter -->
<div>TVA intra : FR12345678901</div>
```

**Action** : Ajouter champ `company_tva_number` dans `brand_settings` + afficher dans PDF

---

### 2. Assurance professionnelle

**Obligation** : Loi Spinetta (artisans BTP)  
**Statut** : ❌ Absent

```html
<!-- À ajouter -->
<div>Assurance RCP : [Nom assureur] – Police n°[XXXXXX]</div>
```

**Action** : Ajouter champs `insurance_provider` + `insurance_policy` dans `brand_settings`

---

### 3. Conditions Générales de Vente (CGV)

**Obligation** : Article L111-1 du Code de la consommation  
**Statut** : ⚠️ Partielles (uniquement paiement)

**Mentions manquantes** :
- Délai de rétractation (14 jours pour particuliers)
- Pénalités de retard (3x taux légal)
- Indemnité forfaitaire de recouvrement (40€)
- Modalités de réclamation

```html
<!-- À ajouter -->
<div class="legal">
  <div><strong>Conditions Générales de Vente</strong></div>
  <div>• Validité : 30 jours à compter de la date d'émission.</div>
  <div>• Paiement : Acompte 30% à la commande – Solde à la fin des travaux.</div>
  <div>• Délai de rétractation : 14 jours (Code de la consommation).</div>
  <div>• Pénalités de retard : 3x le taux d'intérêt légal en vigueur.</div>
  <div>• Indemnité forfaitaire de recouvrement : 40€ (décret 2012-1115).</div>
  <div>• Assurance : [Nom assureur] – Police n°[XXXXXX]</div>
  <div>• TVA intra : [FR12345678901]</div>
</div>
```

---

### 4. Mentions spécifiques BTP

**Obligation** : Code de la construction  
**Statut** : ❌ Absent

- Qualification professionnelle (RGE, Qualibat, etc.)
- Garantie décennale
- Garantie de parfait achèvement (1 an)
- Garantie biennale (2 ans)

```html
<!-- À ajouter si artisan BTP -->
<div>• Garantie décennale : [Nom assureur] – Police n°[XXXXXX]</div>
<div>• Qualification : RGE [Numéro]</div>
```

---

### 5. Signature électronique

**Obligation** : Aucune (mais recommandé)  
**Statut** : ❌ Absent (uniquement emplacement visuel)

**Action** : Intégrer signature électronique (DocuSign, HelloSign, ou custom)

---

## 🚨 Risques juridiques

### Sanctions possibles

1. **TVA intra manquant** : Amende 15€ par mention manquante (75€ max par doc)
2. **CGV incomplètes** : Amende 3 000€ (personne physique) ou 15 000€ (personne morale)
3. **Assurance non mentionnée** : Amende 1 500€
4. **Pénalités de retard non mentionnées** : Nullité clause → impossibilité facturer pénalités

---

## ✅ Plan d'action URGENT (avant lancement)

### Sprint 0 (avant janvier 2025)

#### 1. Compléter table `brand_settings`

```sql
-- Ajouter colonnes mentions légales
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS company_tva_number TEXT;
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS insurance_policy TEXT;
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS qualification TEXT; -- RGE, Qualibat, etc.
```

#### 2. Mettre à jour écran Paramètres (`screens/SettingsScreen.js`)

Ajouter formulaire :
- Numéro TVA intra
- Assurance RCP (nom + n° police)
- Assurance décennale (si BTP)
- Qualification professionnelle (optionnel)

#### 3. Modifier template PDF (`utils/utils/pdf.js`)

**Ligne 211-214** → remplacer par :

```javascript
const legalBlock = `
  <div class="legal">
    <div><strong>Conditions Générales de Vente</strong></div>
    <div>• Validité : 30 jours à compter de la date d'émission.</div>
    <div>• Paiement : Acompte 30% à la commande – Solde à la fin des travaux.</div>
    <div>• Délai de rétractation : 14 jours (Code de la consommation, art. L221-18).</div>
    <div>• Pénalités de retard : 3 fois le taux d'intérêt légal en vigueur (décret 2009-138).</div>
    <div>• Indemnité forfaitaire de recouvrement : 40€ en cas de retard (décret 2012-1115).</div>
    ${company?.tvaNumber ? `<div>• TVA intra : ${company.tvaNumber}</div>` : ''}
    ${company?.insurance ? `<div>• Assurance RCP : ${company.insurance}</div>` : ''}
    ${company?.qualification ? `<div>• Qualification : ${company.qualification}</div>` : ''}
  </div>
`;
```

**Ligne 215-216** → supprimer (intégré dans legalBlock)

#### 4. Tester avec un avocat / expert-comptable

- Faire relire un modèle de devis PDF par un professionnel
- Valider conformité secteur BTP si applicable

---

## 📋 Checklist post-lancement

- [ ] Ajouter signature électronique (Q1 2025)
- [ ] Proposer templates sectoriels (Plomberie, Électricité, Maçonnerie)
- [ ] Intégrer module de facturation (numérotation automatique conforme)
- [ ] Exporter historique comptable (expert-comptable)

---

## 📚 Références légales

- **TVA intra** : Article 289 du CGI
- **CGV** : Article L111-1 du Code de la consommation
- **Pénalités de retard** : Décret 2009-138
- **Indemnité recouvrement** : Décret 2012-1115
- **Délai rétractation** : Article L221-18 du Code de la consommation
- **Assurance RCP** : Loi Spinetta (artisans BTP)

---

## ✅ Conclusion

**État actuel** : PDF générés mais **non conformes légalement** pour un usage professionnel.

**Risque** : Sanctions DGCCRF (3 000 à 15 000€) + nullité clauses pénalités retard.

**Priorité** : Sprint 0 (points 1-4) AVANT lancement janvier 2025.

**Temps estimé** : 4-6h développement + validation juridique.

