Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $p.AddArc($x,       $y,       $d, $d, 180, 90)
    $p.AddArc($x+$w-$d, $y,       $d, $d, 270, 90)
    $p.AddArc($x+$w-$d, $y+$h-$d, $d, $d, 0,   90)
    $p.AddArc($x,       $y+$h-$d, $d, $d, 90,  90)
    $p.CloseFigure()
    return $p
}

function Draw-Icon([System.Drawing.Graphics]$g, [int]$sz, [bool]$adaptive) {
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $pad  = if ($adaptive) { [int]($sz * 0.20) } else { [int]($sz * 0.11) }
    $dw   = [float]($sz - 2*$pad)
    $dh   = [float]($sz - 2*$pad)
    $ox   = [float]$pad
    $oy   = [float]$pad

    $barW     = [float]($dw * 0.215)
    $barGap   = [float]($dw * 0.095)
    $totalW   = 3*$barW + 2*$barGap
    $bx0      = $ox + ($dw - $totalW) / 2.0
    $baseline = $oy + $dh * 0.87
    $maxH     = $dh * 0.76
    $heights  = @(0.37, 0.63, 0.94)

    $skyTop = [System.Drawing.Color]::FromArgb(255, 147, 216, 255)
    $skyMid = [System.Drawing.Color]::FromArgb(255,  56, 189, 248)
    $skyBot = [System.Drawing.Color]::FromArgb(255,   2, 112, 168)

    for ($i = 0; $i -lt 3; $i++) {
        $bx = [float]($bx0 + $i * ($barW + $barGap))
        $bh = [float]($maxH * $heights[$i])
        $by = [float]($baseline - $bh)
        $r  = [float]([Math]::Min($barW * 0.30, $bh * 0.45))
        $topC = if ($i -eq 2) { $skyTop } else { $skyMid }

        $grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            [System.Drawing.PointF]::new($bx, $by),
            [System.Drawing.PointF]::new($bx, $baseline),
            $topC, $skyBot
        )
        $bp = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $bp.AddArc($bx,            $by, $r*2, $r*2, 180, 90)
        $bp.AddArc($bx+$barW-$r*2, $by, $r*2, $r*2, 270, 90)
        $bp.AddLine($bx+$barW, $by+$r, $bx+$barW, $baseline)
        $bp.AddLine($bx+$barW, $baseline, $bx, $baseline)
        $bp.AddLine($bx, $baseline, $bx, $by+$r)
        $bp.CloseFigure()
        $g.FillPath($grad, $bp)

        $sheenH = [float]([Math]::Max(2.0, $bh * 0.22))
        $sheenG = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            [System.Drawing.PointF]::new($bx, $by),
            [System.Drawing.PointF]::new($bx, $by + $sheenH),
            [System.Drawing.Color]::FromArgb(100, 255, 255, 255),
            [System.Drawing.Color]::FromArgb(0,   255, 255, 255)
        )
        $sp = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $sp.AddArc($bx,            $by, $r*2, $r*2, 180, 90)
        $sp.AddArc($bx+$barW-$r*2, $by, $r*2, $r*2, 270, 90)
        $sp.AddLine($bx+$barW, $by+$r, $bx+$barW, $by+$sheenH)
        $sp.AddLine($bx+$barW, $by+$sheenH, $bx, $by+$sheenH)
        $sp.AddLine($bx, $by+$sheenH, $bx, $by+$r)
        $sp.CloseFigure()
        $g.FillPath($sheenG, $sp)
        $grad.Dispose(); $bp.Dispose(); $sheenG.Dispose(); $sp.Dispose()
    }

    # Baseline bar
    $blB = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(80, 56, 189, 248))
    $g.FillRectangle($blB, $ox, $baseline, $dw, [float]([Math]::Max(1.0, $sz*0.012)))
    $blB.Dispose()

    # Trend line
    $cx = [float[]]@(0,0,0)
    $cy = [float[]]@(0,0,0)
    for ($i = 0; $i -lt 3; $i++) {
        $cx[$i] = [float]($bx0 + $i * ($barW + $barGap) + $barW * 0.5)
        $cy[$i] = [float]($baseline - $maxH * $heights[$i])
    }
    $tipX = [float]($cx[2] + $barW * 0.70)
    $tipY = [float]($cy[2] - $maxH * 0.10)
    $dx   = $tipX - $cx[0]
    $lw   = [float]([Math]::Max(2.0, $sz * 0.030))
    $em   = [System.Drawing.Color]::FromArgb(255, 52, 211, 153)

    $tp = [System.Drawing.Pen]::new($em, $lw)
    $tp.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $tp.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawBezier($tp, [float]$cx[0], [float]$cy[0],
        [float]($cx[0]+$dx*0.33), [float]$cy[0],
        [float]($cx[0]+$dx*0.67), [float]$tipY,
        $tipX, $tipY)

    $nearX = [float]($cx[0]+$dx*0.82)
    $nearY = [float]($cy[0]+($tipY-$cy[0])*0.85)
    $ang   = [Math]::Atan2($tipY - $nearY, $tipX - $nearX)
    $as    = [float]([Math]::Max(3.0, $sz * 0.050))
    $a1x   = [float]($tipX - $as * [Math]::Cos($ang - 0.50))
    $a1y   = [float]($tipY - $as * [Math]::Sin($ang - 0.50))
    $a2x   = [float]($tipX - $as * [Math]::Cos($ang + 0.50))
    $a2y   = [float]($tipY - $as * [Math]::Sin($ang + 0.50))
    $g.DrawLine($tp, $a1x, $a1y, $tipX, $tipY)
    $g.DrawLine($tp, $a2x, $a2y, $tipX, $tipY)

    $dr = [float]($lw * 1.6)
    $db = [System.Drawing.SolidBrush]::new($em)
    $g.FillEllipse($db, $tipX-$dr, $tipY-$dr, $dr*2, $dr*2)
    $db.Dispose(); $tp.Dispose()
}

function New-FgBmp([int]$sz) {
    $bmp = [System.Drawing.Bitmap]::new($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    Draw-Icon $g $sz $true
    $g.Dispose()
    return $bmp
}

function New-LauncherBmp([int]$sz, [bool]$round) {
    $bmp = [System.Drawing.Bitmap]::new($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode   = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $bgB = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 13, 17, 24))
    if ($round) {
        $g.FillEllipse($bgB, 0, 0, $sz-1, $sz-1)
    } else {
        $rr   = [float]([int]($sz * 0.22))
        $path = New-RoundedRectPath 0.0 0.0 ([float]$sz) ([float]$sz) $rr
        $g.FillPath($bgB, $path); $path.Dispose()
    }
    $bgB.Dispose()
    Draw-Icon $g $sz $false
    $g.Dispose()
    return $bmp
}

$res = "c:\Users\User\Desktop\Programming\budget-tracker\android\app\src\main\res"

$fgSizes = [ordered]@{ "mipmap-mdpi"=108; "mipmap-hdpi"=162; "mipmap-xhdpi"=216; "mipmap-xxhdpi"=324; "mipmap-xxxhdpi"=432 }
$lgSizes = [ordered]@{ "mipmap-mdpi"=48;  "mipmap-hdpi"=72;  "mipmap-xhdpi"=96;  "mipmap-xxhdpi"=144; "mipmap-xxxhdpi"=192 }

Write-Host "Generating adaptive foreground icons..."
foreach ($d in $fgSizes.Keys) {
    $sz  = $fgSizes[$d]; $bmp = New-FgBmp $sz
    $bmp.Save("$res\$d\ic_launcher_foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose(); Write-Host "  OK  $d  ${sz}x$sz"
}

Write-Host "Generating legacy launcher icons..."
foreach ($d in $lgSizes.Keys) {
    $sz = $lgSizes[$d]
    $bmp = New-LauncherBmp $sz $false
    $bmp.Save("$res\$d\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $bmp = New-LauncherBmp $sz $true
    $bmp.Save("$res\$d\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "  OK  $d  ${sz}x$sz"
}

Write-Host "Done!"
