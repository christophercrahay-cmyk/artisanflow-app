# Installation automatique de Supabase CLI via npx (local)
# Cette méthode fonctionne sans installation globale

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION SUPABASE CLI (NPX)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

Write-Host "Installation de Supabase CLI localement via npx..." -ForegroundColor Yellow
Write-Host ""

# Créer un script wrapper pour utiliser npx supabase
$wrapperScript = @"
@echo off
npx supabase %*
"@

$wrapperPath = Join-Path $projectPath "supabase.bat"
$wrapperScript | Out-File -FilePath $wrapperPath -Encoding ASCII

Write-Host "✅ Script wrapper créé : supabase.bat" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant utiliser :" -ForegroundColor Cyan
Write-Host "  .\supabase.bat --version" -ForegroundColor White
Write-Host "  .\supabase.bat login" -ForegroundColor White
Write-Host "  .\supabase.bat link --project-ref VOTRE_REF" -ForegroundColor White
Write-Host "  .\supabase.bat functions deploy ai-import-analyze" -ForegroundColor White
Write-Host ""
Write-Host "Note: La première utilisation téléchargera automatiquement Supabase CLI" -ForegroundColor Yellow
Write-Host ""

# Tester immédiatement
Write-Host "Test de l'installation..." -ForegroundColor Yellow
& $wrapperPath --version

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Installation réussie !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  L'installation va se terminer au premier usage" -ForegroundColor Yellow
    Write-Host "   Essayez: .\supabase.bat --version" -ForegroundColor Cyan
}

