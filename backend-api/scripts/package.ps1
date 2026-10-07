# Builds lambda.zip for upload in the AWS Lambda console.
# Uses Windows' bundled bsdtar (not Git Bash's GNU tar, and not Compress-Archive,
# which writes backslash paths that Lambda's Linux runtime can't resolve).
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Remove-Item lambda.zip -ErrorAction SilentlyContinue
& "$env:SystemRoot\System32\tar.exe" -a -c -f lambda.zip package.json index.mjs src node_modules
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$sizeMb = [math]::Round((Get-Item lambda.zip).Length / 1MB, 1)
Write-Host "Created lambda.zip ($sizeMb MB)"
