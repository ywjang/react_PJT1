param([string]$SecretDirectory = 'C:\ProgramData\AcademicPJT1\private')
$ErrorActionPreference = 'Stop'
# Run on the target Windows server, as the same Windows user who will run Java.
if (Test-Path -LiteralPath $SecretDirectory) {
    throw 'Directory exists. Inspect its ACL and existing secrets; do not overwrite automatically.'
}
New-Item -ItemType Directory -Path $SecretDirectory | Out-Null
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$acl = Get-Acl -LiteralPath $SecretDirectory
$acl.SetAccessRuleProtection($true, $false)
foreach ($account in @($identity, 'NT AUTHORITY\SYSTEM', 'BUILTIN\Administrators')) {
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($account, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $acl.AddAccessRule($rule)
}
Set-Acl -LiteralPath $SecretDirectory -AclObject $acl
$secret = Read-Host 'Oracle password (hidden)' -AsSecureString
if ($secret.Length -eq 0) { throw 'Empty password is not allowed.' }
$secret | Export-Clixml -LiteralPath (Join-Path $SecretDirectory 'oracle.xml')
Write-Host 'Saved using Windows DPAPI. Only this Windows user on this server can decrypt it.'
