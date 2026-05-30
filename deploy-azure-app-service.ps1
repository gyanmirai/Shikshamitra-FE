# Build and deploy the Next.js standalone package to Azure App Service.
# By default this reads deployment settings from .env.deploy.local.
#
# Usage:
#   .\deploy-azure-app-service.ps1
#
# Optional:
#   .\deploy-azure-app-service.ps1 -EnvFile .env.deploy.staging.local -SkipBuild

[CmdletBinding()]
param(
    [string]$EnvFile = ".env.deploy.local",
    [string]$SubscriptionId,
    [string]$ResourceGroupName,
    [string]$WebAppName,
    [string]$AppUrl,
    [string]$ApiUrl,
    [string]$ClientId,
    [string]$ClientSecret,
    [string]$Scope,
    [string]$AuthSecret,
    [string]$ServerUrl,
    [string]$AssetUrl,
    [string]$BasePath,
    [string]$AuthUrl,
    [string]$AuthTrustHost,
    [string]$NodeTlsRejectUnauthorized,
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step { param([string]$Message) Write-Host "`n==> $Message" -ForegroundColor Cyan }
function Write-Ok { param([string]$Message) Write-Host "    [OK] $Message" -ForegroundColor Green }

function Resolve-AzCommand {
    $fromPath = Get-Command az -ErrorAction SilentlyContinue
    if ($fromPath) {
        return $fromPath.Source
    }

    $standardInstall = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
    if (Test-Path $standardInstall) {
        return $standardInstall
    }

    throw "Azure CLI was not found. Install it with: winget install Microsoft.AzureCLI"
}

function Invoke-Az {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )

    & $AzCommand @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI command failed: az $($Arguments -join ' ')"
    }
}

function Read-EnvFile {
    param([string]$Path)

    $values = @{}
    if (-not (Test-Path $Path)) {
        return $values
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (
            ($value.StartsWith("'") -and $value.EndsWith("'")) -or
            ($value.StartsWith('"') -and $value.EndsWith('"'))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        $values[$key] = $value
    }

    return $values
}

function Resolve-Setting {
    param(
        [string]$CurrentValue,
        [hashtable]$EnvValues,
        [string[]]$Names,
        [switch]$Required,
        [string]$DefaultValue = ""
    )

    if ($CurrentValue) {
        return $CurrentValue
    }

    foreach ($name in $Names) {
        if ($EnvValues.ContainsKey($name) -and $EnvValues[$name]) {
            return $EnvValues[$name]
        }
    }

    if ($Required) {
        throw "Missing required deployment setting. Add one of these to $EnvFile`: $($Names -join ', ')"
    }

    return $DefaultValue
}

Write-Step "Loading deployment settings"
$envValues = Read-EnvFile -Path $EnvFile
if ($envValues.Count -gt 0) {
    Write-Ok "Loaded $EnvFile"
} else {
    Write-Host "    [WARN] $EnvFile not found or empty; using command-line values only" -ForegroundColor Yellow
}

$ResourceGroupName = Resolve-Setting $ResourceGroupName $envValues @("AZURE_RESOURCE_GROUP", "RESOURCE_GROUP_NAME") -Required
$SubscriptionId = Resolve-Setting $SubscriptionId $envValues @("AZURE_SUBSCRIPTION_ID", "SUBSCRIPTION_ID") -DefaultValue ""
$WebAppName = Resolve-Setting $WebAppName $envValues @("AZURE_WEBAPP_NAME", "WEBAPP_NAME") -Required
$AppUrl = Resolve-Setting $AppUrl $envValues @("NEXT_PUBLIC_APP_URL", "APP_URL") -Required
$ApiUrl = Resolve-Setting $ApiUrl $envValues @("NEXT_PUBLIC_API_URL", "API_URL") -Required
$ClientId = Resolve-Setting $ClientId $envValues @("NEXT_PUBLIC_CLIENT_ID", "CLIENT_ID") -Required
$ClientSecret = Resolve-Setting $ClientSecret $envValues @("NEXT_PUBLIC_CLIENT_SECRET", "CLIENT_SECRET") -Required
$Scope = Resolve-Setting $Scope $envValues @("NEXT_PUBLIC_SCOPE", "SCOPE") -Required
$AuthSecret = Resolve-Setting $AuthSecret $envValues @("AUTH_SECRET", "NEXTAUTH_SECRET") -Required
$ServerUrl = Resolve-Setting $ServerUrl $envValues @("NEXT_PUBLIC_SERVER_URL", "SERVER_URL") -DefaultValue $ApiUrl
$AssetUrl = Resolve-Setting $AssetUrl $envValues @("NEXT_PUBLIC_ASSET_URL", "ASSET_URL") -DefaultValue $ApiUrl
$BasePath = Resolve-Setting $BasePath $envValues @("NEXT_PUBLIC_BASE_PATH", "BASE_PATH") -DefaultValue ""
$AuthUrl = Resolve-Setting $AuthUrl $envValues @("AUTH_URL", "NEXTAUTH_URL") -DefaultValue $AppUrl
$AuthTrustHost = Resolve-Setting $AuthTrustHost $envValues @("AUTH_TRUST_HOST") -DefaultValue "true"
$NodeTlsRejectUnauthorized = Resolve-Setting $NodeTlsRejectUnauthorized $envValues @("NODE_TLS_REJECT_UNAUTHORIZED") -DefaultValue ""
Write-Ok "Deployment settings resolved for $WebAppName"

if (-not $ServerUrl) { $ServerUrl = $ApiUrl }
if (-not $AssetUrl) { $AssetUrl = $ApiUrl }

Write-Step "Checking Azure CLI"
$AzCommand = Resolve-AzCommand
$azVersion = & $AzCommand version --output json | ConvertFrom-Json
Write-Ok "Azure CLI detected: $($azVersion.'azure-cli')"

if ($SubscriptionId) {
    Write-Step "Selecting Azure subscription"
    Invoke-Az account set --subscription $SubscriptionId
    Write-Ok "Using subscription $SubscriptionId"
}

Write-Step "Configuring App Service startup command"
Invoke-Az webapp config set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --startup-file "node server.js" `
    --output none

Invoke-Az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --settings `
        HUSKY=0 `
        NEXT_TELEMETRY_DISABLED=1 `
        NEXT_PUBLIC_BASE_PATH="$BasePath" `
        NEXT_PUBLIC_SERVER_URL="$ServerUrl" `
        NEXT_PUBLIC_ASSET_URL="$AssetUrl" `
        NEXT_PUBLIC_API_URL="$ApiUrl" `
        NEXT_PUBLIC_CLIENT_ID="$ClientId" `
        NEXT_PUBLIC_APP_URL="$AppUrl" `
        NEXT_PUBLIC_SCOPE="$Scope" `
        NEXT_PUBLIC_CLIENT_SECRET="$ClientSecret" `
        AUTH_SECRET="$AuthSecret" `
        NEXTAUTH_SECRET="$AuthSecret" `
        AUTH_URL="$AuthUrl" `
        NEXTAUTH_URL="$AuthUrl" `
        AUTH_TRUST_HOST="$AuthTrustHost" `
        NODE_TLS_REJECT_UNAUTHORIZED="$NodeTlsRejectUnauthorized" `
    --output none
Write-Ok "App Service settings updated"

if (-not $SkipBuild) {
    Write-Step "Building standalone package"
    $env:HUSKY = "0"
    $env:NEXT_TELEMETRY_DISABLED = "1"
    $env:NEXT_PUBLIC_BASE_PATH = $BasePath
    $env:NEXT_PUBLIC_SERVER_URL = $ServerUrl
    $env:NEXT_PUBLIC_ASSET_URL = $AssetUrl
    $env:NEXT_PUBLIC_API_URL = $ApiUrl
    $env:NEXT_PUBLIC_CLIENT_ID = $ClientId
    $env:NEXT_PUBLIC_APP_URL = $AppUrl
    $env:NEXT_PUBLIC_SCOPE = $Scope
    $env:NEXT_PUBLIC_CLIENT_SECRET = $ClientSecret
    $env:AUTH_SECRET = $AuthSecret
    $env:NEXTAUTH_SECRET = $AuthSecret
    $env:AUTH_URL = $AuthUrl
    $env:NEXTAUTH_URL = $AuthUrl
    $env:AUTH_TRUST_HOST = $AuthTrustHost
    $env:NODE_TLS_REJECT_UNAUTHORIZED = $NodeTlsRejectUnauthorized

    .\build-standalone.ps1
}

if (-not (Test-Path "build\standalone\server.js")) {
    throw "build\standalone\server.js was not found. Run without -SkipBuild or check the Next.js build output."
}

Write-Step "Removing local env files from package source"
Get-ChildItem "build\standalone" -Force -Filter ".env*" -ErrorAction SilentlyContinue |
    Remove-Item -Force
Write-Ok "Local env files removed"

Write-Step "Creating deployment zip"
$packagePath = Join-Path (Get-Location) "build\app-service-package.zip"
if (Test-Path $packagePath) {
    Remove-Item -LiteralPath $packagePath -Force
}
Compress-Archive -Path "build\standalone\*" -DestinationPath $packagePath -Force
Write-Ok "Package created at $packagePath"

Write-Step "Deploying to Azure App Service"
Invoke-Az webapp deploy `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --src-path $packagePath `
    --type zip `
    --restart true `
    --output none
Write-Ok "Deployment finished"

Write-Step "Restarting App Service"
Invoke-Az webapp restart --resource-group $ResourceGroupName --name $WebAppName --output none
Write-Ok "App Service restarted"

Write-Host ""
Write-Host "Live URL: $AppUrl" -ForegroundColor Green
