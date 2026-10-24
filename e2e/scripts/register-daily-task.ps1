# Registers a Windows scheduled task that runs e2e/scripts/run-daily.ps1 every day.
# The task runs as the current user, only while you are logged on (the browsers need a desktop session).
# If the computer was off at that time, the run starts as soon as possible afterwards.
#
#   powershell -ExecutionPolicy Bypass -File e2e/scripts/register-daily-task.ps1 -At 09:00
#   Remove it:  Unregister-ScheduledTask -TaskName 'Ruckit e2e daily' -Confirm:$false

param(
    [string] $At = '09:00',
    [string] $TaskName = 'Ruckit e2e daily'
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$script = Join-Path $PSScriptRoot 'run-daily.ps1'

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$script`"" `
    -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
    -Description 'Ruckit: e2e tests of the store extension on the real youtube.com in Chrome and Edge' -Force | Out-Null

Write-Host "Scheduled '$TaskName' daily at $At. Results: e2e\daily-runs\history.log"
