# Script pour configurer Supabase CLI après téléchargement manuel
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-supabase-cli.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION SUPABASE CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

Write-Host "INSTRUCTIONS POUR TELECHARGER SUPABASE CLI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ouvrez votre navigateur" -ForegroundColor Cyan
Write-Host "2. Allez sur: https://github.com/supabase/cli/releases" -ForegroundColor White
Write-Host "3. Cliquez sur la derniere version (ex: v1.223.0)" -ForegroundColor White
Write-Host "4. Telechargez: supabase_windows_amd64.zip" -ForegroundColor White
Write-Host "5. Extrayez le ZIP" -ForegroundColor White
Write-Host "6. Copiez supabase.exe dans ce dossier:" -ForegroundColor White
Write-Host "   $projectPath" -ForegroundColor Green
Write-Host ""
Write-Host "OU utilisez cette commande PowerShell (depuis le dossier ou vous avez extrait le ZIP):" -ForegroundColor Yellow
Write-Host "   Copy-Item supabase.exe '$projectPath\'" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si supabase.exe existe déjà
$supabaseExe = Join-Path $projectPath "supabase.exe"

if (Test-Path $supabaseExe) {
    Write-Host "✅ supabase.exe trouve dans le dossier du projet !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test de l'installation..." -ForegroundColor Yellow
    & $supabaseExe --version
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Supabase CLI est pret a etre utilise !" -ForegroundColor Green
        Write-Host ""
        Write-Host "Commandes disponibles:" -ForegroundColor Cyan
        Write-Host "  .\supabase.exe --version" -ForegroundColor White
        Write-Host "  .\supabase.exe login" -ForegroundColor White
        Write-Host "  .\supabase.exe link --project-ref VOTRE_REF" -ForegroundColor White
        Write-Host "  .\supabase.exe functions deploy ai-import-analyze" -ForegroundColor White
        Write-Host "  .\supabase.exe functions deploy ai-import-process" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  supabase.exe non trouve" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Apres avoir copie supabase.exe dans le dossier du projet," -ForegroundColor Cyan
    Write-Host "relancez ce script pour verifier l'installation." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OU testez directement:" -ForegroundColor Yellow
    Write-Host "  .\supabase.exe --version" -ForegroundColor White
}

Write-Host ""

