# Guide interactif pour déployer le système d'import GPT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT SYSTEME IMPORT GPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

# Vérifier que supabase.exe existe
if (-not (Test-Path "supabase.exe")) {
    Write-Host "❌ supabase.exe non trouve !" -ForegroundColor Red
    Write-Host "   Executez d'abord: scripts/extract-supabase.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI trouve" -ForegroundColor Green
Write-Host ""

# Étape 1: Login
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 1/5 : Connexion a Supabase" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cette commande va ouvrir votre navigateur pour vous connecter." -ForegroundColor Cyan
$response = Read-Host "Voulez-vous continuer ? (O/N)"
if ($response -eq "O" -or $response -eq "o" -or $response -eq "") {
    Write-Host ""
    Write-Host "Ouverture du navigateur..." -ForegroundColor Yellow
    & .\supabase.exe login
    Write-Host ""
    Write-Host "✅ Connexion terminee" -ForegroundColor Green
} else {
    Write-Host "Etape sautee. Vous pouvez la faire plus tard avec:" -ForegroundColor Yellow
    Write-Host "  .\supabase.exe login" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 2/5 : Lier votre projet Supabase" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour lier votre projet, vous avez besoin de votre Project Reference." -ForegroundColor Cyan
Write-Host "Trouvez-le dans Supabase Dashboard -> Settings -> API -> Project Reference" -ForegroundColor Cyan
Write-Host ""
$projectRef = Read-Host "Entrez votre Project Reference (ex: upihalivqstavxijlwaj)"
if ($projectRef) {
    Write-Host ""
    Write-Host "Liaison du projet..." -ForegroundColor Yellow
    & .\supabase.exe link --project-ref $projectRef
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Projet lie avec succes !" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur lors de la liaison" -ForegroundColor Yellow
    }
} else {
    Write-Host "Etape sautee. Vous pouvez la faire plus tard avec:" -ForegroundColor Yellow
    Write-Host "  .\supabase.exe link --project-ref VOTRE_REF" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 3/5 : Creer le bucket Storage" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cette etape doit etre faite manuellement dans Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "1. Ouvrez Supabase Dashboard -> Storage" -ForegroundColor White
Write-Host "2. Cliquez sur 'New bucket'" -ForegroundColor White
Write-Host "3. Nom: imports" -ForegroundColor White
Write-Host "4. Public bucket: DECOCHEZ (prive)" -ForegroundColor White
Write-Host "5. Cliquez sur 'Create bucket'" -ForegroundColor White
Write-Host ""
Write-Host "OU executez ce SQL dans SQL Editor:" -ForegroundColor Yellow
Write-Host "INSERT INTO storage.buckets (id, name, public)" -ForegroundColor White
Write-Host "VALUES ('imports', 'imports', false)" -ForegroundColor White
Write-Host "ON CONFLICT (id) DO NOTHING;" -ForegroundColor White
Write-Host ""
$response = Read-Host "Avez-vous cree le bucket ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Write-Host "✅ Bucket cree" -ForegroundColor Green
} else {
    Write-Host "⚠️  N'oubliez pas de creer le bucket avant de tester l'import !" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 4/5 : Configurer OpenAI API Key" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cette etape doit etre faite dans Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "1. Ouvrez Supabase Dashboard -> Edge Functions -> Secrets" -ForegroundColor White
Write-Host "2. Cliquez sur 'Add new secret'" -ForegroundColor White
Write-Host "3. Name: OPENAI_API_KEY" -ForegroundColor White
Write-Host "4. Value: Votre cle OpenAI (sk-...)" -ForegroundColor White
Write-Host "5. Cliquez sur 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "Obtenez votre cle sur: https://platform.openai.com/api-keys" -ForegroundColor Cyan
Write-Host ""
$response = Read-Host "Avez-vous configure la cle OpenAI ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Write-Host "✅ Cle OpenAI configuree" -ForegroundColor Green
} else {
    Write-Host "⚠️  N'oubliez pas de configurer la cle avant de tester l'import !" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 5/5 : Deployer les Edge Functions" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploiement des Edge Functions..." -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Deploiement de ai-import-analyze..." -ForegroundColor Cyan
& .\supabase.exe functions deploy ai-import-analyze
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ai-import-analyze deployee !" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du deploiement de ai-import-analyze" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Deploiement de ai-import-process..." -ForegroundColor Cyan
& .\supabase.exe functions deploy ai-import-process
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ai-import-process deployee !" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du deploiement de ai-import-process" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT TERMINE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "1. Testez l'import dans l'app (Settings -> Import de donnees)" -ForegroundColor Cyan
Write-Host "2. Consultez les logs dans Supabase Dashboard -> Edge Functions -> Logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Guide complet: docs/GUIDE_DEPLOIEMENT_ETAPE_PAR_ETAPE.md" -ForegroundColor Cyan
Write-Host ""

