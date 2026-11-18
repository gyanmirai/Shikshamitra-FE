#requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$workerPath = [regex]::Escape((Join-Path $repository 'node_modules\next\dist\server\lib\start-server.js'))
$nodeCommand = '^(?:"(?:[^"]*\\)?node(?:\.exe)?"|(?:[^\s"]*\\)?node(?:\.exe)?)(?:\s+--\S+)*\s+'
$workerCommand = $nodeCommand + '(?:"' + $workerPath + '"|' + $workerPath + ')\s*$'
$nextCommand = $nodeCommand + '"?[^"\r\n]*node_modules[\\/](?:\.bin[\\/]+\.\.[\\/]+)?next[\\/]dist[\\/]bin[\\/]next"?\s+dev(?:\s|$)'

function Get-FrontendPortOwners {
    Get-NetTCPConnection -State Listen | Where-Object LocalPort -eq 3000 |
        Select-Object -ExpandProperty OwningProcess -Unique
}

function Stop-VerifiedNodeProcess($record) {
    $process = Get-Process -Id $record.ProcessId -ErrorAction SilentlyContinue
    if (!$process) { return }
    try {
        # Keep a handle to the verified process so a reused PID cannot be stopped.
        $null = $process.Handle
        if ($process.HasExited) { return }
        if ($process.Path -ine $record.ExecutablePath -or
            [Math]::Abs(($process.StartTime - $record.CreationDate).TotalMilliseconds) -gt 10) {
            throw "Node process $($record.ProcessId) changed identity during frontend cleanup."
        }
        $process.Kill()
        if (!$process.WaitForExit(5000)) { throw "Next.js process $($record.ProcessId) did not exit." }
    }
    finally { $process.Dispose() }
}

$nodes = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'")
$workers = @($nodes | Where-Object { $_.ExecutablePath -and $_.CommandLine -match $workerCommand })
$workerIds = @($workers | Select-Object -ExpandProperty ProcessId)
$unverifiedOwners = @(Get-FrontendPortOwners | Where-Object { $_ -notin $workerIds })
if ($unverifiedOwners.Count -gt 0) {
    throw "Port 3000 is in use by a process outside this frontend dev server (PID $($unverifiedOwners -join ', '))."
}

# Stop matched launchers first so Next.js cannot restart a worker during cleanup.
$launchers = @(foreach ($worker in $workers) {
    $nodes | Where-Object {
        $_.ProcessId -eq $worker.ParentProcessId -and
        $_.CreationDate -le $worker.CreationDate -and
        $_.ExecutablePath -ieq $worker.ExecutablePath -and
        $_.CommandLine -match $nextCommand
    }
})
foreach ($record in @($launchers | Sort-Object ProcessId -Unique) + $workers) {
    Stop-VerifiedNodeProcess $record
}

$remainingOwners = @(Get-FrontendPortOwners)
if ($remainingOwners.Count -gt 0) {
    throw "Port 3000 is still in use after frontend cleanup (PID $($remainingOwners -join ', '))."
}
if ($workers.Count -gt 0) { Write-Output 'Stopped the previous Next.js development server for this checkout.' }
Write-Output 'Frontend port 3000 is ready for VS Code.'
