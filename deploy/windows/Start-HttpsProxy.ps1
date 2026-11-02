param(
    [Parameter(Mandatory=$true)][string]$Domain,
    [Parameter(Mandatory=$true)][string]$AcmeEmail,
    [Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9_-]{3,40}$')][string]$ViewerUser,
    [string]$HashPath='C:\ProgramData\AcademicPJT1\private\viewer.hash',
    [string]$CaddyPath='C:\AcademicPJT1\caddy.exe',
    [string]$DataDirectory='C:\ProgramData\AcademicPJT1\caddy',
    [switch]$ValidateOnly
)
$ErrorActionPreference='Stop'
if($Domain -notmatch '^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$' -or $Domain -match '\.(invalid|example|localhost|test)$'){
    throw 'Provide the real public DNS name, without https:// or a path.'
}
if($AcmeEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$'){throw 'Provide the certificate administrator email.'}
$hash=(Get-Content -LiteralPath $HashPath -Raw).Trim()
if($hash -notmatch '^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$'){throw 'Expected a bcrypt hash produced by caddy hash-password.'}
if(-not (Test-Path -LiteralPath $CaddyPath -PathType Leaf)){throw 'Install the verified official Windows caddy.exe first.'}
$keys=@('API_DOMAIN','ACME_EMAIL','WEB_VIEWER_USER','WEB_VIEWER_HASH','XDG_DATA_HOME','XDG_CONFIG_HOME')
$saved=@{}; foreach($key in $keys){$saved[$key]=[Environment]::GetEnvironmentVariable($key,'Process')}
try {
    $env:API_DOMAIN=$Domain;$env:ACME_EMAIL=$AcmeEmail;$env:WEB_VIEWER_USER=$ViewerUser;$env:WEB_VIEWER_HASH=$hash
    $env:XDG_DATA_HOME=$DataDirectory;$env:XDG_CONFIG_HOME=$DataDirectory
    New-Item -ItemType Directory -Force -Path $DataDirectory | Out-Null
    $config=Join-Path $PSScriptRoot 'Caddyfile'
    & $CaddyPath validate --config $config --adapter caddyfile
    if($LASTEXITCODE -ne 0){throw 'Caddy validation failed. Nothing started.'}
    if($ValidateOnly){return}
    & $CaddyPath run --config $config --adapter caddyfile
    if($LASTEXITCODE -ne 0){throw 'Caddy stopped with an error.'}
} finally {
    foreach($key in $keys){[Environment]::SetEnvironmentVariable($key,$saved[$key],'Process')}
}
