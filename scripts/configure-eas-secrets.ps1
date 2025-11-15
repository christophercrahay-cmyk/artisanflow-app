# ============================================
# CONFIGURATION DES SECRETS EAS
# ============================================
# Ce script configure les variables d'environnement pour EAS Build
# À exécuter UNE SEULE FOIS avant le premier build production
# ============================================

Write-Host "🔐 CONFIGURATION DES SECRETS EAS POUR ARTISANFLOW" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si EAS CLI est installé
try {
    $easVersion = eas --version
    Write-Host "✅ EAS CLI détecté : $easVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI n'est pas installé" -ForegroundColor Red
    Write-Host "📦 Installation : npm install -g eas-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Secrets à configurer :" -ForegroundColor Yellow
Write-Host "  1. EXPO_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "  2. EXPO_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  3. EXPO_PUBLIC_OPENAI_API_KEY" -ForegroundColor White
Write-Host ""

# Lire les valeurs depuis .env
if (Test-Path ".env") {
    Write-Host "✅ Fichier .env trouvé, lecture des valeurs..." -ForegroundColor Green
    
    $envContent = Get-Content .env
    
    $SUPABASE_URL = ($envContent | Select-String -Pattern "EXPO_PUBLIC_SUPABASE_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    $SUPABASE_ANON_KEY = ($envContent | Select-String -Pattern "EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    $OPENAI_API_KEY = ($envContent | Select-String -Pattern "EXPO_PUBLIC_OPENAI_API_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    
    Write-Host ""
    Write-Host "📊 Valeurs détectées :" -ForegroundColor Cyan
    Write-Host "  SUPABASE_URL: $($SUPABASE_URL.Substring(0, 30))..." -ForegroundColor White
    Write-Host "  SUPABASE_ANON_KEY: $($SUPABASE_ANON_KEY.Substring(0, 30))..." -ForegroundColor White
    Write-Host "  OPENAI_API_KEY: $($OPENAI_API_KEY.Substring(0, 20))..." -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ Fichier .env introuvable" -ForegroundColor Red
    Write-Host "📝 Créez d'abord le fichier .env avec vos clés" -ForegroundColor Yellow
    exit 1
}

# Demander confirmation
Write-Host "⚠️  Ces secrets seront stockés sur les serveurs Expo" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Continuer ? (o/n)"

if ($confirmation -ne "o" -and $confirmation -ne "O") {
    Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Configuration des secrets..." -ForegroundColor Cyan
Write-Host ""

# Configurer les secrets (un par un pour gérer les erreurs)
try {
    Write-Host "1/3 Configuration EXPO_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
    eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value $SUPABASE_URL --force
    Write-Host "  ✅ EXPO_PUBLIC_SUPABASE_URL configuré" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "  ⚠️  Erreur : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 Le secret existe peut-être déjà, continuons..." -ForegroundColor Yellow
    Write-Host ""
}

try {
    Write-Host "2/3 Configuration EXPO_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
    eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value $SUPABASE_ANON_KEY --force
    Write-Host "  ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY configuré" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "  ⚠️  Erreur : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 Le secret existe peut-être déjà, continuons..." -ForegroundColor Yellow
    Write-Host ""
}

try {
    Write-Host "3/3 Configuration EXPO_PUBLIC_OPENAI_API_KEY..." -ForegroundColor Yellow
    eas secret:create --name EXPO_PUBLIC_OPENAI_API_KEY --value $OPENAI_API_KEY --force
    Write-Host "  ✅ EXPO_PUBLIC_OPENAI_API_KEY configuré" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "  ⚠️  Erreur : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 Le secret existe peut-être déjà, continuons..." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "✅ CONFIGURATION TERMINÉE !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Vérification des secrets configurés :" -ForegroundColor Cyan
eas secret:list

Write-Host ""
Write-Host "🎉 PRÊT POUR LE BUILD PRODUCTION !" -ForegroundColor Green
Write-Host "🚀 Commande : eas build --platform android --profile production" -ForegroundColor Yellow
Write-Host ""

