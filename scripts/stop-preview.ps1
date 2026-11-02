param([switch]$BackendOnly)
$ErrorActionPreference='Stop'
$runtimePath=Join-Path $PSScriptRoot '..\.local-runtime.json'
if(-not (Test-Path -LiteralPath $runtimePath)){Write-Output 'No recorded preview process. Stop foreground servers with Ctrl+C.';exit 0}
$records=Get-Content -LiteralPath $runtimePath -Raw|ConvertFrom-Json
foreach($record in $records){
  if($BackendOnly -and $record.kind -ne 'backend'){continue}
  $process=Get-Process -Id $record.processId -ErrorAction SilentlyContinue
  if($process -and $process.StartTime.ToUniversalTime().Ticks.ToString() -eq $record.startTicks){
    Stop-Process -Id $process.Id
    Write-Output ('Stopped preview '+$record.kind)
  }
}
