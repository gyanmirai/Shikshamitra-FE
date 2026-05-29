# Build Script - Prepares standalone folder for Azure deploy
# Mirrors the build steps in: .github/workflows/deploy.yml
#
# USAGE:  .\build-standalone.ps1
# OUTPUT: build\standalone\  <- ready to deploy to Azure Web App

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step { param([string]$msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK   { param([string]$msg) Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Fail { param([string]$msg) Write-Host "    [FAIL] $msg" -ForegroundColor Red; exit 1 }

# Step 1: Install dependencies
Write-Step "Installing dependencies (npm ci)"
$env:HUSKY = "0"
npm ci
if ($LASTEXITCODE -ne 0) { Write-Fail "npm ci failed" }
Write-OK "Dependencies installed"

# Step 2: Build Next.js
Write-Step "Building Next.js app"
$env:NODE_OPTIONS = "--max-old-space-size=3072"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Fail "npm run build failed" }
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
Write-OK "Build complete"

# Step 3: Copy public/ into standalone
Write-Step "Copying public/ -> build\standalone\public"
if (-not (Test-Path "build\standalone")) {
    Write-Fail "build\standalone not found - make sure next.config.mjs has output: 'standalone'"
}
if (Test-Path "public") {
    Copy-Item -Recurse -Force "public" "build\standalone\public"
    Write-OK "public/ copied"
} else {
    Write-Host "    [SKIP] No public/ folder found" -ForegroundColor Yellow
}

# Step 4: Copy build/static into standalone
Write-Step "Copying build\static -> build\standalone\build\static"
if (Test-Path "build\static") {
    $dest = "build\standalone\build\static"
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item -Recurse -Force "build\static\*" $dest
    Write-OK "build\static copied"
} else {
    Write-Host "    [SKIP] No build\static folder found" -ForegroundColor Yellow
}

# Step 5: Verify output
Write-Step "Standalone folder contents"
Get-ChildItem "build\standalone" | Format-Table Name, LastWriteTime -AutoSize

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Build ready at:  build\standalone\" -ForegroundColor Green
Write-Host "  Run deploy-azure.ps1 -SkipBuild to deploy this folder." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
