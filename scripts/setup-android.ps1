# ====================================================================================
# setup-android.ps1 - Setup Android Build Environment for Expo (Windows)
# ====================================================================================
# Objectif: Vérifier/installer pré-requis, lancer prebuild, build et installer sur USB
# ====================================================================================

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

# Couleurs pour la sortie
function Write-OK { Write-Host "$args" -ForegroundColor Green }
function Write-ERROR { Write-Host "ERROR: $args" -ForegroundColor Red }
function Write-INFO { Write-Host "INFO: $args" -ForegroundColor Cyan }
function Write-WARN { Write-Host "WARN: $args" -ForegroundColor Yellow }

Write-Host "`n================================================" -ForegroundColor Magenta
Write-Host "   SETUP ANDROID BUILD - ARTISANFLOW" -ForegroundColor Magenta
Write-Host "================================================`n" -ForegroundColor Magenta

# ====================================================================================
# (A) VÉRIFIER JDK 17
# ====================================================================================

Write-INFO "Vérification JDK 17..."

try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    if ($javaVersion -match '"17\.') {
        Write-OK "JDK 17 détecté: $javaVersion"
        $javaAlreadyInstalled = $true
    } else {
        Write-WARN "JDK 17 non trouvé. Version actuelle: $javaVersion"
        $javaAlreadyInstalled = $false
    }
} catch {
    Write-WARN "Java non installé ou non dans le PATH"
    $javaAlreadyInstalled = $false
}

if (-not $javaAlreadyInstalled) {
    Write-INFO "Tentative d'installation via winget..."
    
    # Vérifier si winget est disponible
    try {
        $wingetCheck = winget --version 2>&1
        Write-OK "winget disponible: $wingetCheck"
    } catch {
        Write-ERROR "winget non disponible"
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Red
        Write-Host "  ACTION MANUELLE REQUISE - JDK 17" -ForegroundColor Red
        Write-Host "================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "1. Télécharger Eclipse Temurin JDK 17:" -ForegroundColor Yellow
        Write-Host "   https://adoptium.net/temurin/releases/?version=17" -ForegroundColor White
        Write-Host ""
        Write-Host "2. Installer avec .msi (options par défaut)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "3. OU installer winget:" -ForegroundColor Yellow
        Write-Host "   https://learn.microsoft.com/en-us/windows/package-manager/winget/" -ForegroundColor White
        Write-Host ""
        Write-Host "4. Relancer ce script après installation" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    
    Write-INFO "Installation JDK 17 via winget (cela peut prendre plusieurs minutes)..."
    try {
        winget install EclipseAdoptium.Temurin.17.JDK -e --silent --accept-package-agreements --accept-source-agreements
        Write-OK "Installation JDK 17 terminée"
        # Rafraîchir les variables d'environnement
        [System.Environment]::SetEnvironmentVariable("Path", $env:Path, "Process")
    } catch {
        Write-ERROR "Échec installation JDK 17 via winget"
        Write-Host ""
        Write-Host "Installation manuelle requise:" -ForegroundColor Red
        Write-Host "https://adoptium.net/temurin/releases/?version=17" -ForegroundColor White
        exit 1
    }
}

# Définir JAVA_HOME
Write-INFO "Configuration JAVA_HOME..."

$possibleJavaHomes = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Microsoft\jdk-17*",
    "C:\Program Files\OpenJDK\jdk-17*",
    "C:\Program Files\Java\jdk-17*"
)

$javaHome = $null
foreach ($path in $possibleJavaHomes) {
    $dirs = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue
    if ($dirs) {
        $javaHome = $dirs[0].FullName
        Write-OK "JAVA_HOME trouvé: $javaHome"
        break
    }
}

if (-not $javaHome) {
    Write-ERROR "JAVA_HOME non trouvé. Vérifiez l'installation de JDK 17"
    exit 1
}

# Définir JAVA_HOME de façon persistante (utilisateur)
$currentJavaHome = [Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
if ($currentJavaHome -ne $javaHome) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
    Write-OK "JAVA_HOME défini (utilisateur): $javaHome"
} else {
    Write-OK "JAVA_HOME déjà configuré: $javaHome"
}

# Ajouter JAVA_HOME/bin au PATH utilisateur si absent
$javaBinPath = "$javaHome\bin"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$javaBinPath*") {
    $newUserPath = "$userPath;$javaBinPath"
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-OK "Ajouté au PATH utilisateur: $javaBinPath"
}
$env:Path = "$javaBinPath;$env:Path"

# Validation finale Java
Write-INFO "Validation Java..."
$javaVersion = java -version 2>&1 | Select-String "version"
if ($javaVersion -match '"17\.') {
    Write-OK "JDK 17 validé: $javaVersion"
} else {
    Write-ERROR "Java non valide après configuration"
    exit 1
}

# ====================================================================================
# (B) VÉRIFIER ANDROID SDK
# ====================================================================================

Write-INFO "Vérification Android SDK..."

# Chercher le SDK à plusieurs emplacements possibles
$possibleSdkPaths = @(
    "C:\Users\Chris\AppData\Local\Android\Sdk",
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "C:\Program Files\Android\Sdk",
    "C:\Android\android-sdk"
)

$androidSdkRoot = $null
$sdkFound = $false

# Vérifier si adb est déjà dans le PATH (indique que le SDK existe quelque part)
try {
    $adbPath = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbPath) {
        $adbFullPath = $adbPath.Source
        Write-INFO "ADB trouvé dans PATH: $adbFullPath"
        # Extraire le chemin du SDK depuis le chemin d'ADB
        if ($adbFullPath -match "^(.*)\\platform-tools\\adb\.exe$") {
            $androidSdkRoot = $matches[1]
            Write-OK "SDK détecté via ADB: $androidSdkRoot"
            $sdkFound = $true
        }
    }
} catch {
    # ADB pas dans PATH, continuer la recherche
}

# Si pas trouvé via ADB, chercher dans les emplacements standards
if (-not $sdkFound) {
    foreach ($path in $possibleSdkPaths) {
        if (Test-Path $path) {
            $platformToolsPath = Join-Path $path "platform-tools\adb.exe"
            if (Test-Path $platformToolsPath) {
                $androidSdkRoot = $path
                $sdkFound = $true
                Write-OK "SDK trouvé: $androidSdkRoot"
                break
            }
        }
    }
}

if (-not $sdkFound) {
    Write-WARN "Android SDK non trouvé aux emplacements standards"
    Write-INFO "Tentative d'installation via winget..."
    
    try {
        $wingetCheck = winget --version 2>&1
    } catch {
        Write-ERROR "winget non disponible"
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Red
        Write-Host "  ACTION MANUELLE REQUISE - ANDROID STUDIO" -ForegroundColor Red
        Write-Host "================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "1. Télécharger Android Studio:" -ForegroundColor Yellow
        Write-Host "   https://developer.android.com/studio" -ForegroundColor White
        Write-Host ""
        Write-Host "2. Installer avec options par défaut" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "3. Ouvrir Android Studio → SDK Manager" -ForegroundColor Yellow
        Write-Host "   Installer:" -ForegroundColor Yellow
        Write-Host "   - Android SDK Platform-Tools" -ForegroundColor White
        Write-Host "   - Android SDK (API 34+)" -ForegroundColor White
        Write-Host "   - Android SDK Build-Tools (34+)" -ForegroundColor White
        Write-Host "   - Android SDK Command-line Tools (latest)" -ForegroundColor White
        Write-Host ""
        Write-Host "4. Relancer ce script après installation" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    
    Write-INFO "Installation Android Studio via winget (LONG! 30min+)..."
    try {
        winget install Google.AndroidStudio -e --silent --accept-package-agreements --accept-source-agreements
        Write-OK "Android Studio installé"
    } catch {
        Write-ERROR "Échec installation Android Studio via winget"
        Write-Host ""
        Write-Host "Installation manuelle requise:" -ForegroundColor Red
        Write-Host "https://developer.android.com/studio" -ForegroundColor White
        exit 1
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "  CONFIGURATION ANDROID STUDIO REQUISE" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Ouvrir Android Studio" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. SDK Manager (⚙️) → SDK Platform" -ForegroundColor Yellow
    Write-Host "   Installer:" -ForegroundColor Yellow
    Write-Host "   - Android 14.0 (API 34)" -ForegroundColor White
    Write-Host "   - Android SDK Build-Tools 34.0.0" -ForegroundColor White
    Write-Host ""
    Write-Host "3. SDK Manager → SDK Tools" -ForegroundColor Yellow
    Write-Host "   Cocher:" -ForegroundColor Yellow
    Write-Host "   - Android SDK Platform-Tools" -ForegroundColor White
    Write-Host "   - Android SDK Command-line Tools (latest)" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Apply → Finish → Attendre installation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. Relancer ce script:" -ForegroundColor Yellow
    Write-Host "   .\setup-android.ps1" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Vérifier que le SDK est complet
$platformToolsPath = "$androidSdkRoot\platform-tools\adb.exe"
if (-not (Test-Path $platformToolsPath)) {
    Write-ERROR "Platform-Tools manquant. Ouvrez Android Studio → SDK Manager"
    exit 1
}
Write-OK "Android SDK Platform-Tools trouvé"

# Définir ANDROID_HOME et ANDROID_SDK_ROOT de façon persistante
# Certains outils utilisent ANDROID_HOME, d'autres ANDROID_SDK_ROOT
$currentAndroidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
$currentAndroidSdkRoot = [Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "User")

if ($currentAndroidHome -ne $androidSdkRoot) {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkRoot, "User")
    Write-OK "ANDROID_HOME défini (utilisateur): $androidSdkRoot"
} else {
    Write-OK "ANDROID_HOME déjà configuré: $androidSdkRoot"
}

if ($currentAndroidSdkRoot -ne $androidSdkRoot) {
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidSdkRoot, "User")
    Write-OK "ANDROID_SDK_ROOT défini (utilisateur): $androidSdkRoot"
} else {
    Write-OK "ANDROID_SDK_ROOT déjà configuré: $androidSdkRoot"
}

# Définir dans la session courante
$env:ANDROID_HOME = $androidSdkRoot
$env:ANDROID_SDK_ROOT = $androidSdkRoot

# Ajouter platform-tools au PATH utilisateur si absent
$platformToolsDir = "$androidSdkRoot\platform-tools"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$platformToolsDir*") {
    $newUserPath = "$userPath;$platformToolsDir"
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-OK "Ajouté au PATH utilisateur: $platformToolsDir"
}
$env:Path = "$platformToolsDir;$env:Path"

# Validation finale ADB
Write-INFO "Validation ADB..."
$adbVersion = adb version 2>&1 | Select-String "version"
Write-OK "ADB validé"

# ====================================================================================
# (C) VÉRIFIER APPAREIL USB
# ====================================================================================

Write-INFO "Vérification appareil USB..."

adb kill-server 2>&1 | Out-Null
Start-Sleep -Seconds 2
adb start-server 2>&1 | Out-Null
Start-Sleep -Seconds 2

$devices = adb devices
Write-INFO "Appareils connectés:`n$devices"

$deviceFound = $false
$devices | ForEach-Object {
    if ($_ -match 'device$' -and $_ -notmatch 'List of devices') {
        $deviceFound = $true
    }
}

if (-not $deviceFound) {
    Write-ERROR "Aucun appareil Android détecté"
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  VÉRIFIER CONNEXION USB" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Vérifier que le téléphone est branché en USB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Déverrouiller le téléphone" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Options Développeur activées:" -ForegroundColor Yellow
    Write-Host "   Réglages → À propos → Appuyer 7x sur 'Numéro de build'" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Réglages → Système → Options développeur → Debogage USB ✅" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. Autoriser le débogage USB sur l'écran du téléphone" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "6. Relancer ce script:" -ForegroundColor Yellow
    Write-Host "   .\setup-android.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-OK "Appareil Android détecté et prêt"

# ====================================================================================
# (D) EXPO BUILD
# ====================================================================================

Write-INFO "Préparation build Expo..."

# npm install si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-INFO "Installation dépendances npm..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ERROR "Échec npm install"
        exit 1
    }
    Write-OK "Dépendances installées"
}

# expo-dev-client si absent
Write-INFO "Vérification expo-dev-client..."
$devClientInstalled = npm list expo-dev-client 2>&1 | Select-String "expo-dev-client@"
if (-not $devClientInstalled) {
    Write-INFO "Installation expo-dev-client..."
    npx expo install expo-dev-client
    if ($LASTEXITCODE -ne 0) {
        Write-ERROR "Échec installation expo-dev-client"
        exit 1
    }
}
Write-OK "expo-dev-client OK"

# Prebuild si nécessaire
if (-not (Test-Path "android")) {
    Write-INFO "Génération dossier android/..."
    npx expo prebuild --platform android
    if ($LASTEXITCODE -ne 0) {
        Write-ERROR "Échec prebuild"
        exit 1
    }
    Write-OK "Prebuild terminé"
} else {
    Write-OK "Dossier android/ existe déjà"
}

# Build et installation
Write-INFO "Build et installation sur appareil..."
Write-Host ""

$buildResult = $false
try {
    npx expo run:android
    if ($LASTEXITCODE -eq 0) {
        $buildResult = $true
    }
} catch {
    Write-WARN "Première tentative échouée, nettoyage Gradle..."
}

if (-not $buildResult) {
    Write-INFO "Nettoyage Gradle..."
    Push-Location android
    .\gradlew.bat clean
    if ($LASTEXITCODE -eq 0) {
        Pop-Location
        Write-INFO "Réessai du build..."
        npx expo run:android
        if ($LASTEXITCODE -ne 0) {
            $buildResult = $false
        } else {
            $buildResult = $true
        }
    } else {
        Pop-Location
        Write-ERROR "Échec clean Gradle"
    }
}

if (-not $buildResult) {
    Write-ERROR "Build échoué. Vérifiez les erreurs ci-dessus."
    exit 1
}

Write-OK "Build et installation réussis!"

# ====================================================================================
# (E) INFORMATIONS FINALES
# ====================================================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   BUILD RÉUSSI ✅" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-INFO "Emplacement de l'APK debug:"
Write-Host "  android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White

Write-INFO "Installation manuelle (si nécessaire):"
Write-Host "  adb install -r android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White

Write-Host ""
Write-WARN "Rappels:"
Write-Host "  - Si 'Sources inconnues': Autoriser l'app source" -ForegroundColor White
Write-Host "  - Si conflit signature: Désinstaller ancienne version" -ForegroundColor White
Write-Host "  - Pour debug: '$env:EXPO_DEBUG=true npx expo start'" -ForegroundColor White
Write-Host ""

exit 0

