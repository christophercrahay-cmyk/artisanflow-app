# 🔧 Installation Supabase CLI sur Windows

## ⚠️ Problème

Supabase CLI ne peut pas être installé via `npm install -g` sur Windows. Il faut utiliser une autre méthode.

---

## ✅ Solution 1 : Téléchargement direct (RECOMMANDÉ - 5 min)

### Étape 1 : Télécharger Supabase CLI

1. Allez sur : https://github.com/supabase/cli/releases/latest
2. Téléchargez le fichier **`supabase_windows_amd64.zip`** (ou `supabase_windows_arm64.zip` si vous avez un processeur ARM)
3. **Extrayez** le fichier ZIP
4. Vous devriez avoir un fichier `supabase.exe`

### Étape 2 : Ajouter au PATH

**Option A : Ajouter au PATH système (recommandé)**

1. Copiez `supabase.exe` dans un dossier permanent, par exemple :
   ```
   C:\Program Files\Supabase\
   ```

2. Ajoutez ce dossier au PATH :
   - Appuyez sur `Windows + R`
   - Tapez `sysdm.cpl` et Entrée
   - Onglet **Avancé** → **Variables d'environnement**
   - Dans **Variables système**, trouvez `Path` → **Modifier**
   - Cliquez sur **Nouveau**
   - Ajoutez : `C:\Program Files\Supabase\`
   - Cliquez sur **OK** partout

3. **Fermez et rouvrez PowerShell** pour que les changements prennent effet

**Option B : Utiliser directement (plus simple pour tester)**

1. Copiez `supabase.exe` dans le dossier de votre projet :
   ```
   C:\Users\Chris\Desktop\MVP_Artisan\artisanflow\
   ```

2. Utilisez-le avec le chemin complet :
   ```powershell
   .\supabase.exe --version
   ```

### Étape 3 : Vérifier l'installation

Ouvrez un **nouveau PowerShell** et tapez :

```powershell
supabase --version
```

Vous devriez voir : `supabase version X.X.X` ✅

---

## ✅ Solution 2 : Via Scoop (si vous l'installez)

### Installer Scoop d'abord

Ouvrez PowerShell en **administrateur** et tapez :

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

Puis installez Supabase CLI :

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

## ✅ Solution 3 : Via Chocolatey (si vous l'avez)

```powershell
choco install supabase
```

---

## 🧪 Test rapide

Une fois installé, testez :

```powershell
supabase --version
supabase login
```

---

## 📝 Prochaines étapes

Une fois Supabase CLI installé, suivez le guide :
- `docs/GUIDE_DEPLOIEMENT_ETAPE_PAR_ETAPE.md`

---

## 🐛 Dépannage

### "supabase n'est pas reconnu"

→ Vérifiez que le dossier contenant `supabase.exe` est dans votre PATH  
→ Fermez et rouvrez PowerShell  
→ Ou utilisez le chemin complet : `.\supabase.exe` (si dans le dossier du projet)

### Erreur de permissions

→ Exécutez PowerShell en **administrateur**

---

**Recommandation** : Utilisez la **Solution 1** (téléchargement direct), c'est la plus rapide et la plus fiable ! 🚀

