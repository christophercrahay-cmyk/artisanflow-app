@echo off
echo ========================================
echo DEPLOIEMENT DES 3 EDGE FUNCTIONS
echo ========================================

echo.
echo [1/3] Deploiement de transcribe-audio...
supabase functions deploy transcribe-audio
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: transcribe-audio a echoue
    pause
    exit /b 1
)

echo.
echo [2/3] Deploiement de correct-text...
supabase functions deploy correct-text
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: correct-text a echoue
    pause
    exit /b 1
)

echo.
echo [3/3] Deploiement de analyze-note...
supabase functions deploy analyze-note
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: analyze-note a echoue
    pause
    exit /b 1
)

echo.
echo ========================================
echo DEPLOIEMENT TERMINE AVEC SUCCES !
echo ========================================
echo.
echo Verification des fonctions deployees:
supabase functions list

pause

