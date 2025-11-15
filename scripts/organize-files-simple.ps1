# Script de réorganisation - Version simple sans emojis

Write-Host "Reorganisation des fichiers..." -ForegroundColor Cyan

# SQL files
Write-Host "`nDeplacement des fichiers SQL..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.sql" -File | ForEach-Object {
    if ($_.Name -ne "INIT_SUPABASE.sql") {
        Move-Item -Path $_.FullName -Destination "docs\sql\" -Force -ErrorAction SilentlyContinue
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

# Changelogs
Write-Host "`nDeplacement des changelogs..." -ForegroundColor Yellow
$changelogPatterns = @("*CHANGELOG*", "*FIX_*", "*FIXES_*", "*BUGS_*", "*STATUS_*", "*RESUME_*", "*RECAP_*", "*BUILD_*", "*AMELIORATIONS_*", "*IMPLEMENTATION_*", "*INSTALLATION_*", "*INTEGRATION_*", "*TRANSFORMATION_*", "*SUMMARY_*")
foreach ($pattern in $changelogPatterns) {
    Get-ChildItem -Path "." -Filter $pattern -File | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "docs\changelogs\" -Force -ErrorAction SilentlyContinue
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

# Guides
Write-Host "`nDeplacement des guides..." -ForegroundColor Yellow
$guidePatterns = @("*GUIDE_*", "*INSTRUCTIONS_*", "*ACTION_*", "*ACTIONS_*", "*AUDIT_*", "*BILAN_*", "*CHECKLIST_*", "*COMMANDES_*", "*DEBUG_*", "*EST_CE_*", "*LANCE_*", "*LIENS_*", "*MVP_*", "*ORDRE_*", "*PROBLEMES_*", "*PROCHAINES_*", "*QUICK_*", "*RAPPORT_*", "*README-*", "*RLS_*", "*SETUP_*", "*SOLUTION_*", "*STORE_*", "*SUPABASE_*", "*SYSTEME_*", "*TEST_*", "*UNUSED_*", "*UTILISATION_*", "*WARNING_*", "*WHISPER_*")
foreach ($pattern in $guidePatterns) {
    Get-ChildItem -Path "." -Filter $pattern -File | ForEach-Object {
        if ($_.Name -ne "README.md") {
            Move-Item -Path $_.FullName -Destination "docs\guides\" -Force -ErrorAction SilentlyContinue
            Write-Host "  OK: $($_.Name)" -ForegroundColor Green
        }
    }
}

# Scripts PowerShell
Write-Host "`nOrganisation des scripts PowerShell..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.ps1" -File | ForEach-Object {
    if ($_.Name -notlike "*organize-files*") {
        Move-Item -Path $_.FullName -Destination "scripts\" -Force -ErrorAction SilentlyContinue
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`nReorganisation terminee!" -ForegroundColor Green

