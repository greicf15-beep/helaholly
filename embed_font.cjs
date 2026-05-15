const fs = require('fs');

const css = fs.readFileSync('src/index.css', 'utf8');
const otfBuffer = fs.readFileSync('src/assets/fonts/Volkswagen-Heavy.otf');
const b64 = otfBuffer.toString('base64');
const dataUrl = `url('data:font/otf;charset=utf-8;base64,${b64}') format('opentype')`;

let newCss = css.replace(/url\('\.\/assets\/fonts\/Volkswagen-Heavy\.otf'\)\s+format\('opentype'\)/g, dataUrl);
fs.writeFileSync('src/index.css', newCss);
