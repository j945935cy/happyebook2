param(
  [int]$MaxWidth = 900,
  [int]$Quality = 86,
  [double]$MinMB = 2.0
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$booksPath = Join-Path $root "src\books.json"
$books = Get-Content -LiteralPath $booksPath -Raw -Encoding UTF8 | ConvertFrom-Json

Add-Type -AssemblyName System.Drawing

function Get-LocalPath([string]$coverPath) {
  if ([string]::IsNullOrWhiteSpace($coverPath)) {
    return $null
  }
  if ($coverPath -match '^https?://') {
    return $null
  }
  $normalized = $coverPath -replace '^(\.\./)+', '' -replace '^\./', ''
  return Join-Path $root $normalized
}

function Save-Jpeg($sourcePath, $destinationPath, $maxWidth, $quality) {
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $scale = 1.0
    if ($source.Width -gt $maxWidth) {
      $scale = $maxWidth / $source.Width
    }

    $width = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
    $height = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.DrawImage($source, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }

      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq "image/jpeg" } |
        Select-Object -First 1
      $encoder = [System.Drawing.Imaging.Encoder]::Quality
      $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
      $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([int64]$quality)
      $bitmap.Save($destinationPath, $codec, $encoderParams)
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

function Get-RelativePathText($basePath, $targetPath) {
  $base = (Resolve-Path -LiteralPath $basePath).Path.TrimEnd("\", "/")
  $target = (Resolve-Path -LiteralPath $targetPath).Path
  if ($target.StartsWith($base, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $target.Substring($base.Length).TrimStart("\", "/").Replace("\", "/")
  }
  return $target.Replace("\", "/")
}

$seen = @{}
$coverUpdates = @{}
$results = @()

foreach ($book in $books) {
  $sourcePath = Get-LocalPath $book.cover
  if (-not $sourcePath -or -not (Test-Path -LiteralPath $sourcePath)) {
    continue
  }

  $sourceItem = Get-Item -LiteralPath $sourcePath
  if ($sourceItem.Length -lt ($MinMB * 1MB)) {
    continue
  }

  if ($seen.ContainsKey($sourceItem.FullName)) {
    continue
  }
  $seen[$sourceItem.FullName] = $true

  $destinationPath = Join-Path $sourceItem.DirectoryName ($sourceItem.BaseName + "-site.jpg")
  Save-Jpeg $sourceItem.FullName $destinationPath $MaxWidth $Quality
  $destinationItem = Get-Item -LiteralPath $destinationPath

  $relativeSource = Get-RelativePathText $root $sourceItem.FullName
  $relativeDestination = Get-RelativePathText $root $destinationItem.FullName
  $coverUpdates[$relativeSource] = $relativeDestination

  $results += [PSCustomObject]@{
    Source = $relativeSource
    Optimized = $relativeDestination
    BeforeMB = [Math]::Round($sourceItem.Length / 1MB, 2)
    AfterMB = [Math]::Round($destinationItem.Length / 1MB, 2)
  }
}

if ($results.Count -eq 0) {
  Write-Host "No referenced book covers larger than $MinMB MB."
  exit 0
}

$results | Format-Table -AutoSize

$booksRaw = [IO.File]::ReadAllText($booksPath)
foreach ($sourceCover in $coverUpdates.Keys) {
  $optimizedCover = $coverUpdates[$sourceCover]
  $booksRaw = $booksRaw.Replace('"' + $sourceCover + '"', '"' + $optimizedCover + '"')
}
[IO.File]::WriteAllText($booksPath, $booksRaw, (New-Object System.Text.UTF8Encoding($false)))

$updatedPages = 0
foreach ($book in $books) {
  $originalCover = [string]$book.cover
  if (-not $coverUpdates.ContainsKey($originalCover)) { continue }
  $pagePath = Join-Path $root ("books\" + $book.id + ".html")
  if (-not (Test-Path -LiteralPath $pagePath)) { continue }
  $pageText = [IO.File]::ReadAllText($pagePath)
  $newPageText = $pageText.Replace("../" + $originalCover, "../" + $coverUpdates[$originalCover])
  if ($newPageText -ne $pageText) {
    [IO.File]::WriteAllText($pagePath, $newPageText, (New-Object System.Text.UTF8Encoding($false)))
    $updatedPages += 1
  }
}

$beforeTotal = ($results | Measure-Object -Property BeforeMB -Sum).Sum
$afterTotal = ($results | Measure-Object -Property AfterMB -Sum).Sum
Write-Host ("Updated {0} cover records and {1} book pages. Referenced size: {2:N2} MB -> {3:N2} MB." -f $coverUpdates.Count, $updatedPages, $beforeTotal, $afterTotal)
