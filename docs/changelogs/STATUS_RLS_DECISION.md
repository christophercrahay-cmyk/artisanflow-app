# 🎯 DÉCISION RLS - ArtisanFlow

**Date** : 2024  
**Décision** : **GARDER RLS DÉSACTIVÉ pour MVP**

---

## ✅ DÉCISION

**RLS restera désactivé pendant le MVP.**

### Pourquoi ?

1. **Simplicité** : MVP = rapidité > sécurité
2. **Single user** : Un seul artisan pour l'instant
3. **Équipe limitée** : Accès contrôlé
4. **Quick iteration** : Pas de blockages
5. **Focus fonctionnalités** : IA, Capture, PDF prioritaires

---

## 📋 PHASES

### Phase MVP (Maintenant)
- ❌ RLS désactivé
- ❌ Aucune auth
- ✅ Erreurs linter acceptées
- ✅ Développement rapide

### Phase Beta (Plus tard)
- ⚠️ RLS activé
- ⚠️ Auth simple
- ⚠️ Single user sécurisé

### Phase Production (Futur)
- ✅ RLS activé
- ✅ Auth multi-users
- ✅ Isolation données
- ✅ Audit sécurité

---

## 🚨 ACCEPTANCE DES RISQUES

### Risques acceptés
- Données accessibles publiquement
- Pas de gestion utilisateurs
- Non conforme production

### Mitigations
- Accès limité à l'équipe
- Single user uniquement
- Backup réguliers
- Pas de données sensibles

---

## 📁 FICHIERS

- `FIX_RLS_SECURITY.sql` : Script pour activer RLS quand prêt
- `RLS_AVERTISSEMENT_MVP.md` : Guide complet RLS
- `STATUS_RLS_DECISION.md` : Ce fichier

---

## ✅ NEXT STEPS

1. ✅ Continuer développement MVP
2. ✅ Tester fonctionnalités core
3. ⏸️ Ignorer erreurs linter RLS
4. 🔜 Implémenter Auth avant production

**Prêt pour tests terrain** : OUI 🚀

