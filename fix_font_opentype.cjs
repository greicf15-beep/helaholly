const opentype = require('opentype.js');
const fs = require('fs');

opentype.load('src/assets/fonts/Volkswagen-Heavy.otf', function(err, font) {
    if (err) {
        console.error('Could not load font: ' + err);
    } else {
        console.log('Font loaded successfully. Glyphs:', font.glyphs.length);
        const buffer = Buffer.from(font.toArrayBuffer());
        fs.writeFileSync('src/assets/fonts/Volkswagen-Heavy-Fixed.ttf', buffer);
        console.log('Saved as TTF');
    }
});

// Also fix Futura just in case
opentype.load('src/assets/fonts/Futura-Bk-BT-Book.ttf', function(err, font) {
    if (err) {
        console.error('Could not load Futura: ' + err);
    } else {
        const buffer = Buffer.from(font.toArrayBuffer());
        fs.writeFileSync('src/assets/fonts/Futura-Fixed.ttf', buffer);
        console.log('Futura saved as TTF');
    }
});
