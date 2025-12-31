Add-Type -AssemblyName System.Drawing
$src = "icon.png"
$dest = "icon.ico"

if (-not (Test-Path $src)) {
    Write-Error "Source file $src not found!"
    exit 1
}

try {
    $img = [System.Drawing.Image]::FromFile($src)
    $resized = new-object System.Drawing.Bitmap(256, 256)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, 256, 256)
    
    # Create Icon from bitmap handle
    $hIcon = $resized.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    
    # Save to file
    $fs = New-Object System.IO.FileStream($dest, [System.IO.FileMode]::Create)
    $icon.Save($fs)
    $fs.Close()
    
    # Cleanup
    [System.Runtime.InteropServices.Marshal]::DestroyIcon($hIcon) | Out-Null
    $icon.Dispose()
    $g.Dispose()
    $resized.Dispose()
    $img.Dispose()
    
    Write-Host "Success: Generated $dest"
} catch {
    Write-Error "Failed to generate icon: $_"
    exit 1
}
