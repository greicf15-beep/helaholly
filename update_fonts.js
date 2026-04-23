import fs from 'node:fs';

const vwFont = fs.readFileSync('public/Volkswagen-Heavy.otf');
const vwBase64 = vwFont.toString('base64');

const futuraFont = fs.readFileSync('public/Futura-Bk-BT-Book.ttf');
const futuraBase64 = futuraFont.toString('base64');

const vwCss = `  @font-face {
    font-family: 'VolkswagenHeavy';
    src: url('data:font/otf;base64,${vwBase64}') format('opentype');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }`;

const futuraCss = `  @font-face {
    font-family: 'FuturaBkBTBook';
    src: url('data:font/ttf;base64,${futuraBase64}') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }`;

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/@font-face\s*{\s*font-family:\s*'VolkswagenHeavy';[\s\S]*?}/, vwCss);
css = css.replace(/@font-face\s*{\s*font-family:\s*'FuturaBkBTBook';[\s\S]*?}/, futuraCss);

fs.writeFileSync('src/index.css', css);
console.log('CSS updated successfully with base64 fonts');
