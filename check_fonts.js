import https from 'https';

const formats = ['woff', 'woff2', 'ttf'];
const baseUrl = 'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/Volkswagen-Heavy.';

formats.forEach(ext => {
    https.request(baseUrl + ext, {method: 'HEAD'}, (res) => {
        console.log(`.${ext}: ${res.statusCode}`);
    }).end();
});
