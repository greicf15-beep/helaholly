import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Explicitly set MIME types for common image formats
  express.static.mime.define({
    'image/webp': ['webp'],
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/svg+xml': ['svg']
  });

  // Log all requests for debugging
  app.use((req, res, next) => {
    if (req.url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
      console.log(`[IMAGE] ${req.method} ${req.url}`);
    }
    next();
  });

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mode: process.env.NODE_ENV,
      cwd: process.cwd(),
      dirName: __dirname
    });
  });

  // Neutral diagnostic route to avoid proxy interception
  app.get('/api/debug-site', (req, res) => {
    const distPath = path.resolve(process.cwd(), 'dist');
    const publicPath = path.resolve(process.cwd(), 'public');
    
    let distFiles: string[] = [];
    try {
      if (fs.existsSync(distPath)) {
        distFiles = fs.readdirSync(distPath).filter(f => !f.startsWith('.'));
      }
    } catch (e) {
      distFiles = ['Error reading dist'];
    }

    res.json({
      message: 'Hollywood Server Debug',
      cwd: process.cwd(),
      distExists: fs.existsSync(distPath),
      publicExists: fs.existsSync(publicPath),
      distFiles: distFiles.slice(0, 20), // Show first 20 files
      env: process.env.NODE_ENV
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode - Use process.cwd() as it's more reliable in many hosting environments
    const distPath = path.resolve(process.cwd(), 'dist');
    const publicPath = path.resolve(process.cwd(), 'public');

    console.log('--- PRODUCTION MODE ---');
    console.log('CWD:', process.cwd());
    console.log('Dist path:', distPath);

    // Serve static files from dist
    if (fs.existsSync(distPath)) {
      console.log('Serving static files from dist');
      app.use(express.static(distPath, {
        maxAge: '1d',
        index: ['index.html'],
        fallthrough: true // Allow falling through to public if not found in dist
      }));
    }

    // Serve static files from public as fallback
    if (fs.existsSync(publicPath)) {
      console.log('Serving static files from public fallback');
      app.use(express.static(publicPath));
    }

    // SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not Found - dist/index.html missing. Run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
