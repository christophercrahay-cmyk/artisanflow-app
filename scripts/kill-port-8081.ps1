# =============================================
# kill-port-8081.ps1 - Libère le port 8081
# =============================================

$ErrorActionPreference = "Stop"

function info($m){ Write-Host "INFO: $m" -ForegroundColor Cyan }
function ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function err($m){ Write-Host "❌ $m" -ForegroundColor Red }
function warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }

$port = 8081

info "Recherche du processus utilisant le port $port..."
$connection = netstat -ano | findstr ":$port "
if (-not $connection) {
    ok "Le port $port est libre."
    exit 0
}

# Extraire les PIDs
$pids = $connection | ForEach-Object {
    $line = $_.Trim()
    if ($line -match "LISTENING\s+(\d+)$") {
        $matches[1]
    }
} | Sort-Object -Unique

if ($pids.Count -eq 0) {
    warn "Connexions trouvées mais aucun PID LISTENING détecté."
    exit 0
}

foreach ($processId in $pids) {
    info "PID trouvé : $processId"
    
    # Vérifier le nom du processus
    $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($proc) {
        warn "Processus : $($proc.ProcessName) ($processId)"
        
        # Libérer le port
        info "Fermeture du processus $processId..."
        taskkill /PID $processId /F | Out-Null
        Start-Sleep -Milliseconds 500
        
        ok "Processus $processId terminé."
    } else {
        warn "Le processus $processId n'existe plus."
    }
}

# Vérifier que le port est libre
info "Vérification finale..."
$check = netstat -ano | findstr ":$port "
if (-not $check) {
    ok "Le port $port est maintenant libre."
} else {
    err "Le port $port est toujours occupé."
    exit 1
}

# FIN
# =============================================

