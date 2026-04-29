const fs = require('fs');
const files = fs.readdirSync('./src/assets/fonts');
for (const file of files) {
  const stats = fs.statSync(`./src/assets/fonts/${file}`);
  console.log(`${file}: ${stats.size} bytes`);
}
