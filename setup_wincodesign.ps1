$ErrorActionPreference = "Stop"
$CacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$SevenZipPath = "$PWD\node_modules\7zip-bin\win\x64\7za.exe"
$Url = "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"
$ArchiveFile = "$CacheDir\winCodeSign-2.6.0.7z"
$TargetDir = "$CacheDir\winCodeSign-2.6.0"

# Create cache directory
if (!(Test-Path $CacheDir)) {
    New-Item -ItemType Directory -Path $CacheDir | Out-Null
    Write-Host "Created cache directory: $CacheDir"
}

# Download file
Write-Host "Downloading winCodeSign..."
Invoke-WebRequest -Uri $Url -OutFile $ArchiveFile
Write-Host "Downloaded to $ArchiveFile"

# Extract excluding darwin (symlinks)
# Using -os to extract to specific directory
Write-Host "Extracting..."
& $SevenZipPath x $ArchiveFile "-o$TargetDir" -xr!darwin -y

Write-Host "Extraction complete."
