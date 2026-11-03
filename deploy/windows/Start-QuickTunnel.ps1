param([string]$CloudflaredPath='C:\AcademicPJT1\cloudflared.exe')
$ErrorActionPreference='Stop'
if(-not (Test-Path -LiteralPath $CloudflaredPath -PathType Leaf)){throw 'Install the official cloudflared Windows binary first.'}
# Never expose Spring Boot directly: authentication and CORS live at port 18091.
try {
    Invoke-WebRequest -Uri 'http://127.0.0.1:18091/api/system' -UseBasicParsing -TimeoutSec 5 | Out-Null
    throw 'Gateway unexpectedly allows anonymous API access. Do not publish it.'
} catch {
    if(-not $_.Exception.Response -or [int]$_.Exception.Response.StatusCode -ne 401){throw}
}
& $CloudflaredPath tunnel --url http://127.0.0.1:18091
if($LASTEXITCODE -ne 0){throw 'Tunnel stopped with an error.'}
