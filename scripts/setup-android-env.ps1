# Script pour configurer l'environnement Android/Java
# À exécuter dans PowerShell en mode Administrateur

Write-Host "🔧 Configuration de l'environnement Android/Java" -ForegroundColor Cyan
Write-Host ""

# 1. Trouver Java
$javaPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17",
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.0",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Java\jdk-17.0.0",
    "$env:ProgramFiles\Eclipse Adoptium\jdk-17"
)

$javaHome = $null
foreach ($path in $javaPaths) {
    if (Test-Path $path) {
        $javaHome = $path
        Write-Host "✅ Java trouvé : $javaHome" -ForegroundColor Green
        break
    }
}

if (-not $javaHome) {
    Write-Host "❌ Java JDK 17 non trouvé !" -ForegroundColor Red
    Write-Host "   Installez Eclipse Adoptium JDK 17 depuis : https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}

# 2. Trouver Android SDK
$androidPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "$env:ANDROID_HOME"
)

$androidHome = $null
foreach ($path in $androidPaths) {
    if (Test-Path $path) {
        $androidHome = $path
        Write-Host "✅ Android SDK trouvé : $androidHome" -ForegroundColor Green
        break
    }
}

if (-not $androidHome) {
    Write-Host "❌ Android SDK non trouvé !" -ForegroundColor Red
    Write-Host "   Installez Android Studio depuis : https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "   Ou définissez ANDROID_HOME manuellement" -ForegroundColor Yellow
    exit 1
}

# 3. Configurer les variables d'environnement pour cette session
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:PATH = "$javaHome\bin;$androidHome\platform-tools;$androidHome\tools;$env:PATH"

Write-Host ""
Write-Host "✅ Variables configurées pour cette session :" -ForegroundColor Green
Write-Host "   JAVA_HOME = $env:JAVA_HOME"
Write-Host "   ANDROID_HOME = $env:ANDROID_HOME"
Write-Host ""

# 4. Vérifier ADB
$adbPath = "$androidHome\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✅ ADB trouvé : $adbPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  ADB non trouvé. Installez 'Android SDK Platform-Tools' dans Android Studio" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Pour rendre ces changements permanents :" -ForegroundColor Cyan
Write-Host "   1. Ouvrez 'Variables d'environnement' dans Windows" -ForegroundColor White
Write-Host "   2. Ajoutez JAVA_HOME = $javaHome" -ForegroundColor White
Write-Host "   3. Ajoutez ANDROID_HOME = $androidHome" -ForegroundColor White
Write-Host "   4. Ajoutez à PATH : $javaHome\bin" -ForegroundColor White
Write-Host "   5. Ajoutez à PATH : $androidHome\platform-tools" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Vous pouvez maintenant exécuter : npm run android:build" -ForegroundColor Green

