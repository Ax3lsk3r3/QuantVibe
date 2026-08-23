# QuantVibe — configuración de entornos (Windows PowerShell)
# Crea dos venvs aislados e instala las dependencias.
#
#   venvs\qlib  -> pyqlib + yfinance      (lado investigación; requiere Python 3.11/3.12)
#   venvs\vibe  -> vibe-trading-ai        (lado agente/ejecución)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot | Split-Path
Set-Location $root

function Get-PythonFor([string[]]$candidates) {
    foreach ($c in $candidates) {
        try {
            $v = & $c -c "import sys; print(sys.version_info[:2])" 2>$null
            if ($LASTEXITCODE -eq 0) { return $c }
        } catch { }
    }
    return $null
}

Write-Host "== venv de qlib ==" -ForegroundColor Cyan
$qlibPy = Get-PythonFor @("py -3.12", "py -3.11", "py -3.10")
if ($null -eq $qlibPy) {
    Write-Warning "No se encontró Python 3.10-3.12. pyqlib no soporta 3.13+."
    Write-Warning "El pipeline seguirá funcionando en modo DEMO con el intérprete del sistema."
} else {
    Write-Host "Usando: $qlibPy"
    & $qlibPy -m venv "$root\venvs\qlib"
    & "$root\venvs\qlib\Scripts\python.exe" -m pip install --upgrade pip
    & "$root\venvs\qlib\Scripts\python.exe" -m pip install -r "$root\requirements-qlib.txt"
}

Write-Host "`n== venv de vibe ==" -ForegroundColor Cyan
$vibePy = Get-PythonFor @("py", "python")
Write-Host "Usando: $vibePy"
& $vibePy -m venv "$root\venvs\vibe"
& "$root\venvs\vibe\Scripts\python.exe" -m pip install --upgrade pip
& "$root\venvs\vibe\Scripts\python.exe" -m pip install -r "$root\requirements-vibe.txt"

Write-Host "`nListo." -ForegroundColor Green
Write-Host "Corre el pipeline demo:  python scripts\run_pipeline.py --force-demo"
Write-Host "Corre los tests:         python -m unittest discover -s tests"

