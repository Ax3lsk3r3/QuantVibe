# qlib-vibe-bridge environment setup (Windows PowerShell)
# Creates two isolated venvs and installs dependencies.
#
#   venvs\qlib  -> pyqlib + yfinance      (research side; needs Python 3.11/3.12)
#   venvs\vibe  -> vibe-trading-ai        (agent/execution side)

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

Write-Host "== qlib venv ==" -ForegroundColor Cyan
$qlibPy = Get-PythonFor @("py -3.12", "py -3.11", "py -3.10")
if ($null -eq $qlibPy) {
    Write-Warning "No Python 3.10-3.12 found. pyqlib does not support 3.13+."
    Write-Warning "The pipeline will still run in DEMO mode with the system interpreter."
} else {
    Write-Host "Using: $qlibPy"
    & $qlibPy -m venv "$root\venvs\qlib"
    & "$root\venvs\qlib\Scripts\python.exe" -m pip install --upgrade pip
    & "$root\venvs\qlib\Scripts\python.exe" -m pip install -r "$root\requirements-qlib.txt"
}

Write-Host "`n== vibe venv ==" -ForegroundColor Cyan
$vibePy = Get-PythonFor @("py", "python")
Write-Host "Using: $vibePy"
& $vibePy -m venv "$root\venvs\vibe"
& "$root\venvs\vibe\Scripts\python.exe" -m pip install --upgrade pip
& "$root\venvs\vibe\Scripts\python.exe" -m pip install -r "$root\requirements-vibe.txt"

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Run the demo pipeline:  python scripts\run_pipeline.py --force-demo"
Write-Host "Run tests:              python -m unittest discover -s tests"
