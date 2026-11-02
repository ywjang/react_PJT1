param([switch]$Demo)
$ErrorActionPreference='Stop'
$saved=$env:ORACLE_PASSWORD
if(-not $Demo -and -not $env:ORACLE_PASSWORD){$secret=Read-Host 'Oracle 비밀번호' -AsSecureString;$env:ORACLE_PASSWORD=[System.Net.NetworkCredential]::new('', $secret).Password}
Push-Location (Join-Path $PSScriptRoot '..\backend')
try {if($Demo){& .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=demo'}else{& .\mvnw.cmd spring-boot:run};if($LASTEXITCODE -ne 0){throw '백엔드 실행에 실패했습니다.'}} finally {Pop-Location;$env:ORACLE_PASSWORD=$saved}
