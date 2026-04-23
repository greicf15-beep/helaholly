import https from 'https';
import fs from 'fs';

const url = 'https://fonts.cdnfonts.com/css/volkswagen-serial';

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        console.log("vw-serial:", rawData);
    });
});
