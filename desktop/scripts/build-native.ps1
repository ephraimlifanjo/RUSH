$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$out = Join-Path $root "resources\native"
New-Item -ItemType Directory -Path $out -Force | Out-Null
if (-not (Get-Command cmake -ErrorAction SilentlyContinue)) {
  Write-Host "CMake not found. Skipping optional C++ helper; RUSH will use its JS filesystem fallback." -ForegroundColor Yellow
  exit 0
}
$build = Join-Path $root "native\build"
cmake -S ".\native" -B $build -DCMAKE_BUILD_TYPE=Release
cmake --build $build --config Release
$candidates = @("$build\Release\rush-native-core.exe", "$build\rush-native-core.exe")
$exe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($exe) { Copy-Item $exe "$out\rush-native-core.exe" -Force; Write-Host "RUSH C++ native core packaged." -ForegroundColor Green }
else { Write-Host "Native build did not produce an executable. JS fallback remains available." -ForegroundColor Yellow }
