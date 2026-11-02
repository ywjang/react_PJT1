param(
    [Parameter(Mandatory=$true)][string]$JarPath,
    [string]$SecretPath = 'C:\ProgramData\AcademicPJT1\private\oracle.xml',
    [string]$OracleUrl = 'jdbc:oracle:thin:@192.168.0.130:1521:HJDB',
    [string]$OracleUser = 'scott'
)
$ErrorActionPreference = 'Stop'
$jar = (Resolve-Path -LiteralPath $JarPath).Path
if (-not $jar.EndsWith('.jar')) { throw 'Select the verified public-build JAR.' }
if (Get-NetTCPConnection -State Listen -LocalPort 8091 -ErrorAction SilentlyContinue) {
    throw 'Port 8091 is already in use. Inspect existing applications; this script will not stop them.'
}
$savedPassword=$env:ORACLE_PASSWORD
$savedUrl=$env:ORACLE_JDBC_URL
$savedUser=$env:ORACLE_USERNAME
try {
    $secure = Import-Clixml -LiteralPath $SecretPath
    if (-not ($secure -is [System.Security.SecureString])) { throw 'Invalid DPAPI secret file.' }
    $env:ORACLE_PASSWORD=[System.Net.NetworkCredential]::new('', $secure).Password
    $env:ORACLE_JDBC_URL=$OracleUrl
    $env:ORACLE_USERNAME=$OracleUser
    & java -jar $jar '--spring.profiles.active=oracle11g,public' '--server.address=127.0.0.1' '--server.port=8091' '--spring.sql.init.mode=never' '--spring.jpa.hibernate.ddl-auto=none'
    if($LASTEXITCODE -ne 0){throw 'Backend stopped with an error. Inspect the console without sharing secrets.'}
} finally {
    $env:ORACLE_PASSWORD=$savedPassword
    $env:ORACLE_JDBC_URL=$savedUrl
    $env:ORACLE_USERNAME=$savedUser
}
