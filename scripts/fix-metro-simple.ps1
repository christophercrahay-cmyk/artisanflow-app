# Script simple pour résoudre l'erreur Metro
# Ne nécessite PAS ADB

Write-Host "🛑 Arrêt de tous les processus Metro..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { 
    $_.Path -like "*node*" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🧹 Nettoyage du cache Metro..." -ForegroundColor Cyan
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\haste-*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🚀 Démarrage de Metro en mode tunnel (fonctionne sans ADB)..." -ForegroundColor Green
Write-Host "📱 Instructions:" -ForegroundColor Yellow
Write-Host "   1. Attendez que le QR code apparaisse" -ForegroundColor White
Write-Host "   2. Dans l'app sur votre appareil, appuyez sur 'Reload'" -ForegroundColor White
Write-Host "   3. Si ça ne marche pas, scannez le QR code avec Expo Go" -ForegroundColor White
Write-Host ""

# Démarrer Metro en mode tunnel (fonctionne même sans ADB)
npx expo start --dev-client --tunnel --clear

