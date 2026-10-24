# Daily run of the e2e tests on the real youtube.com. By default it tests the extension installed from the
# store (prod-chrome, prod-edge) in the windows opened with the dashboard / "npm run e2e:open:<project>";
# closed windows are reopened with their profile, which keeps the login. Local projects build dist/ first.
# The run is saved like every other run in e2e/runs/<date-time>_daily (report, output.log, summary.json) and
# shows up in the dashboard. On failure the report is opened in the browser.
#
# Run manually:      npm run e2e:daily
# Schedule it:       powershell -ExecutionPolicy Bypass -File e2e/scripts/register-daily-task.ps1 -At 09:00

param(
    [string[]] $Projects = @('prod-chrome', 'prod-edge'),
    [switch] $NoOpenOnFailure
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

$runsDir = Join-Path $root 'e2e\runs'
$startedAt = Get-Date
$runDir = Join-Path $runsDir ($startedAt.ToString('yyyy-MM-dd_HH-mm-ss') + '_daily')
New-Item -ItemType Directory -Force $runDir | Out-Null

$label = "daily: $($Projects -join ', ')"
$env:E2E_RUN_DIR = $runDir
$env:E2E_RUN_LABEL = $label
$log = Join-Path $runDir 'output.log'

# Windows PowerShell turns redirected stderr of native commands (build progress, warnings) into error records;
# with 'Stop' the first one would abort the run. Exit codes are checked instead.
$ErrorActionPreference = 'Continue'

# npm.cmd / npx.cmd (not the PowerShell shims) so that arguments are passed through unchanged
$exitCode = 0
$problem = ''

foreach ($project in $Projects) {
    if ($exitCode -ne 0) { break }
    & node e2e/scripts/open-browser.mjs $project *>&1 | Tee-Object -FilePath $log -Append
    if ($LASTEXITCODE -ne 0) { $exitCode = $LASTEXITCODE; $problem = "could not open the $project window" }
}

if ($exitCode -eq 0 -and ($Projects | Where-Object { $_ -like 'local-*' })) {
    & npm.cmd run e2e:build *>&1 | Tee-Object -FilePath $log -Append
    if ($LASTEXITCODE -ne 0) { $exitCode = $LASTEXITCODE; $problem = 'build failed' }
}

if ($exitCode -eq 0) {
    # the test reporter writes summary.json and the line in e2e/runs/history.log
    $projectArgs = @($Projects | ForEach-Object { "--project=$_" })
    & npx.cmd playwright test -c e2e @projectArgs *>&1 | Tee-Object -FilePath $log -Append
    $exitCode = $LASTEXITCODE
}
else {
    Add-Content (Join-Path $runsDir 'history.log') "$($startedAt.ToString('yyyy-MM-dd HH:mm'))  FAILED       [$($Projects -join ', ')] $label  $problem  log: $log"
    @{ startedAt = $startedAt.ToUniversalTime().ToString('o'); status = 'failed'; label = "$label ($problem)"; projects = $Projects;
       counts = @{ passed = 0; failed = 0; flaky = 0; skipped = 0 }; durationSeconds = [int]((Get-Date) - $startedAt).TotalSeconds; failedTests = @() } |
        ConvertTo-Json | Set-Content (Join-Path $runDir 'summary.json') -Encoding UTF8
}

if ($exitCode -ne 0 -and -not $NoOpenOnFailure) {
    $report = Join-Path $runDir 'report\index.html'
    if (Test-Path $report) { Start-Process $report } else { Start-Process $log }
}

exit $exitCode
