# Patch Template PDF - Mentions légales complètes

**Fichier** : `utils/utils/pdf.js`  
**Objectif** : Ajouter mentions légales conformes dans les devis/factures PDF

---

## 📝 Modifications à apporter

### 1. Modifier fonction `buildDevisHTML` (ligne 26)

**Ajouter paramètre `company` étendu** avec les nouveaux champs :

```javascript
// AVANT (ligne 26)
function buildDevisHTML({ number, dateISO, company, client, project, lignes, tva, logoUrl, template = 'classique' }) {

// Le reste du code reste identique...
}
```

Le paramètre `company` recevra maintenant :

```javascript
{
  name: 'Mon Entreprise',
  siret: '123456789',
  address: '123 rue...',
  phone: '06...',
  email: 'contact@...',
  // ✅ NOUVEAUX CHAMPS
  tvaNumber: 'FR12345678901',
  legalForm: 'SARL',
  capitalSocial: '10000€',
  insuranceRcp: 'AXA - Police n°123456',
  insuranceDecennale: 'MAIF - Police n°789012',
  qualification: 'RGE, Qualibat'
}
```

---

### 2. Remplacer le bloc `legalBlock` (lignes 211-214)

**SUPPRIMER** l'ancien code :

```javascript
// ❌ SUPPRIMER CES LIGNES
<div class="legal">
  <div>Validité du devis : 30 jours à compter de la date d'émission.</div>
  <div>Acompte : 30% à la commande – Solde à la fin des travaux.</div>
</div>
```

**REMPLACER PAR** ce nouveau code conforme :

```javascript
// ✅ NOUVEAU BLOC LÉGAL COMPLET
const legalBlock = `
  <div class="legal">
    <div class="legal-title"><strong>Conditions Générales de Vente</strong></div>
    
    <div class="legal-item">
      <strong>• Validité :</strong> 30 jours à compter de la date d'émission.
    </div>
    
    <div class="legal-item">
      <strong>• Conditions de paiement :</strong> Acompte de 30% à la commande – Solde à la fin des travaux.
    </div>
    
    <div class="legal-item">
      <strong>• Délai de rétractation :</strong> 14 jours pour les particuliers (Code de la consommation, art. L221-18).
    </div>
    
    <div class="legal-item">
      <strong>• Pénalités de retard :</strong> En cas de retard de paiement, des pénalités égales à trois fois le taux d'intérêt légal en vigueur seront appliquées (décret 2009-138).
    </div>
    
    <div class="legal-item">
      <strong>• Indemnité forfaitaire de recouvrement :</strong> 40€ en cas de retard de paiement (décret 2012-1115).
    </div>
    
    ${company?.tvaNumber ? `
    <div class="legal-item">
      <strong>• TVA intra :</strong> ${company.tvaNumber}
    </div>
    ` : ''}
    
    ${company?.legalForm ? `
    <div class="legal-item">
      <strong>• Forme juridique :</strong> ${formatLegalForm(company.legalForm)}${company.capitalSocial ? ` – Capital social : ${company.capitalSocial}` : ''}
    </div>
    ` : ''}
    
    ${company?.insuranceRcp ? `
    <div class="legal-item">
      <strong>• Assurance RCP :</strong> ${company.insuranceRcp}
    </div>
    ` : ''}
    
    ${company?.insuranceDecennale ? `
    <div class="legal-item">
      <strong>• Assurance décennale :</strong> ${company.insuranceDecennale}
    </div>
    ` : ''}
    
    ${company?.qualification ? `
    <div class="legal-item">
      <strong>• Qualification :</strong> ${company.qualification}
    </div>
    ` : ''}
  </div>
`;
```

---

### 3. Ajouter fonction helper `formatLegalForm` (avant la fonction `buildDevisHTML`)

```javascript
/**
 * Formate la forme juridique pour affichage
 */
function formatLegalForm(legalForm) {
  const forms = {
    'auto_entrepreneur': 'Micro-entreprise',
    'eurl': 'EURL',
    'sarl': 'SARL',
    'sas': 'SAS',
    'sasu': 'SASU',
    'sci': 'SCI',
    'other': 'Autre',
  };
  return forms[legalForm] || legalForm;
}
```

---

### 4. Mettre à jour les styles CSS (section `.legal`, dans les 3 templates)

**Ajouter dans les styles (après la définition de `.legal`)** :

```css
.legal {
  margin-top: 18px;
  font-size: 11px;
  color: #555;
  line-height: 1.6;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.legal-title {
  font-size: 13px;
  margin-bottom: 12px;
  color: #111;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legal-item {
  margin-bottom: 6px;
  padding-left: 0;
}

.legal-item strong {
  color: #374151;
  font-weight: 600;
}
```

---

### 5. Modifier `generateDevisPDFFromDB` (ligne 282-288)

**AVANT** :

```javascript
const company = {
  name: brandSettings?.company_name || 'Mon Entreprise',
  siret: brandSettings?.company_siret || '',
  address: fullAddress || '',
  phone: brandSettings?.company_phone || '',
  email: brandSettings?.company_email || '',
};
```

**APRÈS** (ajouter les champs légaux) :

```javascript
const company = {
  name: brandSettings?.company_name || 'Mon Entreprise',
  siret: brandSettings?.company_siret || '',
  address: fullAddress || '',
  phone: brandSettings?.company_phone || '',
  email: brandSettings?.company_email || '',
  
  // ✅ AJOUTER CHAMPS LÉGAUX
  tvaNumber: brandSettings?.company_tva_number || null,
  legalForm: brandSettings?.legal_form || null,
  capitalSocial: brandSettings?.capital_social || null,
  
  // Format assurance RCP
  insuranceRcp: brandSettings?.insurance_rcp_provider && brandSettings?.insurance_rcp_policy
    ? `${brandSettings.insurance_rcp_provider} – Police n°${brandSettings.insurance_rcp_policy}`
    : null,
  
  // Format assurance décennale
  insuranceDecennale: brandSettings?.insurance_decennale_provider && brandSettings?.insurance_decennale_policy
    ? `${brandSettings.insurance_decennale_provider} – Police n°${brandSettings.insurance_decennale_policy}`
    : null,
  
  qualification: brandSettings?.professional_qualification || null,
};
```

---

### 6. Insérer `legalBlock` dans le HTML (ligne 217)

**Chercher la fin du template HTML** (après les totaux, avant la signature) :

```html
<!-- AVANT (ligne 217) -->
<div class="sign">Signature du client</div>
</body>
</html>
```

**REMPLACER PAR** :

```html
<!-- ✅ INSÉRER legalBlock ICI -->
${legalBlock}

<div class="sign">Signature du client</div>
</body>
</html>
```

---

## ✅ Résultat

Après ces modifications, les PDF générés auront :

- ✅ Numéro TVA intra
- ✅ Forme juridique + capital social
- ✅ Assurance RCP + police
- ✅ Assurance décennale + police (si renseignée)
- ✅ Qualification professionnelle (si renseignée)
- ✅ Conditions Générales de Vente complètes :
  - Validité 30 jours
  - Paiement acompte 30%
  - Délai rétractation 14 jours
  - Pénalités retard (3x taux légal)
  - Indemnité recouvrement 40€

---

## 🧪 Test

1. Exécuter `sql/add_legal_fields_to_brand_settings.sql`
2. Remplir les champs dans Paramètres
3. Générer un devis PDF
4. Vérifier présence de TOUTES les mentions légales
5. ✅ **Faire valider par un avocat / expert-comptable**

---

## 📊 Conformité

| Mention | Obligation | Statut |
|---------|------------|--------|
| TVA intra | Article 289 CGI | ✅ |
| Assurance RCP | Loi Spinetta | ✅ |
| CGV (paiement) | L111-1 Conso | ✅ |
| Délai rétractation | L221-18 Conso | ✅ |
| Pénalités retard | Décret 2009-138 | ✅ |
| Indemnité 40€ | Décret 2012-1115 | ✅ |

---

**Temps estimé** : 30-40 min d'intégration  
**Impact** : Conformité légale complète ✅

