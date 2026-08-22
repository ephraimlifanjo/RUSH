$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$python = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) { $python = "python" }
& $python ".\python\self_test.py"
if ($LASTEXITCODE -ne 0) { throw "RUSH self-test failed." }
