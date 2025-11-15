# Script pour extraire Supabase CLI depuis le fichier .tar.gz
Write-Host "Extraction de Supabase CLI..." -ForegroundColor Yellow

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

if (-not (Test-Path "supabase.tar.gz")) {
    Write-Host "Erreur: supabase.tar.gz non trouve" -ForegroundColor Red
    Write-Host "Telechargez d'abord le fichier depuis GitHub" -ForegroundColor Yellow
    exit 1
}

Write-Host "Fichier trouve, extraction en cours..." -ForegroundColor Green

# Méthode 1: Utiliser tar intégré Windows 10+
try {
    # tar peut extraire directement .tar.gz sur Windows 10+
    tar -xzf supabase.tar.gz
    Write-Host "Extraction reussie avec tar !" -ForegroundColor Green
} catch {
    Write-Host "Tar non disponible, tentative avec PowerShell..." -ForegroundColor Yellow
    
    # Méthode 2: Extraction manuelle .gz puis .tar
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        
        # Extraire .gz
        $gzStream = [System.IO.File]::OpenRead("supabase.tar.gz")
        $tarStream = [System.IO.File]::Create("supabase.tar")
        $gzipStream = New-Object System.IO.Compression.GZipStream($gzStream, [System.IO.Compression.CompressionMode]::Decompress)
        $gzipStream.CopyTo($tarStream)
        $gzipStream.Close()
        $tarStream.Close()
        $gzStream.Close()
        
        Write-Host "Fichier .gz extrait" -ForegroundColor Green
        
        # Extraire .tar avec 7-Zip ou autre outil
        Write-Host "Pour extraire le .tar, utilisez 7-Zip ou WinRAR" -ForegroundColor Yellow
        Write-Host "Ou utilisez cette commande si tar est disponible:" -ForegroundColor Yellow
        Write-Host "  tar -xf supabase.tar" -ForegroundColor White
        
    } catch {
        Write-Host "Erreur lors de l'extraction: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUTION ALTERNATIVE:" -ForegroundColor Yellow
        Write-Host "1. Installez 7-Zip (https://www.7-zip.org/)" -ForegroundColor Cyan
        Write-Host "2. Clic droit sur supabase.tar.gz -> 7-Zip -> Extraire ici" -ForegroundColor Cyan
        Write-Host "3. Puis clic droit sur supabase.tar -> 7-Zip -> Extraire ici" -ForegroundColor Cyan
    }
}

# Vérifier si supabase.exe existe maintenant
if (Test-Path "supabase.exe") {
    Write-Host ""
    Write-Host "✅ supabase.exe trouve !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test de l'installation..." -ForegroundColor Yellow
    & .\supabase.exe --version
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Supabase CLI est pret !" -ForegroundColor Green
        Write-Host ""
        Write-Host "Nettoyage des fichiers temporaires..." -ForegroundColor Yellow
        Remove-Item "supabase.tar.gz" -ErrorAction SilentlyContinue
        Remove-Item "supabase.tar" -ErrorAction SilentlyContinue
        Write-Host "✅ Termine !" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "⚠️  supabase.exe non trouve apres extraction" -ForegroundColor Yellow
    Write-Host "   Verifiez que le fichier a ete correctement extrait" -ForegroundColor Yellow
}

