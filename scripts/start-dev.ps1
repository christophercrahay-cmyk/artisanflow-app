# =============================================
# start-dev.ps1 - Démarrage Expo avec nettoyage
# =============================================

$ErrorActionPreference = "Stop"

function info($m){ Write-Host "INFO: $m" -ForegroundColor Cyan }
function ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function err($m){ Write-Host "❌ $m" -ForegroundColor Red }
function warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }

info "Démarrage d'Expo Development Server..."
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

info "Démarrage de Expo CLI..."
ok "Prêt! Le serveur Metro va démarrer."

# Lancer npm start
npm start

# FIN
# =============================================

