Add-Type -AssemblyName System.Drawing
$src = "icon.png"
$dest = "icon_256.png"
$size = 256

if (-not (Test-Path $src)) {
    Write-Error "Source file $src not found!"
    exit 1
}

try {
    $img = [System.Drawing.Image]::FromFile($src)
    
    # Create empty bitmap with 32-bit ARGB (preserves transparency)
    $resized = new-object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $resized.SetResolution($img.HorizontalResolution, $img.VerticalResolution)

    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # IMPORTANT: Clear with transparent color
    $g.Clear([System.Drawing.Color]::Transparent)

    $g.DrawImage($img, 
        (New-Object System.Drawing.Rectangle(0, 0, $size, $size)),
        (New-Object System.Drawing.Rectangle(0, 0, $img.Width, $img.Height)),
        [System.Drawing.GraphicsUnit]::Pixel)

    $resized.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $resized.Dispose()
    $img.Dispose()
    
    Write-Host "Success: Created $dest (256x256) with transparency."
}
catch {
    Write-Error "Failed to resize: $_"
    exit 1
}
