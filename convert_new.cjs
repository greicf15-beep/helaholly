const fs = require('fs');
const { Font } = require('fonteditor-core');

try {
    const buffer1 = fs.readFileSync('downloaded.otf');
    console.log("Original size:", buffer1.length);
    
    // Check if it parses correctly now
    const font1 = Font.create(buffer1, {
        type: 'otf'
    });
    
    // Convert to WOFF2
    const woff2Buffer1 = font1.write({
        type: 'woff2'
    });
    fs.writeFileSync('src/assets/fonts/Volkswagen-Heavy.woff2', woff2Buffer1);
    
    // Overwrite the broken OTF while we're at it
    fs.writeFileSync('src/assets/fonts/Volkswagen-Heavy.otf', buffer1);

    console.log("Success. WOFF2 size:", woff2Buffer1.length);
} catch (e) {
    console.error("Error during conversion:", e);
}
