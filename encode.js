import fs from 'fs';
const base64 = fs.readFileSync('public/logo_holly.png', 'base64');
console.log(`data:image/png;base64,${base64.substring(0, 50)}...`); // Just checking if it works
fs.writeFileSync('logo_base64.txt', `data:image/png;base64,${base64}`);
