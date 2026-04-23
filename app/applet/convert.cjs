const fs = require('fs');
const { Font } = require('fonteditor-core');

try {
    // OTF to WOFF2
    const buffer1 = fs.readFileSync('src/assets/fonts/Volkswagen-Heavy.otf');
    const font1 = Font.create(buffer1, {
        type: 'otf'
    });
    
    // Convert to WOFF2
    const woff2Buffer1 = font1.write({
        type: 'woff2'
    });
    fs.writeFileSync('src/assets/fonts/Volkswagen-Heavy.woff2', woff2Buffer1);
    
    // TTF to WOFF2
    const buffer2 = fs.readFileSync('src/assets/fonts/Futura-Bk-BT-Book.ttf');
    const font2 = Font.create(buffer2, {
        type: 'ttf'
    });
    const woff2Buffer2 = font2.write({
        type: 'woff2'
    });
    fs.writeFileSync('src/assets/fonts/Futura.woff2', woff2Buffer2);

    console.log("Conversion successful");
} catch (e) {
    console.error("Error during conversion:");
    console.error(e);
}
