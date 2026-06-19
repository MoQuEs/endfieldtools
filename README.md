# Arknights: Endfield Hub

An hub for tools for Arknights: Endfield. Mainly as a storage for tools I use.

## Tools
- `index.html` — home page / tool hub
- `essencetracker/` — weapon essence tracker
- `randomizer/` — placeholder for future tools

## Scripts
- `download.js` - half automated script to download images from wiki
- `downloadSvgToPng.js` - download an SVG from URL, convert to PNG at a fixed size, and save with a specific filename
- `copyData.js` + `copyData.json` - script to copy JSON + IMG from scripts dir to every tool. It is used as main storage to avoid having to copy data manually to every tool.

### SVG to PNG helper

Install dependencies:

```powershell
npm install
```

Run:

```powershell
node .\scripts\downloadSvgToPng.js <svg-url> <output-name> <width> <height> [--out-dir=<dir>] [--force]
```

Example:

```powershell
node .\scripts\downloadSvgToPng.js https://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg sample_logo.png 256 256 --out-dir=.\scripts\images\icons --force
npm svg:png https://endfield.wiki.gg/images/Edit_Thrill_I_icon.svg 256 256 --out-dir=.\scripts\images\cc\ --suffix=tag_ --force
```

