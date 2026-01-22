# check-css.ps1
Write-Host "=== ANALIZANDO CSS USADO ===" -ForegroundColor Cyan

# 1. Leer clases de app.css
$cssPath = "resources\css\app.css"
$cssContent = Get-Content $cssPath -Raw

# Extraer nombres de clases
$classPattern = '\.([\w\-]+)(?:\s*[:,{]|$)'
$cssContent -match $classPattern | Out-Null
$classes = $matches | Select-Object -Unique

Write-Host "Clases encontradas en app.css: $($classes.Count)" -ForegroundColor Yellow

# 2. Buscar en archivos del proyecto
$searchPaths = @("resources\js", "resources\views")
$usedClasses = @()
$unusedClasses = @()

foreach ($class in $classes) {
    $found = $false
    
    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            $files = Get-ChildItem -Path $path -Recurse -Include "*.tsx", "*.js", "*.blade.php", "*.vue"
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw
                if ($content -match $class) {
                    $found = $true
                    $usedClasses += $class
                    break
                }
            }
            
            if ($found) { break }
        }
    }
    
    if (-not $found) {
        $unusedClasses += $class
    }
}

# 3. Mostrar resultados
Write-Host "`n=== RESULTADOS ===" -ForegroundColor Green
Write-Host "Clases usadas: $($usedClasses.Count)" -ForegroundColor Green
Write-Host "Clases no usadas: $($unusedClasses.Count)" -ForegroundColor Red

if ($unusedClasses.Count -gt 0) {
    Write-Host "`n=== CLASES NO USADAS ===" -ForegroundColor Red
    $unusedClasses | ForEach-Object { Write-Host "  - $_" }
}

# 4. Buscar animaciones específicamente
Write-Host "`n=== ANIMACIONES DEFINIDAS ===" -ForegroundColor Cyan
$animations = Select-String -Path $cssPath -Pattern '@keyframes\s+(\w+)' | ForEach-Object { $_.Matches.Groups[1].Value }
foreach ($anim in $animations) {
    $used = Select-String -Path "resources\js\*", "resources\views\*" -Pattern $anim -Quiet
    if ($used) {
        Write-Host "  ✓ $anim (USADA)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $anim (NO USADA)" -ForegroundColor Red
    }
}