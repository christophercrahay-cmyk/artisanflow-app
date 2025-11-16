# 🧪 GUIDE DE TEST - IA APPRENTISSAGE DES PRIX

**Objectif** : Tester que l'IA apprend automatiquement les prix moyens de l'artisan

---

## 📋 **ÉTAPE 1 : EXÉCUTER LE SCRIPT SQL**

### **Dans Supabase SQL Editor**

1. **Copier/coller** le contenu de `sql/create_ai_profiles_table.sql`
2. **Exécuter**
3. **Vérifier les résultats** :
   - ✅ "Table ai_profiles créée avec succès !"
   - ✅ Structure de la table (10 colonnes)
   - ✅ RLS activé
   - ✅ 3 policies (SELECT, INSERT, UPDATE)

---

## 📋 **ÉTAPE 2 : REDÉMARRER L'APP**

```bash
# Arrêter l'app (Ctrl+C)
# Relancer
npx expo start --tunnel
```

---

## 📋 **ÉTAPE 3 : CRÉER UN PREMIER DEVIS IA**

### **Actions**

1. **Ouvrir un chantier** avec des notes vocales
2. **Cliquer sur "Générer devis IA"** (bouton violet)
3. **Répondre aux questions** de l'IA
4. **Cliquer sur "Créer le devis (brouillon)"**

### **Vérifier dans les logs**

Tu devrais voir :
```
[AILearning] 🧠 Début apprentissage pour devis: xxx-xxx-xxx
[AILearning] 📊 8 lignes à analyser
[AILearning] 📝 "Prise électrique encastrée" → clé: "prise_electrique"
[AILearning] ✅ "prise_electrique" mis à jour: { avg: 45, count: 8, min: 45, max: 45 }
[AILearning] 📝 "Interrupteur simple" → clé: "interrupteur"
[AILearning] ✅ "interrupteur" mis à jour: { avg: 30, count: 3, min: 30, max: 30 }
[AILearning] ✅ Profil IA mis à jour: { totalDevis: 1, totalLignes: 11, experienceScore: 5, prixAppris: 2 }
✅ Profil IA mis à jour
```

---

### **Vérifier dans Supabase**

**Requête SQL** :
```sql
SELECT * FROM ai_profiles WHERE user_id = 'ton-user-id';
```

**Résultat attendu** :
```json
{
  "id": "abc-123...",
  "user_id": "def-456...",
  "avg_prices": {
    "prise_electrique": {
      "avg": 45.0,
      "count": 8,
      "min": 45.0,
      "max": 45.0
    },
    "interrupteur": {
      "avg": 30.0,
      "count": 3,
      "min": 30.0,
      "max": 30.0
    }
  },
  "experience_score": 5,
  "total_devis": 1,
  "total_lignes": 11,
  "created_at": "2025-11-09...",
  "last_updated": "2025-11-09..."
}
```

---

## 📋 **ÉTAPE 4 : CRÉER UN DEUXIÈME DEVIS IA**

### **Actions**

1. **Créer un autre devis IA** avec des prix différents
   - Par exemple : Prise à 50€ (au lieu de 45€)
2. **Vérifier dans les logs** :
   ```
   [AILearning] ✅ "prise_electrique" mis à jour: { avg: 47.5, count: 16, min: 45, max: 50 }
   [AILearning] ✅ Profil IA mis à jour: { totalDevis: 2, experienceScore: 10 }
   ```

### **Vérifier dans Supabase**

**Résultat attendu** :
```json
{
  "avg_prices": {
    "prise_electrique": {
      "avg": 47.5,      // Moyenne de 45 et 50
      "count": 16,      // 8 + 8
      "min": 45.0,      // Minimum
      "max": 50.0       // Maximum
    }
  },
  "experience_score": 10,  // 2 devis × 5 points
  "total_devis": 2,
  "total_lignes": 22
}
```

---

## 📋 **ÉTAPE 5 : VÉRIFIER L'ISOLATION RLS**

### **Actions**

1. **Se connecter avec un autre compte**
2. **Créer un devis IA**
3. **Vérifier dans Supabase** :
   ```sql
   SELECT user_id, total_devis, experience_score
   FROM ai_profiles
   ORDER BY created_at DESC;
   ```

### **Résultat attendu**

```
user_id                              | total_devis | experience_score
-------------------------------------+-------------+-----------------
1d0b1bc2-904e-4c58-94ed-95f1d8a474eb |           2 |             10
7602f512-3bfb-441f-bec1-99d4dd263c34 |           1 |              5
```

**Vérification** :
- ✅ Chaque user a son propre profil IA
- ✅ Les profils sont indépendants
- ✅ Pas de fuite de données

---

## ✅ **CHECKLIST FINALE**

- [ ] Script SQL exécuté
- [ ] Table `ai_profiles` créée
- [ ] RLS activé
- [ ] Policies créées
- [ ] App redémarrée
- [ ] Premier devis IA créé
- [ ] Profil IA créé dans Supabase
- [ ] `avg_prices` contient des données
- [ ] Deuxième devis IA créé
- [ ] Moyennes mises à jour
- [ ] Isolation RLS vérifiée

---

## 🐛 **EN CAS DE PROBLÈME**

### **Problème 1 : Table pas créée**

**Erreur** : `relation "ai_profiles" does not exist`

**Solution** :
1. Vérifier que le script SQL a bien été exécuté
2. Réexécuter le script
3. Vérifier dans Table Editor que `ai_profiles` existe

---

### **Problème 2 : Pas de logs d'apprentissage**

**Cause** : Le devis n'a pas de lignes

**Solution** :
- Utiliser un devis IA (pas manuel)
- Vérifier que le devis a des lignes dans `devis_lignes`

---

### **Problème 3 : Profil pas créé**

**Cause** : Erreur RLS ou permissions

**Solution** :
1. Vérifier que RLS est activé
2. Vérifier que les policies existent
3. Vérifier les logs : `[AILearning] Erreur ...`

---

**Tout est prêt ! Exécute le script SQL et teste !** 🚀

