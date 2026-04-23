const opentype = require('opentype.js');
const fs = require('fs');

const buffer = fs.readFileSync('src/assets/fonts/Volkswagen-Heavy.otf');
const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

try {
    const font = opentype.parse(ab);
    console.log('PostScript Name:', font.names.postScriptName.en);
    console.log('Full Name:', font.names.fullName.en);
    console.log('Font Family:', font.names.fontFamily.en);
    console.log('Font Subfamily:', font.names.fontSubfamily.en);
} catch (err) {
    console.error('Error parsing:', err);
}
