import https from 'https';
import fs from 'fs';

const url = 'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/Volkswagen-Heavy.otf';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://helaholly.com/',
    'Accept': 'font/otf,font/ttf,application/font-otf,*/*;q=0.8'
  }
};

https.get(url, options, (res) => {
    console.log("Status:", res.statusCode);
    let rawData = [];
    res.on('data', (chunk) => rawData.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(rawData);
        fs.writeFileSync('downloaded2.otf', buffer);
        console.log('Downloaded size: ', buffer.length);
        console.log('Hex:', buffer.toString('hex').substring(0, 16));
    });
});
