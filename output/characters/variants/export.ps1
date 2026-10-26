Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class SpriteExports {
 public static string Export(string src,string dst,string basePath) {
  using(var original=Image.FromFile(src))
  using(var result=new Bitmap(1024,1024,PixelFormat.Format24bppRgb)) {
   using(var g=Graphics.FromImage(result)) {
    g.Clear(Color.Magenta);
    g.InterpolationMode=InterpolationMode.HighQualityBicubic;
    g.DrawImage(original,0,0,1024,1024);
   }
   int normalized=0;
   for(int y=0;y<1024;y++) for(int x=0;x<1024;x++) {
    var c=result.GetPixel(x,y);
    if(c.R>180 && c.B>180 && c.G<110) {result.SetPixel(x,y,Color.Magenta); normalized++;}
   }
   result.Save(dst,ImageFormat.Png);
   using(var b=new Bitmap(basePath)) {
    int union=0,intersection=0,maskdiff=0;
    for(int y=0;y<1024;y++) for(int x=0;x<1024;x++) {
     bool a=result.GetPixel(x,y).ToArgb()!=Color.Magenta.ToArgb();
     bool bb=b.GetPixel(x,y).ToArgb()!=Color.Magenta.ToArgb();
     if(a||bb) union++;
     if(a&&bb) intersection++;
     if(a!=bb) maskdiff++;
    }
    return String.Format("{0},{1},{2:F6}",normalized,maskdiff,(double)intersection/union);
   }
  }
 }
}
'@
$variantDir = $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $variantDir 'generated-sources.json') -Raw | ConvertFrom-Json
$jobs = Get-Content -LiteralPath (Join-Path $variantDir 'prompts.json') -Raw | ConvertFrom-Json
$report = @('filename,width,height,normalized_background_pixels,silhouette_different_pixels,silhouette_IoU')
foreach ($entry in $manifest) {
 $job = $jobs | Where-Object { $_.name -eq $entry.name }
 $dest = Join-Path $variantDir ($entry.name + '.png')
 $stats = [SpriteExports]::Export($entry.path,$dest,$job.base)
 $report += $entry.name + '.png,1024,1024,' + $stats
 Write-Output ($entry.name + ': ' + $stats)
}
$report | Set-Content -LiteralPath (Join-Path $variantDir 'validation.csv') -Encoding UTF8
