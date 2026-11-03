param(
    [Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9_-]{3,40}$')][string]$ViewerUser,
    [string]$HashPath='C:\ProgramData\AcademicPJT1\private\viewer.hash',
    [string]$CaddyPath='C:\AcademicPJT1\caddy.exe',
    [switch]$ValidateOnly
)
$ErrorActionPreference='Stop'
# Tunnel terminates public HTTPS. Caddy listens ONLY on loopback HTTP.
$hash=(Get-Content -LiteralPath $HashPath -Raw).Trim()
if($hash -notmatch '^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$'){throw 'Expected bcrypt hash from caddy hash-password.'}
if(-not (Test-Path -LiteralPath $CaddyPath -PathType Leaf)){throw 'Verified caddy.exe is required.'}
if(-not $ValidateOnly){
    $state=Invoke-RestMethod -Uri 'http://127.0.0.1:8091/api/system' -TimeoutSec 10
    if($state.connected -ne $true -or $state.mode -ne 'oracle'){throw 'Start and verify Spring Boot/Oracle first.'}
    if(Get-NetTCPConnection -State Listen -LocalPort 18091 -ErrorAction SilentlyContinue){throw 'Port 18091 is in use. Do not stop unknown processes.'}
}
$savedUser=$env:WEB_VIEWER_USER;$savedHash=$env:WEB_VIEWER_HASH
try {
    $env:WEB_VIEWER_USER=$ViewerUser;$env:WEB_VIEWER_HASH=$hash
    $config=Join-Path $PSScriptRoot 'Caddyfile.tunnel'
    & $CaddyPath validate --config $config --adapter caddyfile
    if($LASTEXITCODE -ne 0){throw 'Gateway config validation failed.'}
    if($ValidateOnly){return}
    & $CaddyPath run --config $config --adapter caddyfile
    if($LASTEXITCODE -ne 0){throw 'Gateway stopped with an error.'}
} finally {$env:WEB_VIEWER_USER=$savedUser;$env:WEB_VIEWER_HASH=$savedHash}
