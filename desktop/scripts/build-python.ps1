$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$python = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) { throw "Missing .venv. Run scripts/setup-windows.ps1 first." }
$dest = Join-Path $root "resources\python"
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Remove-Item "$dest\rush-office-engine*" -Force -ErrorAction SilentlyContinue
& $python -m PyInstaller --noconfirm --clean --onefile --name rush-office-engine --distpath $dest --workpath "$env:TEMP\rush-pyinstaller" --specpath "$env:TEMP\rush-pyinstaller-spec" ".\python\engine_v2.py"
if ($LASTEXITCODE -ne 0) { throw "Python engine build failed." }
Write-Host "RUSH Python engine packaged." -ForegroundColor Green
