param(
  [string]$ApiUrl = $env:E2E_API_URL,
  [string]$Tenant = $(if ($env:E2E_TENANT) { $env:E2E_TENANT } else { 'DDVS' }),
  [string]$Email = $(if ($env:E2E_DASHBOARD_API_EMAIL) { $env:E2E_DASHBOARD_API_EMAIL } else { 'admin-ddvs' }),
  [string]$Password = $(if ($env:E2E_DASHBOARD_API_PASSWORD) { $env:E2E_DASHBOARD_API_PASSWORD } else { 'Temp@123' }),
  [string]$LimitedEmail = $(if ($env:E2E_DASHBOARD_LIMITED_EMAIL) { $env:E2E_DASHBOARD_LIMITED_EMAIL } else { 'finance-officer@ddvs.com' }),
  [string]$LimitedPassword = $(if ($env:E2E_DASHBOARD_LIMITED_PASSWORD) { $env:E2E_DASHBOARD_LIMITED_PASSWORD } else { 'Temp@123' }),
  [string]$ClientId = $(if ($env:E2E_DASHBOARD_API_CLIENT_ID) { $env:E2E_DASHBOARD_API_CLIENT_ID } else { 'ShikshaMitra_App' })
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ApiUrl)) {
  throw 'Set E2E_API_URL before running dashboard API smoke.'
}

$ApiUrl = $ApiUrl.TrimEnd('/')
$templates = @('leadership', 'principalAdmin', 'teacher', 'financeHr', 'studentParent')

function Invoke-CurlJson {
  param(
    [string[]]$Arguments,
    [string]$ErrorMessage
  )

  $response = & curl.exe @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw $ErrorMessage
  }

  return $response | ConvertFrom-Json
}

function Assert-ArrayProperty {
  param(
    [object]$Object,
    [string]$Name,
    [string]$Context
  )

  if (-not ($Object.PSObject.Properties.Name -contains $Name)) {
    throw "$Context is missing $Name."
  }

  $value = $Object.$Name
  if ($null -eq $value) {
    throw "$Context has null $Name."
  }
}

function Get-AccessToken {
  param(
    [string]$Username,
    [string]$UserPassword
  )

  $encodedBody = @(
    "grant_type=password"
    "username=$([uri]::EscapeDataString($Username))"
    "password=$([uri]::EscapeDataString($UserPassword))"
    "client_id=$([uri]::EscapeDataString($ClientId))"
    "scope=$([uri]::EscapeDataString('openid profile email roles offline_access ShikshaMitra'))"
  ) -join '&'

  $token = Invoke-CurlJson `
    -Arguments @(
      '-k',
      '-s',
      '-X', 'POST',
      "$ApiUrl/connect/token",
      '-H', 'Content-Type: application/x-www-form-urlencoded',
      '-H', "__tenant: $Tenant",
      '--data', $encodedBody
    ) `
    -ErrorMessage "Dashboard API smoke could not obtain an access token for $Username."

  if ([string]::IsNullOrWhiteSpace($token.access_token)) {
    throw "Dashboard API smoke token response for $Username did not include access_token."
  }

  return $token.access_token
}

function Get-AuthHeaders {
  param([string]$AccessToken)

  return @(
    '-H', "__tenant: $Tenant",
    '-H', "Authorization: Bearer $AccessToken"
  )
}

function Get-WidgetIds {
  param([object]$Summary)

  return @(
    @($Summary.kpiCards) | ForEach-Object { $_.id }
    @($Summary.actionItems) | ForEach-Object { $_.id }
    @($Summary.riskAlerts) | ForEach-Object { $_.id }
    @($Summary.calendarItems) | ForEach-Object { $_.id }
    @($Summary.moduleSnapshots) | ForEach-Object { $_.id }
    @($Summary.announcements) | ForEach-Object { $_.id }
  ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
}

function Get-Widgets {
  param([object]$Summary)

  return @(
    @($Summary.kpiCards)
    @($Summary.actionItems)
    @($Summary.riskAlerts)
    @($Summary.calendarItems)
    @($Summary.moduleSnapshots)
    @($Summary.announcements)
  ) | Where-Object { $null -ne $_ }
}

function Assert-SafeDashboardWidgets {
  param(
    [object]$Summary,
    [string[]]$MetadataIds,
    [string[]]$ExpectedIds,
    [string]$Context
  )

  $widgetIds = @(Get-WidgetIds -Summary $Summary)
  foreach ($expectedId in $ExpectedIds) {
    if ($widgetIds -notcontains $expectedId) {
      throw "$Context is missing expected widget $expectedId."
    }
  }

  foreach ($widget in (Get-Widgets -Summary $Summary)) {
    if ([string]::IsNullOrWhiteSpace($widget.id)) {
      throw "$Context contains a widget without id."
    }

    if ($MetadataIds -notcontains $widget.id) {
      throw "$Context returned unregistered widget $($widget.id)."
    }

    if (
      $widget.PSObject.Properties.Name -contains 'drilldownUrl' -and
      -not [string]::IsNullOrWhiteSpace($widget.drilldownUrl) -and
      -not $widget.drilldownUrl.StartsWith('/')
    ) {
      throw "$Context widget $($widget.id) has unsafe drilldownUrl $($widget.drilldownUrl)."
    }

    $hasDrilldown =
      $widget.PSObject.Properties.Name -contains 'drilldownUrl' -and
      -not [string]::IsNullOrWhiteSpace($widget.drilldownUrl)
    $hasOwner =
      $widget.PSObject.Properties.Name -contains 'owner' -and
      -not [string]::IsNullOrWhiteSpace($widget.owner)

    if (-not $hasDrilldown -and -not $hasOwner) {
      throw "$Context widget $($widget.id) is neither actionable nor owner-accountable."
    }
  }
}

$expectedWidgetsByTemplate = @{
  leadership = @(
    'leadership-total-students',
    'leadership-fee-collection',
    'leadership-attendance',
    'leadership-compliance',
    'leadership-academic-health'
  )
  principalAdmin = @(
    'principal-student-attendance',
    'principal-teacher-attendance',
    'principal-curriculum',
    'principal-academic-dashboard'
  )
  teacher = @(
    'teacher-classes',
    'teacher-homework',
    'teacher-exam-evaluation',
    'teacher-attendance',
    'teacher-class-performance'
  )
  financeHr = @(
    'finance-collection',
    'finance-dues',
    'hr-payroll-readiness',
    'hr-staff-attendance',
    'finance-reconciliation',
    'hr-leave-approvals',
    'finance-dashboard',
    'hr-dashboard'
  )
  studentParent = @(
    'student-attendance',
    'student-assignments',
    'student-fee-status',
    'student-document-update',
    'student-academic-summary'
  )
}

$accessToken = Get-AccessToken -Username $Email -UserPassword $Password
$headers = Get-AuthHeaders -AccessToken $accessToken

$metadata = Invoke-CurlJson `
  -Arguments (@('-k', '-s', "$ApiUrl/api/dashboard/widgets") + $headers) `
  -ErrorMessage 'Dashboard API smoke could not read widget metadata.'

if ($metadata.Count -lt 1) {
  throw 'Dashboard widget metadata is empty.'
}

$metadataIds = @($metadata | ForEach-Object { $_.id })

foreach ($template in $templates) {
  $summary = Invoke-CurlJson `
    -Arguments (@('-k', '-s', "$ApiUrl/api/dashboard/summary?dashboardTemplate=$template") + $headers) `
    -ErrorMessage "Dashboard API smoke could not read summary for $template."

  if ($summary.dashboardTemplate -ne $template) {
    throw "Expected dashboardTemplate $template but received $($summary.dashboardTemplate)."
  }

  Assert-ArrayProperty -Object $summary -Name 'kpiCards' -Context $template
  Assert-ArrayProperty -Object $summary -Name 'actionItems' -Context $template
  Assert-ArrayProperty -Object $summary -Name 'riskAlerts' -Context $template
  Assert-ArrayProperty -Object $summary -Name 'calendarItems' -Context $template
  Assert-ArrayProperty -Object $summary -Name 'moduleSnapshots' -Context $template
  Assert-ArrayProperty -Object $summary -Name 'announcements' -Context $template
  Assert-SafeDashboardWidgets `
    -Summary $summary `
    -MetadataIds $metadataIds `
    -ExpectedIds $expectedWidgetsByTemplate[$template] `
    -Context $template

  Write-Host "dashboard-api-smoke: $template ok"
}

$limitedAccessToken = Get-AccessToken -Username $LimitedEmail -UserPassword $LimitedPassword
$limitedHeaders = Get-AuthHeaders -AccessToken $limitedAccessToken
$limitedSummary = Invoke-CurlJson `
  -Arguments (@('-k', '-s', "$ApiUrl/api/dashboard/summary?dashboardTemplate=financeHr") + $limitedHeaders) `
  -ErrorMessage "Dashboard API smoke could not read limited financeHr summary for $LimitedEmail."

$limitedWidgetIds = @(Get-WidgetIds -Summary $limitedSummary)
$expectedFinanceWidgets = @('finance-collection', 'finance-dashboard')
$deniedHrWidgets = @('hr-payroll-readiness', 'hr-staff-attendance', 'hr-dashboard')

foreach ($widgetId in $expectedFinanceWidgets) {
  if ($limitedWidgetIds -notcontains $widgetId) {
    throw "Expected limited finance user to receive $widgetId."
  }
}

foreach ($widgetId in $deniedHrWidgets) {
  if ($limitedWidgetIds -contains $widgetId) {
    throw "Limited finance user unexpectedly received $widgetId."
  }
}

Write-Host "dashboard-api-smoke: limited finance permissions ok"
Write-Host "dashboard-api-smoke: widgets=$($metadata.Count) templates=$($templates.Count) ok"
