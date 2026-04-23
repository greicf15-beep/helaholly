import https from 'https';
import fs from 'fs';

const url = 'https://db.onlinewebfonts.com/t/2db4a50d2bb5daaaa8cecaaa049ebc90.woff2';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://www.onlinewebfonts.com/',
  }
};

https.get(url, options, (res) => {
    let rawData = [];
    res.on('data', (chunk) => rawData.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(rawData);
        if (buffer.length > 5000) {
           fs.writeFileSync('src/assets/fonts/Volkswagen-Heavy.woff2', buffer);
           console.log('Successfully downloaded WOFF2. Size:', buffer.length);
        } else {
           console.log('Failed:', res.statusCode, buffer.toString());
        }
    });
});
