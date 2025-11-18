# Script pour rebuild l'app Android en mode development
# Utilise EAS Build (recommandé) ou expo run:android

Write-Host "🔨 REBUILD Android en mode Development" -ForegroundColor Cyan
Write-Host ""

# Vérifier si EAS CLI est installé
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if ($easInstalled) {
    Write-Host "✅ EAS CLI détecté - Utilisation d'EAS Build (recommandé)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Build avec EAS (nécessite un compte Expo gratuit)..." -ForegroundColor Yellow
    Write-Host "   Cela va créer un APK development build" -ForegroundColor White
    Write-Host ""
    
    # Demander confirmation
    $confirm = Read-Host "Continuer avec EAS Build ? (O/N)"
    if ($confirm -eq "O" -or $confirm -eq "o" -or $confirm -eq "Y" -or $confirm -eq "y") {
        Write-Host ""
        Write-Host "🚀 Lancement du build..." -ForegroundColor Green
        eas build --platform android --profile development --local
    } else {
        Write-Host "❌ Annulé" -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "⚠️  EAS CLI non installé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 : Installer EAS CLI (recommandé)" -ForegroundColor Cyan
    Write-Host "   npm install -g eas-cli" -ForegroundColor White
    Write-Host "   Puis : eas build --platform android --profile development --local" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2 : Utiliser expo run:android (nécessite Android Studio configuré)" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Choisir (1 pour EAS, 2 pour expo run:android)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "📦 Installation d'EAS CLI..." -ForegroundColor Yellow
        npm install -g eas-cli
        
        Write-Host ""
        Write-Host "🔐 Connexion à Expo (nécessite un compte gratuit)..." -ForegroundColor Yellow
        eas login
        
        Write-Host ""
        Write-Host "🚀 Lancement du build..." -ForegroundColor Green
        eas build --platform android --profile development --local
    } elseif ($choice -eq "2") {
        Write-Host ""
        Write-Host "⚠️  Vérification de l'environnement Android..." -ForegroundColor Yellow
        
        # Vérifier JAVA_HOME
        if (-not $env:JAVA_HOME) {
            Write-Host "❌ JAVA_HOME non configuré !" -ForegroundColor Red
            Write-Host "   Consultez GUIDE_REBUILD_ANDROID.md" -ForegroundColor Yellow
            exit 1
        }
        
        # Vérifier ANDROID_HOME
        if (-not $env:ANDROID_HOME) {
            Write-Host "❌ ANDROID_HOME non configuré !" -ForegroundColor Red
            Write-Host "   Consultez GUIDE_REBUILD_ANDROID.md" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "✅ Environnement OK" -ForegroundColor Green
        Write-Host ""
        Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
        npm run android:clean
        
        Write-Host ""
        Write-Host "🚀 Build..." -ForegroundColor Green
        npx expo run:android
    } else {
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

