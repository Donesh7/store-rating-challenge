$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:TEMP = Join-Path $PSScriptRoot '.cache'
$env:TMP = $env:TEMP
$env:DEMO_DB = '1'
$env:DEMO_DATA_DIR = Join-Path $PSScriptRoot '.data/postgres'
$env:SEED_PASSWORD = 'Welcome@123'
if (!(Test-Path -LiteralPath 'node_modules')) {
    npm install --offline=false --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
}
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
Write-Host 'Open http://localhost:3001. Press Ctrl+C to stop.'
npm start
