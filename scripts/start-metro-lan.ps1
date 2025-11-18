# Script PowerShell pour démarrer Metro en mode LAN
# Utile quand l'appareil est sur le même réseau Wi-Fi

Write-Host "🔄 Arrêt des processus Metro existants..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" -or $_.CommandLine -like "*metro*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Attendre un peu
Start-Sleep -Seconds 2

Write-Host "🚀 Démarrage de Metro en mode LAN..." -ForegroundColor Green
Write-Host "📱 Assurez-vous que votre appareil est sur le même réseau Wi-Fi" -ForegroundColor Cyan
Write-Host ""

npx expo start --dev-client --lan --clear

