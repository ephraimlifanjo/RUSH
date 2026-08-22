param([switch]$Msi,[switch]$Portable)
$ErrorActionPreference="Stop"
$root=Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if($Msi){npm run dist:msi}
elseif($Portable){npm run dist:portable}
else{npm run dist:win}
if($LASTEXITCODE -ne 0){throw "RUSH Windows build failed."}
Write-Host "Build complete. See $root\release" -ForegroundColor Green
