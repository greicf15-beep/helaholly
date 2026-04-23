const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Strip out current @font-face blocks (the giant base64 ones)
css = css.replace(/@font-face\s*\{[^}]+\}/g, '');

const newFonts = `

@layer base {

@font-face {
  font-family: 'VolkswagenHeavy';
  src: url('/Volkswagen-Heavy.otf') format('opentype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'FuturaBkBTBook';
  src: url('/Futura-Bk-BT-Book.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

}
`;

// Insert the new fonts
css = css.replace('@import "tailwindcss";', '@import "tailwindcss";' + newFonts);

fs.writeFileSync('src/index.css', css);
console.log("CSS fixed");
