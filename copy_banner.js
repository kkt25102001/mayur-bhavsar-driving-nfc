const fs = require('fs');
const path = require('path');

const src = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/732f844a-ca89-4232-921e-98b361b05d0a/hero_banner_1789975413680.jpg';
const destDir = 'C:/Users/LENOVO/.gemini/antigravity-ide/scratch/mayur-bhavsar-driving-nfc/assets';

if (fs.existsSync(src)) {
  fs.copyFileSync(src, path.join(destDir, 'hero_banner.jpg'));
  const b64 = fs.readFileSync(src).toString('base64');
  fs.writeFileSync(path.join(destDir, 'hero_banner_b64.js'), 'window.HERO_BANNER_B64 = "data:image/jpeg;base64,' + b64 + '";\n');
  console.log('Hero banner copied successfully!');
} else {
  console.log('Banner source not found');
}
