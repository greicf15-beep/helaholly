import https from 'https';

const urls = [
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/volkswagen-heavy.woff',
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/volkswagenheavy.woff',
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/VolkswagenHeavy.woff',
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/Volkswagen-Heavy.ttf',
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/volkswagen-heavy.ttf',
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/Volkswagen Heavy.otf',
    'https://helaholly.com/wp-content/themes/cinematica-hollywood-theme/assets/fonts/Volkswagen%20Heavy.otf'
];

urls.forEach(url => {
    https.request(url, {method: 'HEAD'}, (res) => {
        if(res.statusCode === 200) {
            console.log(`FOUND: ${url}`);
        }
    }).end();
});
