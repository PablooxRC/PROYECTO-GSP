# monitor.ps1

function Monitor-Services {
    Clear-Host
    Write-Host "===== $(Get-Date -Format 'HH:mm:ss') =====" -ForegroundColor Cyan

    # Node.js
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "node*" }
    if ($nodeProcesses) {
        Write-Host "`nNode.js Processes:" -ForegroundColor Green
        $nodeProcesses | ForEach-Object {
            Write-Host ("PID: {0} | CPU: {1:N2}% | Memory: {2:N2} MB" -f $_.Id, $_.CPU, ($_.WorkingSet/1MB))
        }
    } else {
        Write-Host "`nNode.js Processes: Not running" -ForegroundColor Red
    }

    # PostgreSQL
    $pgProcesses = Get-Process | Where-Object { $_.ProcessName -like "postgres*" }
    if ($pgProcesses) {
        Write-Host "`nPostgreSQL Processes:" -ForegroundColor Green
        $pgProcesses | ForEach-Object {
            Write-Host ("PID: {0} | CPU: {1:N2}% | Memory: {2:N2} MB" -f $_.Id, $_.CPU, ($_.WorkingSet/1MB))
        }
    } else {
        Write-Host "`nPostgreSQL Processes: Not running" -ForegroundColor Red
    }
}

# Ejecuta cada 2 segundos
while ($true) {
    Monitor-Services
    Start-Sleep -Seconds 2
}
