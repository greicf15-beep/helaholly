import fs from 'fs';
const base64 = fs.readFileSync('public/logo_holly.png', 'base64');
fs.writeFileSync('src/logoBase64.ts', `export const logoBase64 = "data:image/png;base64,${base64}";\n`);
