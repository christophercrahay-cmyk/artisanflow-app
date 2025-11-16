# Script de réorganisation des fichiers ArtisanFlow
# Nettoie la racine du projet en déplaçant les fichiers dans docs/

Write-Host "🗂️ Réorganisation des fichiers..." -ForegroundColor Cyan

# Déplacer les fichiers SQL dans docs/sql/
Write-Host "`n📄 Déplacement des fichiers SQL..." -ForegroundColor Yellow
$sqlFiles = @(
    "INIT_SUPABASE.sql",
    "ACTIVER_RLS_SEPARATION_UTILISATEURS.sql",
    "ADD_ADDRESS_COLUMN.sql",
    "ADD_AUTH_RLS_FIXED.sql",
    "ADD_AUTH_RLS.sql",
    "ADD_CLIENT_ID_TO_NOTES.sql",
    "ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql",
    "add_devis_factures.sql",
    "ADD_PDF_URL_TO_DOCS.sql",
    "CHECK_NOTES_TABLE.sql",
    "CREATE_BRAND_SETTINGS.sql",
    "CREATE_MAIN_TABLES.sql",
    "create_tables.sql",
    "disable_rls.sql",
    "FIX_COLONNES_MANQUANTES.sql",
    "FIX_MISSING_COLUMNS_COMPLETE.sql",
    "FIX_NOTES_CLIENT_ID.sql",
    "FIX_RLS_NOTES_INSERT_MOBILE.sql",
    "FIX_RLS_SECURITY.sql",
    "FIX_RLS_STORAGE.sql",
    "FIX_USER_ID_RLS_NOTES_AND_PHOTOS.sql",
    "fix_uuid_tables.sql",
    "QUICK_VERIFICATION.sql",
    "setup_storage.sql",
    "STORAGE_POLICIES_ADMIN.sql",
    "VERIFY_STORAGE.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\sql\" -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

# Déplacer les changelogs dans docs/changelogs/
Write-Host "`n📝 Déplacement des changelogs..." -ForegroundColor Yellow
$changelogFiles = @(
    "AMELIORATIONS_APPLIQUEES.md",
    "BUGS_ALL_FIXES_FINAL.md",
    "BUGS_FIXES_FINAUX.md",
    "BUGS_MODAL_FIXES.md",
    "BUILD_READY_INSTALL.md",
    "BUILD_SUCCESS.md",
    "CHANGELOG_DESIGN_DARK.md",
    "CHANGELOG_MVP_COMPLET.md",
    "CHANGELOG_QA.md",
    "CHANGELOG_V3_REFONTE.md",
    "FINAL_QA_SUMMARY.md",
    "FIX_APPLIED.md",
    "FIX_DEV_CLIENT_CONNECTION_FINAL.md",
    "FIX_EXPO_CHECKS.md",
    "FIX_EXPO_FILE_SYSTEM_V54.md",
    "FIX_EXPO_GITIGNORE_COMPLETE.md",
    "FIX_FINAL_SUPABASE.md",
    "FIX_PROBLEMES_CAPTURE_COMPLETE.md",
    "FIX_SAFEAREA_APPLIED.md",
    "FIX_URGENT.md",
    "FIXES_APPLIQUES_RLS_NOTES.md",
    "FIXES_APPLIQUES.md",
    "IMPLEMENTATION_COMPLETE.md",
    "INSTALLATION_COMPLETE.md",
    "INTEGRATION_LOGO_COMPLETE.md",
    "RECAP_FINAL_IA_DEVIS.md",
    "RECAP_FIX_USER_ID_FINAL.md",
    "RECAP_ULTIME.md",
    "RESUME_BUILD_SETUP.md",
    "RESUME_BUILDS_APK.md",
    "RESUME_COMPLET_FIXES.md",
    "RESUME_FINAL.md",
    "RESUME_FIXES_RLS_COMPLET.md",
    "RESUME_QA_RUNNER.md",
    "STATUS_FINAL.md",
    "STATUS_RLS_DECISION.md",
    "STATUS_TRANSFORMATION.md",
    "SUMMARY_FIX_COMPLET.md",
    "TRANSFORMATION_COMPLETE.md"
)

foreach ($file in $changelogFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\changelogs\" -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

# Déplacer les guides dans docs/guides/
Write-Host "`n📖 Déplacement des guides..." -ForegroundColor Yellow
$guideFiles = @(
    "ACTION_FINALE.md",
    "ACTION_IMMEDIATE_USER.md",
    "ACTIONS_IMMEDIATES.md",
    "AI_QUOTE_IMPLEMENTATION.md",
    "AUDIT_COMPLET_SECURITE.md",
    "AUDIT_TEST_IA.md",
    "BILAN_APPLICATION.md",
    "BILAN_PROJET.md",
    "CHECKLIST_AUTH_FINAL.md",
    "COMMANDES_BUILD.md",
    "COMMANDES_EXPO.md",
    "DEBUG_IA.md",
    "EST_CE_PRET.md",
    "GUIDE_AUTH_SUPABASE.md",
    "GUIDE_BUILD_APK_CLOUD.md",
    "GUIDE_BUILD_PRODUCTION.md",
    "GUIDE_PLAY_STORE_UPLOAD.md",
    "GUIDE_RESOLUTION_PROBLEME.md",
    "GUIDE_SQL_COLONNES_MANQUANTES.md",
    "GUIDE_SUPABASE.md",
    "INSTRUCTIONS_AJOUT_LOGO_SIMPLE.md",
    "INSTRUCTIONS_AUTH_FIXED.md",
    "INSTRUCTIONS_FINALES.md",
    "INSTRUCTIONS_LOGO_PHYSIQUE.md",
    "INSTRUCTIONS_SUPABASE.txt",
    "INSTRUCTIONS_TEST_IA.md",
    "LANCE_BUILD_ANDROID.md",
    "LIENS_BUILDS_APK.txt",
    "MVP_RESUME_FINAL.md",
    "ORDRE_EXECUTION_SQL.md",
    "PROBLEMES_COMMUNS.md",
    "PROCHAINES_ETAPES_AUTH.md",
    "QUICK_FIX.md",
    "QUICK_START.md",
    "RAPPORT_PROJET.md",
    "README_QA.md",
    "README-android-setup.md",
    "RLS_AVERTISSEMENT_MVP.md",
    "SETUP_DEV_CLIENT_COMPLETE.md",
    "SOLUTION_COLONNE_PROJECT_PHOTOS.md",
    "SOLUTION_EAS_BUILD_DIRECT.md",
    "SOLUTION_TEST_IA.md",
    "STORAGE_POLICIES_MANUAL.md",
    "STORE_ZUSTAND_IMPLEMENTATION.md",
    "SUPABASE_SETUP.md",
    "SYSTEME_LOGS_COMPLET.md",
    "TEST_IA_DEVIS.md",
    "TEST_LIVE_DEV.md",
    "UNUSED_INDEXES_INFO.md",
    "UTILISATION_QA.txt",
    "WARNING_PREBUILD_OK.md",
    "WHISPER_EXPLICATION.md"
)

foreach ($file in $guideFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\guides\" -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

# Déplacer les scripts PowerShell dans scripts/
Write-Host "`n⚙️ Organisation des scripts..." -ForegroundColor Yellow
$scriptFiles = @(
    "kill-port-8081.ps1",
    "start-dev.ps1",
    "start-tunnel.ps1",
    "setup-android.ps1",
    "install-artisanflow.ps1"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\" -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ Réorganisation terminée !" -ForegroundColor Green
Write-Host "`n📂 Structure créée :" -ForegroundColor Cyan
Write-Host "  - docs/sql/        - Fichiers SQL" -ForegroundColor White
Write-Host "  - docs/changelogs/ - Historique des modifications" -ForegroundColor White
Write-Host "  - docs/guides/     - Documentation et guides" -ForegroundColor White
Write-Host "  - scripts/         - Scripts PowerShell" -ForegroundColor White

