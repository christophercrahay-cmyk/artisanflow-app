# =============================================
# start-expo-go.ps1 - Démarrage Expo en mode Expo Go (sans dev-client)
# =============================================
# ATTENTION: Certaines fonctionnalités ne fonctionneront pas (Whisper.rn, etc.)
# =============================================

$ErrorActionPreference = "Stop"

function info($m){ Write-Host "INFO: $m" -ForegroundColor Cyan }
function ok($m){ Write-Host "[OK] $m" -ForegroundColor Green }
function warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }

info "Démarrage d'Expo en mode Expo Go (tunnel)..."

warn "ATTENTION: Mode Expo Go - Limitations:"
Write-Host "  - Whisper.rn (transcription vocale) ne fonctionnera PAS" -ForegroundColor Yellow
Write-Host "  - Certains modules natifs peuvent ne pas fonctionner" -ForegroundColor Yellow
Write-Host "  - Pour toutes les fonctionnalités, utilisez un build natif" -ForegroundColor Yellow
Write-Host ""

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

info "Démarrage de Expo CLI en mode Expo Go (tunnel)..."
ok "Prêt! Scannez le QR code avec l'app Expo Go sur votre téléphone."

# Lancer expo start en mode Expo Go (sans --dev-client)
npx expo start --tunnel --clear

# FIN
# =============================================

