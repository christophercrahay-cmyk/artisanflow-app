# Script de vérification du déploiement du système d'import GPT
# Usage: powershell -ExecutionPolicy Bypass -File scripts/verifier-deploiement-import.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION DEPLOIEMENT IMPORT GPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$erreurs = 0
$warnings = 0

# 1. Vérifier Supabase CLI
Write-Host "[1/6] Vérification Supabase CLI..." -ForegroundColor Yellow
try {
    $version = supabase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Supabase CLI installé : $version" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Supabase CLI non installé" -ForegroundColor Red
        Write-Host "     → Installez avec: npm install -g supabase" -ForegroundColor Yellow
        $erreurs++
    }
} catch {
    Write-Host "  ❌ Supabase CLI non trouvé" -ForegroundColor Red
    Write-Host "     → Installez avec: npm install -g supabase" -ForegroundColor Yellow
    $erreurs++
}

# 2. Vérifier les Edge Functions locales
Write-Host ""
Write-Host "[2/6] Vérification Edge Functions locales..." -ForegroundColor Yellow
$functions = @("ai-import-analyze", "ai-import-process")
foreach ($func in $functions) {
    $path = "supabase\functions\$func\index.ts"
    if (Test-Path $path) {
        Write-Host "  ✅ $func trouvé" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $func non trouvé ($path)" -ForegroundColor Red
        $erreurs++
    }
}

# 3. Vérifier le bucket Storage (via instructions)
Write-Host ""
Write-Host "[3/6] Vérification bucket Storage..." -ForegroundColor Yellow
Write-Host "  ⚠️  Vérification manuelle requise" -ForegroundColor Yellow
Write-Host "     → Ouvrez Supabase Dashboard → Storage" -ForegroundColor Cyan
Write-Host "     → Vérifiez que le bucket 'imports' existe" -ForegroundColor Cyan
Write-Host "     → Si absent, créez-le (nom: imports, privé)" -ForegroundColor Cyan
$warnings++

# 4. Vérifier OpenAI API Key (via instructions)
Write-Host ""
Write-Host "[4/6] Vérification OpenAI API Key..." -ForegroundColor Yellow
Write-Host "  ⚠️  Vérification manuelle requise" -ForegroundColor Yellow
Write-Host "     → Ouvrez Supabase Dashboard → Edge Functions → Secrets" -ForegroundColor Cyan
Write-Host "     → Vérifiez que 'OPENAI_API_KEY' existe" -ForegroundColor Cyan
Write-Host "     → Si absent, ajoutez-le avec votre clé OpenAI" -ForegroundColor Cyan
$warnings++

# 5. Vérifier la connexion Supabase
Write-Host ""
Write-Host "[5/6] Vérification connexion Supabase..." -ForegroundColor Yellow
try {
    $status = supabase status 2>&1
    if ($LASTEXITCODE -eq 0 -or $status -match "linked") {
        Write-Host "  ✅ Projet Supabase lié" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Projet non lié ou erreur" -ForegroundColor Yellow
        Write-Host "     → Exécutez: supabase link --project-ref VOTRE_REF" -ForegroundColor Cyan
        $warnings++
    }
} catch {
    Write-Host "  ⚠️  Impossible de vérifier la connexion" -ForegroundColor Yellow
    $warnings++
}

# 6. Vérifier les Edge Functions déployées (via instructions)
Write-Host ""
Write-Host "[6/6] Vérification Edge Functions déployées..." -ForegroundColor Yellow
Write-Host "  ⚠️  Vérification manuelle requise" -ForegroundColor Yellow
Write-Host "     → Ouvrez Supabase Dashboard → Edge Functions" -ForegroundColor Cyan
Write-Host "     → Vérifiez que 'ai-import-analyze' existe" -ForegroundColor Cyan
Write-Host "     → Vérifiez que 'ai-import-process' existe" -ForegroundColor Cyan
Write-Host "     → Si absentes, déployez avec:" -ForegroundColor Cyan
Write-Host "       supabase functions deploy ai-import-analyze" -ForegroundColor White
Write-Host "       supabase functions deploy ai-import-process" -ForegroundColor White
$warnings++

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($erreurs -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ Tout est prêt !" -ForegroundColor Green
} elseif ($erreurs -eq 0) {
    Write-Host "⚠️  $warnings vérification(s) manuelle(s) requise(s)" -ForegroundColor Yellow
    Write-Host "   Consultez le guide: docs/GUIDE_DEPLOIEMENT_ETAPE_PAR_ETAPE.md" -ForegroundColor Cyan
} else {
    Write-Host "❌ $erreurs erreur(s) détectée(s)" -ForegroundColor Red
    Write-Host "   Corrigez les erreurs ci-dessus avant de continuer" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Guide complet: docs/GUIDE_DEPLOIEMENT_ETAPE_PAR_ETAPE.md" -ForegroundColor Cyan
Write-Host ""

