# 🧪 GUIDE DE TEST - PRÉ-REMPLISSAGE DEVIS MANUELS

**Objectif** : Vérifier que les informations d'entreprise sont bien pré-remplies lors de la création de devis manuels.

---

## 📋 **TEST 1 : Configuration des paramètres**

### Étapes

1. **Ouvrir l'app** et se connecter
2. **Aller dans l'onglet "Documents"** (en bas)
3. **Cliquer sur l'icône ⚙️** (en haut à droite)
4. **Configurer les paramètres suivants** :
   - **TVA par défaut** : `10`
   - **Préfixe Devis** : `DEVIS`
   - **Préfixe Facture** : `FACT`
5. **Cliquer sur "Sauvegarder"**
6. **Vérifier** : Message "✅ Succès - Paramètres sauvegardés"

### Résultat attendu

✅ Les paramètres sont sauvegardés

---

## 📋 **TEST 2 : Création d'un devis avec paramètres**

### Étapes

1. **Aller sur un chantier** (onglet "Chantiers" → sélectionner un chantier)
2. **Scroller vers le bas** jusqu'à la section "📋 Devis"
3. **Cliquer sur le bouton "+"** (à droite du titre "📋 Devis")
4. **Observer le formulaire qui s'affiche**

### Résultat attendu

✅ **Numéro** : `DEVIS-2025-XXXX` (avec le préfixe configuré)  
✅ **TVA %** : `10` (valeur configurée dans les paramètres)

### Actions supplémentaires

5. **Remplir le formulaire** :
   - **Montant HT** : `1000`
   - **TVA %** : Laisser `10` (ou modifier à `5.5` pour tester)
6. **Cliquer sur "💾 Créer"**
7. **Vérifier** : Message "OK - Devis créé ✅"
8. **Observer la liste** : Le devis apparaît avec le bon montant TTC

---

## 📋 **TEST 3 : Création d'une facture**

### Étapes

1. **Rester sur le même chantier**
2. **Scroller vers le bas** jusqu'à la section "💰 Factures"
3. **Cliquer sur le bouton "+"**
4. **Observer le formulaire**

### Résultat attendu

✅ **Numéro** : `FACT-2025-XXXX` (avec le préfixe facture configuré)  
✅ **TVA %** : `10` (valeur configurée)

---

## 📋 **TEST 4 : Modification ponctuelle de la TVA**

### Étapes

1. **Créer un nouveau devis**
2. **Modifier la TVA** de `10` à `5.5`
3. **Sauvegarder le devis**
4. **Retourner dans Paramètres > Entreprise**
5. **Vérifier la TVA par défaut**

### Résultat attendu

✅ **TVA par défaut** : Toujours `10` (pas modifiée)  
✅ **Devis créé** : A bien `5.5%` (modification ponctuelle)

---

## 📋 **TEST 5 : Nouveau compte sans paramètres**

### Étapes

1. **Se déconnecter**
2. **Créer un nouveau compte** (ou utiliser un compte test)
3. **Ne PAS configurer les paramètres entreprise**
4. **Aller sur un chantier**
5. **Créer un devis**

### Résultat attendu

✅ **Numéro** : `DEV-2025-XXXX` (préfixe par défaut)  
✅ **TVA %** : `20` (valeur par défaut)

**Explication** : Les valeurs par défaut sont utilisées si aucun paramètre n'est configuré.

---

## 📋 **TEST 6 : Logs de debugging**

### Étapes

1. **Ouvrir l'app** avec les outils de développement (si possible)
2. **Aller sur un chantier**
3. **Observer les logs dans la console**

### Résultat attendu

✅ **Log visible** :
```
[DevisFactures] ✅ Paramètres entreprise chargés: { tva: 10, prefixDevis: 'DEVIS', prefixFacture: 'FACT' }
```

**OU** (si aucun paramètre configuré) :
```
[DevisFactures] ℹ️ Aucun paramètre entreprise configuré, utilisation des valeurs par défaut
```

---

## ✅ **CHECKLIST FINALE**

- [ ] Paramètres entreprise sauvegardés
- [ ] Devis créé avec préfixe personnalisé
- [ ] TVA pré-remplie avec la valeur configurée
- [ ] Facture créée avec préfixe personnalisé
- [ ] Modification ponctuelle de TVA ne modifie pas les paramètres globaux
- [ ] Fallback vers valeurs par défaut si aucun paramètre configuré
- [ ] Logs de debugging visibles (optionnel)

---

## 🐛 **EN CAS DE PROBLÈME**

### Problème 1 : TVA toujours à 20%

**Cause possible** : Les paramètres ne sont pas chargés

**Solution** :
1. Vérifier que les paramètres sont bien sauvegardés (aller dans Paramètres > Entreprise)
2. Redémarrer l'app
3. Vérifier les logs dans la console

---

### Problème 2 : Préfixe toujours "DE" ou "FA"

**Cause possible** : Les paramètres ne sont pas chargés

**Solution** :
1. Vérifier que les préfixes sont bien configurés dans Paramètres > Entreprise
2. Redémarrer l'app
3. Vérifier les logs dans la console

---

### Problème 3 : Erreur "Utilisateur non connecté"

**Cause possible** : Session expirée

**Solution** :
1. Se déconnecter
2. Se reconnecter
3. Réessayer

---

## 📊 **RÉSULTAT ATTENDU GLOBAL**

✅ **Tous les tests passent**  
✅ **Les paramètres entreprise sont bien utilisés**  
✅ **Les valeurs par défaut fonctionnent en fallback**  
✅ **Pas de bug ni d'erreur**

---

**Si tous les tests passent, la fonctionnalité est prête à être utilisée en production !** 🎉

