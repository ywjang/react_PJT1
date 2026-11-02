param([Parameter(Mandatory=$true)][uri]$BaseUrl)
$ErrorActionPreference='Stop'
if($BaseUrl.Scheme -ne 'https' -or $BaseUrl.AbsolutePath -ne '/'){throw 'Use https://actual-domain/ only.'}
$base=$BaseUrl.GetLeftPart([System.UriPartial]::Authority)
$origin='https://ywjang.github.io'
# These requests perform no database writes.
$headers=@{Origin=$origin;'Access-Control-Request-Method'='GET';'Access-Control-Request-Headers'='authorization'}
$preflight=Invoke-WebRequest -Uri "$base/api/system" -Method Options -Headers $headers -UseBasicParsing
if($preflight.StatusCode -ne 204 -or $preflight.Headers['Access-Control-Allow-Origin'] -ne $origin){throw 'CORS preflight failed.'}
$credential=Get-Credential -Message 'WEB viewer credentials, NOT Oracle credentials'
$password=$credential.GetNetworkCredential().Password
$token=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($credential.UserName+':'+$password))
try {
    $result=Invoke-RestMethod -Uri "$base/api/system" -Headers @{Origin=$origin;Authorization="Basic $token"}
    if($result.connected -ne $true -or $result.mode -ne 'oracle'){throw 'Oracle connection not verified.'}
    $result | Select-Object mode,connected,database
    Write-Host 'Authenticated HTTPS GET and browser preflight passed. This is not a browser or CRUD test.'
} finally { $token=$null;$password=$null;$credential=$null }
