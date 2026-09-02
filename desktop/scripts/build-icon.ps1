$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$venvPython = Join-Path $root ".venv\Scripts\python.exe"
$python = if (Test-Path $venvPython) { $venvPython } else { "python" }
& $python ".\scripts\generate-icon.py"
if ($LASTEXITCODE -ne 0) { throw "Windows icon generation failed." }
if (-not (Test-Path ".\build\icon.ico")) { throw "Windows icon was not created." }
Write-Host "RUSH Office Suite Windows icon ready." -ForegroundColor Green
