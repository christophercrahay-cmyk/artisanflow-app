# =============================================
# install-artisanflow.ps1 - Installation APK Expo
# =============================================

$ErrorActionPreference = "Stop"

function info($m){ Write-Host "INFO: $m" -ForegroundColor Cyan }
function ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function err($m){ Write-Host "❌ $m" -ForegroundColor Red }

# 1) Chemin ADB
$adb = "C:\Users\Chris\Downloads\platform-tools\adb.exe"
if (-not (Test-Path $adb)) { err "ADB introuvable à $adb"; exit 1 }

# 2) Téléchargement de l'APK dans un dossier fixe
$apkPath = "C:\Android\ArtisanFlow-preview.apk"
New-Item -ItemType Directory -Force "C:\Android" | Out-Null
info "Téléchargement de l'APK depuis Expo..."
Invoke-WebRequest -Uri "https://expo.dev/artifacts/eas/8nyMFpxcy89PWHM6fi8uSe.apk" -OutFile $apkPath
ok "APK téléchargé : $apkPath"

# 3) Vérification du téléphone
info "Vérification de l'appareil connecté..."
& $adb start-server
$devices = & $adb devices | Select-String "device$" | ForEach-Object { $_.ToString().Split("`t")[0] }
if ($devices.Count -eq 0) { err "Aucun appareil détecté. Vérifie le câble USB et le débogage."; exit 1 }
ok "Appareil détecté : $($devices -join ', ')"

# 4) Installation
info "Installation de l'APK ArtisanFlow sur le téléphone..."
& $adb -d install -r $apkPath
ok "Installation terminée. Vérifie sur ton téléphone : l'app 'ArtisanFlow' est maintenant installée."

# FIN
# =============================================

