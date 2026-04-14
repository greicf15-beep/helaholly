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

  // Log de todas las peticiones para ver qué intenta cargar el navegador
  app.use((req, res, next) => {
    if (req.url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
      console.log(`[IMAGE REQ] ${new Date().toISOString()} - ${req.url}`);
    }
    next();
  });

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: process.env.NODE_ENV });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Usamos path.resolve(__dirname) para asegurar que la ruta sea absoluta desde la raíz del proyecto
    const distPath = path.resolve(__dirname, 'dist');
    const publicPath = path.resolve(__dirname, 'public');
    
    console.log(`--- DEBUG DE RUTAS ---`);
    console.log(`Directorio del servidor (__dirname): ${__dirname}`);
    console.log(`Buscando carpeta 'dist' en: ${distPath}`);
    
    if (fs.existsSync(distPath)) {
      console.log(`¡Carpeta 'dist' encontrada! Contenido: ${fs.readdirSync(distPath).slice(0, 10).join(', ')}`);
      // Servir estáticos de dist
      app.use(express.static(distPath, {
        maxAge: '1d',
        index: false
      }));
    } else {
      console.error(`ERROR: No se encontró la carpeta 'dist'. Intentando servir desde 'public'.`);
      if (fs.existsSync(publicPath)) {
        app.use(express.static(publicPath));
      }
    }

    // Fallback para SPA (React Router)
    app.get('*', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Error: No se encontró index.html. Revisa los logs de compilación.");
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en http://0.0.0.0:${PORT}`);
  });
}

startServer();
