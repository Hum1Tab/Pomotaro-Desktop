Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("icon.png")
Write-Host "Width: $($img.Width)"
Write-Host "Height: $($img.Height)"
$img.Dispose()
