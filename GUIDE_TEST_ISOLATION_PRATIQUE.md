# 🧪 GUIDE DE TEST PRATIQUE - ISOLATION MULTI-TENANT

**Objectif** : Vérifier que chaque artisan voit uniquement ses propres données

---

## 📱 **PRÉPARATION**

### **1. Créer 2 comptes artisan**

**Sur l'écran de connexion** :

1. **Artisan A** :
   - Email : `artisan-a@test.com`
   - Mot de passe : `Test1234`
   - Créer le compte

2. **Artisan B** :
   - Email : `artisan-b@test.com`
   - Mot de passe : `Test1234`
   - Créer le compte

---

## ✅ **TEST 1 : ISOLATION DES CLIENTS**

### **Avec Artisan A**

1. Se connecter avec `artisan-a@test.com`
2. Aller sur "Clients"
3. Créer 3 clients :
   - Nom : "Client A1", Adresse : "1 rue A"
   - Nom : "Client A2", Adresse : "2 rue A"
   - Nom : "Client A3", Adresse : "3 rue A"
4. **Vérifier** : On voit 3 clients

### **Avec Artisan B**

1. Se déconnecter
2. Se connecter avec `artisan-b@test.com`
3. Aller sur "Clients"
4. Créer 2 clients :
   - Nom : "Client B1", Adresse : "1 rue B"
   - Nom : "Client B2", Adresse : "2 rue B"
5. **Vérifier** : On voit **UNIQUEMENT** 2 clients (B1, B2)
6. **Vérifier** : On ne voit **PAS** les clients A1, A2, A3

### **Résultat attendu**

✅ Artisan A voit : 3 clients (A1, A2, A3)  
✅ Artisan B voit : 2 clients (B1, B2)  
✅ Aucun mélange de données

---

## ✅ **TEST 2 : ISOLATION DES CHANTIERS**

### **Avec Artisan A**

1. Se connecter avec `artisan-a@test.com`
2. Aller sur "Chantiers"
3. Créer 2 chantiers :
   - Client : "Client A1", Nom : "Chantier A1", Adresse : "Adresse A1"
   - Client : "Client A2", Nom : "Chantier A2", Adresse : "Adresse A2"
4. **Vérifier** : On voit 2 chantiers

### **Avec Artisan B**

1. Se déconnecter
2. Se connecter avec `artisan-b@test.com`
3. Aller sur "Chantiers"
4. Créer 1 chantier :
   - Client : "Client B1", Nom : "Chantier B1", Adresse : "Adresse B1"
5. **Vérifier** : On voit **UNIQUEMENT** 1 chantier (B1)
6. **Vérifier** : On ne voit **PAS** les chantiers A1, A2

### **Résultat attendu**

✅ Artisan A voit : 2 chantiers (A1, A2)  
✅ Artisan B voit : 1 chantier (B1)  
✅ Aucun mélange de données

---

## ✅ **TEST 3 : ISOLATION DES NOTES VOCALES**

### **Avec Artisan A**

1. Se connecter avec `artisan-a@test.com`
2. Ouvrir "Chantier A1"
3. Enregistrer 3 notes vocales :
   - "Note vocale A1"
   - "Note vocale A2"
   - "Note vocale A3"
4. **Vérifier** : On voit 3 notes vocales

### **Avec Artisan B**

1. Se déconnecter
2. Se connecter avec `artisan-b@test.com`
3. Ouvrir "Chantier B1"
4. Enregistrer 1 note vocale :
   - "Note vocale B1"
5. **Vérifier** : On voit **UNIQUEMENT** 1 note vocale (B1)
6. **Vérifier** : On ne voit **PAS** les notes A1, A2, A3

### **Résultat attendu**

✅ Artisan A voit : 3 notes vocales (A1, A2, A3) sur Chantier A1  
✅ Artisan B voit : 1 note vocale (B1) sur Chantier B1  
✅ Aucun mélange de données

---

## ✅ **TEST 4 : ISOLATION DES PHOTOS**

### **Avec Artisan A**

1. Se connecter avec `artisan-a@test.com`
2. Ouvrir "Chantier A1"
3. Prendre 2 photos
4. **Vérifier** : On voit 2 photos

### **Avec Artisan B**

1. Se déconnecter
2. Se connecter avec `artisan-b@test.com`
3. Ouvrir "Chantier B1"
4. Prendre 1 photo
5. **Vérifier** : On voit **UNIQUEMENT** 1 photo
6. **Vérifier** : On ne voit **PAS** les photos d'Artisan A

### **Résultat attendu**

✅ Artisan A voit : 2 photos sur Chantier A1  
✅ Artisan B voit : 1 photo sur Chantier B1  
✅ Aucun mélange de données

---

## ✅ **TEST 5 : ISOLATION DES DEVIS**

### **Avec Artisan A**

1. Se connecter avec `artisan-a@test.com`
2. Ouvrir "Chantier A1"
3. Créer 2 devis :
   - Devis manuel : "Devis A1"
   - Devis IA : Générer depuis les notes
4. Aller sur "Documents"
5. **Vérifier** : On voit 2 devis

### **Avec Artisan B**

1. Se déconnecter
2. Se connecter avec `artisan-b@test.com`
3. Ouvrir "Chantier B1"
4. Créer 1 devis :
   - Devis manuel : "Devis B1"
5. Aller sur "Documents"
6. **Vérifier** : On voit **UNIQUEMENT** 1 devis (B1)
7. **Vérifier** : On ne voit **PAS** les devis A1, A2

### **Résultat attendu**

✅ Artisan A voit : 2 devis (A1, A2) sur Documents  
✅ Artisan B voit : 1 devis (B1) sur Documents  
✅ Aucun mélange de données

---

## ✅ **TEST 6 : ISOLATION DES PROFILS IA**

### **Avec Artisan A**

1. Se connecter avec `artisan-a@test.com`
2. Créer 5 devis avec des lignes variées :
   - "Prise électrique" : 45€
   - "Interrupteur" : 30€
   - "Tableau électrique" : 650€
3. Générer un nouveau devis IA
4. **Vérifier** : Les prix sont colorisés selon les moyennes d'Artisan A

### **Avec Artisan B**

1. Se déconnecter
2. Se connecter avec `artisan-b@test.com`
3. Créer 2 devis avec des lignes différentes :
   - "Prise électrique" : 50€
   - "Interrupteur" : 35€
4. Générer un nouveau devis IA
5. **Vérifier** : Les prix sont colorisés selon les moyennes d'Artisan B
6. **Vérifier** : Les moyennes sont **différentes** de celles d'Artisan A

### **Résultat attendu**

✅ Artisan A a son propre profil IA (moyenne prise : 45€)  
✅ Artisan B a son propre profil IA (moyenne prise : 50€)  
✅ Les profils sont indépendants

---

## 🔍 **TEST 7 : VÉRIFICATION SQL (AVANCÉ)**

### **Prérequis**

- Accès à Supabase SQL Editor
- Connaître les UUID des 2 artisans

### **Étapes**

1. Aller sur Supabase → SQL Editor
2. Récupérer les UUID des artisans :
   ```sql
   SELECT id, email FROM auth.users 
   WHERE email IN ('artisan-a@test.com', 'artisan-b@test.com');
   ```

3. **Test 1 : Vérifier les clients**
   ```sql
   -- Se connecter avec Artisan A (via Dashboard)
   SELECT * FROM clients;
   -- Résultat attendu : 3 clients (A1, A2, A3)

   -- Se connecter avec Artisan B
   SELECT * FROM clients;
   -- Résultat attendu : 2 clients (B1, B2)
   ```

4. **Test 2 : Tenter d'accéder aux données d'un autre artisan**
   ```sql
   -- Se connecter avec Artisan B
   -- Essayer d'accéder aux clients d'Artisan A
   SELECT * FROM clients WHERE user_id = '<uuid_artisan_a>';
   -- Résultat attendu : 0 lignes (RLS bloque)
   ```

5. **Test 3 : Tenter d'insérer pour un autre artisan**
   ```sql
   -- Se connecter avec Artisan B
   -- Essayer d'insérer un client pour Artisan A
   INSERT INTO clients (user_id, name, address) 
   VALUES ('<uuid_artisan_a>', 'Client pirate', 'Adresse pirate');
   -- Résultat attendu : ERREUR (RLS bloque)
   ```

### **Résultat attendu**

✅ Chaque artisan voit uniquement ses propres données  
✅ RLS bloque toutes les tentatives d'accès croisé  
✅ Impossible d'insérer des données pour un autre artisan

---

## 📊 **CHECKLIST FINALE**

Cocher chaque test réussi :

- [ ] **Test 1** : Isolation des clients ✅
- [ ] **Test 2** : Isolation des chantiers ✅
- [ ] **Test 3** : Isolation des notes vocales ✅
- [ ] **Test 4** : Isolation des photos ✅
- [ ] **Test 5** : Isolation des devis ✅
- [ ] **Test 6** : Isolation des profils IA ✅
- [ ] **Test 7** : Vérification SQL (optionnel) ✅

---

## ✅ **CONCLUSION**

Si **tous les tests sont verts** :

🏆 **L'isolation multi-tenant est PARFAITE**

Chaque artisan voit uniquement ses propres données, et il n'y a aucune fuite possible.

---

**Guide créé le** : 9 novembre 2025  
**Temps estimé** : 15-20 minutes pour tous les tests

