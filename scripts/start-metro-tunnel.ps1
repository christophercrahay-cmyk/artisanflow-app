# Script PowerShell pour démarrer Metro en mode tunnel
# Utile quand l'appareil n'est pas sur le même réseau Wi-Fi

Write-Host "🔄 Arrêt des processus Metro existants..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" -or $_.CommandLine -like "*metro*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Attendre un peu
Start-Sleep -Seconds 2

Write-Host "🚀 Démarrage de Metro en mode tunnel..." -ForegroundColor Green
Write-Host "📱 Scannez le QR code avec votre appareil ou utilisez l'URL affichée" -ForegroundColor Cyan
Write-Host ""

npx expo start --dev-client --tunnel --clear

