# 🚀 LANCER LE BUILD ANDROID - QUICK START

## ⚡ Commande unique

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-android.ps1
```

**C'est tout !** Le script fait le reste automatiquement.

---

## 📋 Ce que le script fait

✅ **Vérifie JDK 17** → Installe si nécessaire  
✅ **Vérifie Android SDK** → Installe si nécessaire  
✅ **Configure JAVA_HOME** → Automatique  
✅ **Configure ANDROID_SDK_ROOT** → Automatique  
✅ **Vérifie appareil USB** → Guide si problème  
✅ **Lance prebuild** → Génère dossier android/  
✅ **Build l'APK** → Compile Gradle  
✅ **Installe sur téléphone** → Via adb  

---

## 🔧 Alternative rapide (si tout déjà installé)

```powershell
npm run android:build
```

---

## ❓ Que faire si ça plante ?

### Erreur JDK
→ Voir `README-android-setup.md` section "JDK 17"

### Erreur SDK
→ Voir `README-android-setup.md` section "Android SDK"

### Erreur USB
→ Vérifier débogage USB sur téléphone

### Erreur Gradle
→ `npm run android:clean` puis relancer

---

## 📖 Documentation complète

**Lire** : `README-android-setup.md` (guide complet)  
**Script** : `setup-android.ps1` (automatique)

---

**Prêt ? Lance la commande ci-dessus !** 🎉

