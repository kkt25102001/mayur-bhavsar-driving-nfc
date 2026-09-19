const fs = require('fs');
const path = require('path');

const src = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/787f4428-f777-4387-ab5e-28b27011dc47/.user_uploaded/media_1789801642486.png';
const destDir = 'C:/Users/LENOVO/.gemini/antigravity-ide/scratch/mayur-bhavsar-driving-nfc/assets';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, path.join(destDir, 'logo.png'));
const b64 = fs.readFileSync(src).toString('base64');
fs.writeFileSync(path.join(destDir, 'logo_b64.js'), 'window.BRAND_LOGO_B64 = "data:image/png;base64,' + b64 + '";\n');

console.log('Logo copied successfully! Size:', fs.statSync(path.join(destDir, 'logo.png')).size);
