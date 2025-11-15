# Script d'aide pour installer Supabase CLI sur Windows
# Usage: powershell -ExecutionPolicy Bypass -File scripts/install-supabase-cli.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION SUPABASE CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Supabase CLI ne peut pas etre installe via npm sur Windows." -ForegroundColor Yellow
Write-Host ""
Write-Host "METHODE RECOMMANDEE : Telechargement direct" -ForegroundColor Green
Write-Host ""
Write-Host "1. Ouvrez votre navigateur et allez sur :" -ForegroundColor Cyan
Write-Host "   https://github.com/supabase/cli/releases/latest" -ForegroundColor White
Write-Host ""
Write-Host "2. Telechargez : supabase_windows_amd64.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Extrayez le ZIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Copiez supabase.exe dans :" -ForegroundColor Cyan
Write-Host "   C:\Program Files\Supabase\" -ForegroundColor White
Write-Host ""
Write-Host "5. Ajoutez ce dossier au PATH Windows :" -ForegroundColor Cyan
Write-Host "   - Windows + R -> sysdm.cpl" -ForegroundColor White
Write-Host "   - Avance -> Variables d'environnement" -ForegroundColor White
Write-Host "   - Path -> Modifier -> Nouveau" -ForegroundColor White
Write-Host "   - Ajoutez: C:\Program Files\Supabase\" -ForegroundColor White
Write-Host ""
Write-Host "6. Fermez et rouvrez PowerShell" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU (plus simple pour tester) :" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copiez supabase.exe dans le dossier du projet :" -ForegroundColor Cyan
Write-Host "C:\Users\Chris\Desktop\MVP_Artisan\artisanflow\" -ForegroundColor White
Write-Host ""
Write-Host "Puis utilisez : .\supabase.exe --version" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Guide complet : docs/INSTALLATION_SUPABASE_CLI_WINDOWS.md" -ForegroundColor Cyan
Write-Host ""

# Vérifier si supabase.exe existe déjà dans le dossier du projet
$projectPath = Split-Path -Parent $PSScriptRoot
$supabaseExe = Join-Path $projectPath "supabase.exe"

if (Test-Path $supabaseExe) {
    Write-Host "✅ supabase.exe trouve dans le dossier du projet !" -ForegroundColor Green
    Write-Host "   Vous pouvez utiliser : .\supabase.exe --version" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  supabase.exe non trouve dans le dossier du projet" -ForegroundColor Yellow
    Write-Host "   Suivez les instructions ci-dessus pour le telecharger" -ForegroundColor Yellow
}

Write-Host ""

