# =============================================
# start-tunnel.ps1 - Démarrage Expo en mode tunnel avec nettoyage
# =============================================

$ErrorActionPreference = "Stop"

function info($m){ Write-Host "INFO: $m" -ForegroundColor Cyan }
function ok($m){ Write-Host "[OK] $m" -ForegroundColor Green }
function err($m){ Write-Host "[ERROR] $m" -ForegroundColor Red }
function warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }

info "Démarrage d'Expo Development Server en mode tunnel..."

# Vérification rapide Android SDK (optionnel, juste pour info)
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    warn "ANDROID_HOME/ANDROID_SDK_ROOT non configurés"
    warn "Si vous avez besoin d'Android, lancez: .\scripts\fix-android-env.ps1"
} else {
    $sdkPath = $env:ANDROID_HOME
    if (-not $sdkPath) {
        $sdkPath = $env:ANDROID_SDK_ROOT
    }
    ok "Android SDK configuré: $sdkPath"
}

info "Nettoyage du port 8081..."

# Libérer le port 8081
$connection = netstat -ano | findstr ":8081 "
if ($connection) {
    $pids = $connection | ForEach-Object {
        $line = $_.Trim()
        if ($line -match "LISTENING\s+(\d+)$") {
            $matches[1]
        }
    } | Sort-Object -Unique
    
    foreach ($processId in $pids) {
        $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($proc) {
            warn "Fermeture de $($proc.ProcessName) (PID $processId)..."
            taskkill /PID $processId /F | Out-Null
            Start-Sleep -Milliseconds 500
        }
    }
    ok "Port 8081 libéré."
} else {
    ok "Port 8081 déjà libre."
}

info "Démarrage de Expo CLI en mode tunnel..."
ok "Prêt! Le serveur Metro va démarrer avec tunnel."

# Lancer expo start en mode tunnel
npx expo start --dev-client --tunnel --clear

# FIN
# =============================================
