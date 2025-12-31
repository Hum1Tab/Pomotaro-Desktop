Add-Type -AssemblyName System.Drawing
$src = "icon.png"
$dest = "icon.ico"
$size = 256

if (-not (Test-Path $src)) {
    Write-Error "Source file $src not found!"
    exit 1
}

try {
    $img = [System.Drawing.Image]::FromFile($src)
    
    # Calculate aspect ratio
    $ratio = $img.Width / $img.Height
    $newWidth = $size
    $newHeight = $size
    $offsetX = 0
    $offsetY = 0

    if ($ratio > 1) {
        # Wider than tall
        $newHeight = [int]($size / $ratio)
        $offsetY = [int](($size - $newHeight) / 2)
    }
    else {
        # Taller than wide
        $newWidth = [int]($size * $ratio)
        $offsetX = [int](($size - $newWidth) / 2)
    }

    $resized = new-object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Draw transparent background
    $g.Clear([System.Drawing.Color]::Transparent)

    # Draw image centered
    $g.DrawImage($img, $offsetX, $offsetY, $newWidth, $newHeight)
    
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
    
    Write-Host "Success: Generated $dest with aspect ratio preserved."
}
catch {
    Write-Error "Failed to generate icon: $_"
    exit 1
}
