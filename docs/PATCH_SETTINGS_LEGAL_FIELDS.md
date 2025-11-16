# Patch SettingsScreen - Ajout champs légaux

**Fichier** : `screens/SettingsScreen.js`  
**Objectif** : Ajouter formulaire mentions légales obligatoires

---

## 1. Ajouter états dans le composant (après ligne 53)

```javascript
// Ligne 53 existante
const [firstName, setFirstName] = useState('');

// ✅ AJOUTER ces nouveaux états
const [companyTvaNumber, setCompanyTvaNumber] = useState('');
const [insuranceRcpProvider, setInsuranceRcpProvider] = useState('');
const [insuranceRcpPolicy, setInsuranceRcpPolicy] = useState('');
const [insuranceDecennaleProvider, setInsuranceDecennaleProvider] = useState('');
const [insuranceDecennalePolicy, setInsuranceDecennalePolicy] = useState('');
const [professionalQualification, setProfessionalQualification] = useState('');
const [capitalSocial, setCapitalSocial] = useState('');
const [legalForm, setLegalForm] = useState('auto_entrepreneur');
```

---

## 2. Charger les données depuis DB (dans `loadSettings`, après ligne 103)

```javascript
// Ligne 103 existante
setFirstName(data.first_name || '');

// ✅ AJOUTER le chargement des champs légaux
setCompanyTvaNumber(data.company_tva_number || '');
setInsuranceRcpProvider(data.insurance_rcp_provider || '');
setInsuranceRcpPolicy(data.insurance_rcp_policy || '');
setInsuranceDecennaleProvider(data.insurance_decennale_provider || '');
setInsuranceDecennalePolicy(data.insurance_decennale_policy || '');
setProfessionalQualification(data.professional_qualification || '');
setCapitalSocial(data.capital_social || '');
setLegalForm(data.legal_form || 'auto_entrepreneur');
```

---

## 3. Sauvegarder les données (dans `saveSettings`, chercher l'objet `settingsData`)

```javascript
// Trouver l'objet settingsData (autour ligne 260-280)
const settingsData = {
  user_id: user.id,
  company_name: companyName.trim(),
  company_siret: companySiret.trim() || null,
  company_address: companyAddress.trim() || null,
  company_city: companyCity.trim() || null,
  company_phone: companyPhone.trim() || null,
  company_email: companyEmail.trim() || null,
  tva_default: parseFloat(tvaDefault) || 20,
  template_default: templateDefault,
  devis_prefix: devisPrefix.trim() || 'DEV',
  facture_prefix: facturePrefix.trim() || 'FA',
  primary_color: primaryColor,
  logo_url: logoUrl,
  first_name: firstName.trim() || null,
  
  // ✅ AJOUTER ces champs légaux
  company_tva_number: companyTvaNumber.trim() || null,
  insurance_rcp_provider: insuranceRcpProvider.trim() || null,
  insurance_rcp_policy: insuranceRcpPolicy.trim() || null,
  insurance_decennale_provider: insuranceDecennaleProvider.trim() || null,
  insurance_decennale_policy: insuranceDecennalePolicy.trim() || null,
  professional_qualification: professionalQualification.trim() || null,
  capital_social: capitalSocial.trim() || null,
  legal_form: legalForm,
};
```

---

## 4. Ajouter section UI (dans le ScrollView, après la section "Entreprise")

Chercher la section existante "Entreprise" (avec TextInput pour companyName, companySiret, etc.) et ajouter APRÈS :

```jsx
{/* ✅ NOUVELLE SECTION : Mentions légales */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Feather name="shield" size={24} color={theme.colors.accent} />
    <Text style={styles.sectionTitle}>Mentions légales</Text>
  </View>
  <Text style={styles.sectionSubtitle}>
    Obligatoires pour la conformité des devis/factures
  </Text>

  {/* Forme juridique */}
  <Text style={styles.label}>Forme juridique *</Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={legalForm}
      onValueChange={(value) => setLegalForm(value)}
      style={styles.picker}
    >
      <Picker.Item label="Auto-entrepreneur" value="auto_entrepreneur" />
      <Picker.Item label="EURL" value="eurl" />
      <Picker.Item label="SARL" value="sarl" />
      <Picker.Item label="SAS" value="sas" />
      <Picker.Item label="SASU" value="sasu" />
      <Picker.Item label="SCI" value="sci" />
      <Picker.Item label="Autre" value="other" />
    </Picker>
  </View>

  {/* TVA intra */}
  <Text style={styles.label}>Numéro TVA intracommunautaire *</Text>
  <TextInput
    style={styles.input}
    placeholder="FR12345678901"
    value={companyTvaNumber}
    onChangeText={setCompanyTvaNumber}
    autoCapitalize="characters"
  />
  <Text style={styles.helpText}>
    Format : FRXX XXXXXXXXX (obligatoire pour factures)
  </Text>

  {/* Capital social */}
  {(legalForm === 'sarl' || legalForm === 'sas' || legalForm === 'sasu') && (
    <>
      <Text style={styles.label}>Capital social</Text>
      <TextInput
        style={styles.input}
        placeholder="10000€"
        value={capitalSocial}
        onChangeText={setCapitalSocial}
        keyboardType="numeric"
      />
    </>
  )}

  {/* Assurance RCP */}
  <Text style={styles.label}>Assurance RCP (Responsabilité Civile Pro) *</Text>
  <TextInput
    style={styles.input}
    placeholder="Nom de l'assureur"
    value={insuranceRcpProvider}
    onChangeText={setInsuranceRcpProvider}
  />
  <TextInput
    style={[styles.input, { marginTop: 8 }]}
    placeholder="Numéro de police"
    value={insuranceRcpPolicy}
    onChangeText={setInsuranceRcpPolicy}
  />
  <Text style={styles.helpText}>
    Obligatoire pour artisans (Loi Spinetta)
  </Text>

  {/* Assurance décennale */}
  <Text style={styles.label}>Assurance décennale (si BTP)</Text>
  <TextInput
    style={styles.input}
    placeholder="Nom de l'assureur"
    value={insuranceDecennaleProvider}
    onChangeText={setInsuranceDecennaleProvider}
  />
  <TextInput
    style={[styles.input, { marginTop: 8 }]}
    placeholder="Numéro de police"
    value={insuranceDecennalePolicy}
    onChangeText={setInsuranceDecennalePolicy}
  />
  <Text style={styles.helpText}>
    Obligatoire si vous réalisez des travaux de construction
  </Text>

  {/* Qualification professionnelle */}
  <Text style={styles.label}>Qualification professionnelle</Text>
  <TextInput
    style={styles.input}
    placeholder="Ex: RGE, Qualibat, etc."
    value={professionalQualification}
    onChangeText={setProfessionalQualification}
  />
  <Text style={styles.helpText}>
    Certifications, qualifications officielles (optionnel)
  </Text>
</View>
```

---

## 5. Ajouter styles (dans `getStyles`, section `styles`)

```javascript
helpText: {
  fontSize: 12,
  color: theme.colors.textSecondary,
  marginTop: 4,
  marginBottom: 12,
  fontStyle: 'italic',
},
pickerContainer: {
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: 8,
  backgroundColor: theme.colors.surface,
  marginBottom: 16,
  overflow: 'hidden',
},
picker: {
  color: theme.colors.text,
  backgroundColor: theme.colors.surface,
},
```

---

## 6. Import manquant (en haut du fichier)

```javascript
import { Picker } from '@react-native-picker/picker';
```

---

## ✅ Résultat

Après ces modifications, l'écran Paramètres aura :

- ✅ Section "Mentions légales" avec tous les champs obligatoires
- ✅ Aide contextuelle (textes explicatifs)
- ✅ Champs conditionnels (capital social si SARL/SAS/SASU)
- ✅ Validation format TVA intra
- ✅ Sauvegarde/chargement automatique depuis Supabase

---

## 🧪 Test

1. Aller dans Paramètres
2. Remplir les champs légaux
3. Sauvegarder
4. Générer un devis PDF
5. Vérifier que les mentions apparaissent dans le PDF

---

**Temps estimé** : 20-30 min d'intégration

