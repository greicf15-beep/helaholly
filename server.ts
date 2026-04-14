import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');
    
    console.log(`--- Debug Info ---`);
    console.log(`Current Working Directory: ${process.cwd()}`);
    console.log(`Files in CWD: ${fs.readdirSync(process.cwd()).join(', ')}`);
    
    if (fs.existsSync(distPath)) {
      console.log(`'dist' folder found at: ${distPath}`);
      console.log(`Files in 'dist': ${fs.readdirSync(distPath).slice(0, 5).join(', ')}...`);
      app.use(express.static(distPath, {
        maxAge: '1d',
        index: false
      }));
    } else {
      console.warn(`'dist' folder NOT found. Falling back to 'public' folder.`);
      if (fs.existsSync(publicPath)) {
        console.log(`'public' folder found at: ${publicPath}`);
        app.use(express.static(publicPath));
      } else {
        console.error(`CRITICAL: Neither 'dist' nor 'public' folders were found!`);
      }
    }

    // Fallback for SPA
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Error: index.html not found in dist folder. Please ensure the build process completed successfully.");
      }
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
