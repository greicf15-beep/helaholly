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
    
    if (!fs.existsSync(distPath)) {
      console.error(`ERROR: The 'dist' directory does not exist at ${distPath}. Did you run 'npm run build'?`);
      // Fallback to serving public folder if dist is missing (not ideal for production but helps debug)
      app.use(express.static(path.join(process.cwd(), 'public')));
    } else {
      console.log(`Serving static files from: ${distPath}`);
      app.use(express.static(distPath, {
        maxAge: '1d',
        index: false
      }));
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
