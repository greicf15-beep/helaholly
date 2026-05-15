const fs = require('fs');
const woffBuffer = fs.readFileSync('public/fonts/VolkswagenHeavy.woff');
const b64 = woffBuffer.toString('base64');
const css = `@font-face {
  font-family: 'VolkswagenHeavy';
  src: url(data:font/woff;charset=utf-8;base64,${b64}) format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'VolkswagenHeavy';
  src: url(data:font/woff;charset=utf-8;base64,${b64}) format('woff');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}`;
fs.writeFileSync('src/fonts.css', css);
