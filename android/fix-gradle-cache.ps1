# Fix "Could not read workspace metadata from ... transforms\...\metadata.bin"
# Run from project root or android folder: .\android\fix-gradle-cache.ps1

Write-Host "Stopping Gradle daemon..."
Set-Location $PSScriptRoot
.\gradlew.bat --stop 2>$null

$userGradle = "$env:USERPROFILE\.gradle"
$transformPath = "$userGradle\caches\8.13\transforms\3ee1d435525602d523f51e4331b7b9fb"

if (Test-Path $transformPath) {
    Remove-Item -Recurse -Force $transformPath
    Write-Host "Removed bad transform folder."
}

if (Test-Path ".gradle") {
    Remove-Item -Recurse -Force ".gradle"
    Write-Host "Removed project .gradle folder."
}

Write-Host "Done. Run: yarn android"
Set-Location ..
