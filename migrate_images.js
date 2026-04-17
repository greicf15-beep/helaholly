import fs from 'fs';
import path from 'path';

// 1. Move files
fs.mkdirSync('src/assets/images', { recursive: true });
const files = fs.readdirSync('public').filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'));

files.forEach(f => {
  fs.renameSync(path.join('public', f), path.join('src/assets/images', f));
});

// 2. Rewrite constants.ts
let constants = fs.readFileSync('src/constants.ts', 'utf-8');
let imports = '';

files.forEach(f => {
  const varName = f.replace(/[^a-zA-Z0-9]/g, '_');
  imports += `import img_${varName} from './assets/images/${f}';\n`;
  
  // Replace references like image: '/filename.webp' or '/filename.png'
  const escapedFile = f.replace(/\./g, '\\.');
  const regex = new RegExp(`image:\\s*['"\`]\/${escapedFile}['"\`]`, 'g');
  constants = constants.replace(regex, `image: img_${varName}`);
});

fs.writeFileSync('src/constants.ts', imports + '\n' + constants);
console.log('Migration complete');
