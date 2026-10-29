$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

if (-not (Test-Path (Join-Path $backend '.venv\Scripts\python.exe'))) {
  throw 'Backend environment missing. Create backend\.venv first (see README.md).'
}
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
  throw 'Frontend dependencies missing. Run npm install inside frontend first.'
}

$apiCommand = '$env:PYTHONPATH="."; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000'
$uiCommand = 'npm run dev -- --host 0.0.0.0'
Start-Process powershell.exe -WorkingDirectory $backend -ArgumentList @('-NoExit', '-Command', $apiCommand)
Start-Process powershell.exe -WorkingDirectory $frontend -ArgumentList @('-NoExit', '-Command', $uiCommand)
Start-Sleep -Seconds 2
Start-Process 'http://localhost:5173'
Write-Host 'GhostTrace started. Frontend: http://localhost:5173  API: http://localhost:8000/docs'
