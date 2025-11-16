# =============================================
# fix-android-env.ps1 - Configuration rapide des variables d'environnement Android SDK
# =============================================
# Objectif: Trouver le SDK Android et configurer ANDROID_HOME / ANDROID_SDK_ROOT
# =============================================

$ErrorActionPreference = "Stop"

function Write-OK { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-ERROR { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-INFO { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-WARN { Write-Host "[WARN] $args" -ForegroundColor Yellow }

Write-Host "`n================================================" -ForegroundColor Magenta
Write-Host "   CONFIGURATION ANDROID SDK ENV" -ForegroundColor Magenta
Write-Host "================================================`n" -ForegroundColor Magenta

# Chercher le SDK à plusieurs emplacements possibles
$possibleSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Users\Chris\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "C:\Program Files\Android\Sdk",
    "C:\Android\android-sdk"
)

$androidSdkRoot = $null
$sdkFound = $false

# Vérifier si adb est déjà dans le PATH
Write-INFO "Recherche du SDK Android..."
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
    Write-INFO "ADB non trouvé dans PATH, recherche dans les dossiers standards..."
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
    Write-ERROR "Android SDK non trouvé !"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Installer Android Studio:" -ForegroundColor White
    Write-Host "   https://developer.android.com/studio" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. OU lancer le script complet:" -ForegroundColor White
    Write-Host "   .\scripts\setup-android.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Vérifier que platform-tools existe
$platformToolsPath = Join-Path $androidSdkRoot "platform-tools\adb.exe"
if (-not (Test-Path $platformToolsPath)) {
    Write-ERROR "Platform-Tools manquant dans: $androidSdkRoot"
    Write-Host ""
    Write-Host "Ouvrez Android Studio → SDK Manager → SDK Tools" -ForegroundColor Yellow
    Write-Host "Cochez 'Android SDK Platform-Tools' et installez" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Configurer ANDROID_HOME
$currentAndroidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
if ($currentAndroidHome -ne $androidSdkRoot) {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkRoot, "User")
    Write-OK "ANDROID_HOME défini: $androidSdkRoot"
} else {
    Write-OK "ANDROID_HOME déjà configuré: $androidSdkRoot"
}

# Configurer ANDROID_SDK_ROOT
$currentAndroidSdkRoot = [Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "User")
if ($currentAndroidSdkRoot -ne $androidSdkRoot) {
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidSdkRoot, "User")
    Write-OK "ANDROID_SDK_ROOT défini: $androidSdkRoot"
} else {
    Write-OK "ANDROID_SDK_ROOT déjà configuré: $androidSdkRoot"
}

# Ajouter platform-tools au PATH utilisateur si absent
$platformToolsDir = Join-Path $androidSdkRoot "platform-tools"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$platformToolsDir*") {
    $newUserPath = "$userPath;$platformToolsDir"
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-OK "Ajouté au PATH: $platformToolsDir"
} else {
    Write-OK "PATH déjà configuré avec platform-tools"
}

# Définir dans la session courante
$env:ANDROID_HOME = $androidSdkRoot
$env:ANDROID_SDK_ROOT = $androidSdkRoot
$env:Path = "$platformToolsDir;$env:Path"

# Validation
Write-INFO "Validation..."
try {
    $adbVersion = adb version 2>&1 | Select-String "version"
    Write-OK "ADB fonctionne correctement"
} catch {
    Write-WARN "ADB non accessible dans cette session"
    Write-Host "Fermez et rouvrez votre terminal pour que les changements prennent effet" -ForegroundColor Yellow
}

Write-Host ""
Write-OK "Configuration terminée !"
Write-Host ""
Write-Host "Note: Fermez et rouvrez votre terminal pour que les variables" -ForegroundColor Yellow
Write-Host "      d'environnement soient disponibles dans toutes les sessions." -ForegroundColor Yellow
Write-Host ""

exit 0

