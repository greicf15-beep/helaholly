const fs = require('fs');

const vwOtf = fs.readFileSync('src/assets/fonts/Volkswagen-Heavy.otf').toString('base64');
const futuraTtf = fs.readFileSync('src/assets/fonts/Futura-Bk-BT-Book.ttf').toString('base64');

const vwPrefix = 'data:font/otf;charset=utf-8;base64,';
const futuraPrefix = 'data:font/ttf;charset=utf-8;base64,';

let css = fs.readFileSync('src/index.css', 'utf-8');

const regex = /@layer base \{\s*@font-face[\s\S]*?\}(?=\s*@theme)/;

const replacements = `@layer base {

@font-face {
  font-family: 'VolkswagenHeavy';
  src: url('${vwPrefix}${vwOtf}') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'VolkswagenHeavy';
  src: url('${vwPrefix}${vwOtf}') format('opentype');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'FuturaBkBTBook';
  src: url('${futuraPrefix}${futuraTtf}') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'FuturaBkBTBook';
  src: url('${futuraPrefix}${futuraTtf}') format('truetype');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

}
`;

css = css.replace(regex, replacements);
fs.writeFileSync('src/index.css', css);
console.log('Replaced with base64');
