import https from 'node:https';
import fs from 'node:fs';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

download('https://helaholly.com/wp-content/uploads/2026/01/Volkswagen-Heavy.otf', './public/Volkswagen-Heavy.otf')
  .then(() => console.log('Downloaded Volkswagen-Heavy.otf'))
  .catch(console.error);

download('https://helaholly.com/wp-content/uploads/2026/01/Futura-Bk-BT-Book.ttf', './public/Futura-Bk-BT-Book.ttf')
  .then(() => console.log('Downloaded Futura-Bk-BT-Book.ttf'))
  .catch(console.error);
