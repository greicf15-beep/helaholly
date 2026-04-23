import https from 'https';
import fs from 'fs';

const url = 'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/Volkswagen-Heavy.otf';

https.get(url, (res) => {
    let rawData = [];
    res.on('data', (chunk) => rawData.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(rawData);
        fs.writeFileSync('downloaded.otf', buffer);
        console.log('Downloaded size: ', buffer.length);
    });
});
