const fs = require('fs');
const { Font } = require('fonteditor-core');

try {
    const buffer = fs.readFileSync('./src/assets/fonts/Volkswagen-Heavy-Final.otf');
    const font = Font.create(buffer, {
        type: 'otf'
    });

    // Write to TTF
    const ttfBuffer = font.write({
        type: 'ttf',
        hinting: true
    });
    fs.writeFileSync('./src/assets/fonts/volkswagen-heavy-webfont.ttf', ttfBuffer);
    console.log('Successfully generated TTF');

    // Write to WOFF
    const woffBuffer = font.write({
        type: 'woff',
        hinting: true
    });
    fs.writeFileSync('./src/assets/fonts/volkswagen-heavy-webfont.woff', woffBuffer);
    console.log('Successfully generated WOFF');

} catch(e) {
    console.error('Error generating font:', e);
}
