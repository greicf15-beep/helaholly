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
    // Intentamos encontrar la carpeta 'dist' en varios lugares comunes de Hostinger
    const possiblePaths = [
      path.resolve(__dirname, 'dist'),
      path.join(process.cwd(), 'dist'),
      path.resolve(__dirname, '../dist'),
      path.join(process.cwd(), 'public') // Último recurso
    ];

    let distPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
        distPath = p;
        break;
      }
    }

    console.log(`--- DEBUG DE RUTAS ---`);
    console.log(`Directorio actual (cwd): ${process.cwd()}`);
    console.log(`Directorio del script (__dirname): ${__dirname}`);
    
    if (distPath) {
      console.log(`¡Carpeta de producción encontrada en: ${distPath}`);
      app.use(express.static(distPath, {
        maxAge: '1d',
        index: false
      }));
      
      // Fallback para SPA (React Router)
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.error(`ERROR CRÍTICO: No se encontró la carpeta 'dist' ni 'index.html' en ninguna ruta conocida.`);
      console.log(`Rutas intentadas: ${possiblePaths.join(' | ')}`);
      
      // Intentar servir lo que sea que haya en el CWD como emergencia
      app.use(express.static(process.cwd()));
      app.get('*', (req, res) => {
        res.status(404).send("Error: No se encontró la carpeta de compilación (dist). Revisa los logs de despliegue.");
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en http://0.0.0.0:${PORT}`);
  });
}

startServer();
