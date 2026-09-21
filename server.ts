import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getAllOrders, addOrder, updateOrder } from './server_orders';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SISTEMA_API_KEY = process.env.SISTEMA_API_KEY || 'holly_sistema_sec_2026';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON request bodies
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Direct PDF and Documentation files
  app.get(['/api-sistema-hollywood.pdf', '/api/docs/pdf', '/api/sistema/docs/pdf', '/api-docs.pdf'], (req, res) => {
    const pdfPath = path.join(__dirname, 'public', 'api-sistema-hollywood.pdf');
    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      // If user passed ?download=1 force download, otherwise inline view
      const disposition = req.query.download === '1' ? 'attachment' : 'inline';
      res.setHeader('Content-Disposition', `${disposition}; filename="api-sistema-hollywood.pdf"`);
      return res.sendFile(pdfPath);
    }
    return res.status(404).send('Archivo PDF no encontrado');
  });

  app.get(['/api-docs', '/api-docs.html', '/documentacion-api'], (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'api-docs.html');
    if (fs.existsSync(htmlPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(htmlPath);
    }
    return res.status(404).send('Documentación no encontrada');
  });

  // Internal endpoint called by checkout frontend to register orders
  app.post(['/api/orders', '/api/sistema/orders'], (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData || !orderData.customer || !orderData.items) {
        return res.status(400).json({ error: 'Datos de pedido inválidos' });
      }

      const savedOrder = addOrder(orderData);
      return res.status(201).json({ success: true, order: savedOrder });
    } catch (err: any) {
      console.error('Error saving order in server:', err);
      return res.status(500).json({ error: 'Error interno guardando pedido' });
    }
  });

  // ==========================================
  // API DEL SISTEMA (ADMINISTRATIVO)
  // ==========================================

  // Authentication middleware for Sistema
  const authenticateSistema = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
    const token = typeof apiKeyHeader === 'string' && apiKeyHeader.startsWith('Bearer ')
      ? apiKeyHeader.slice(7).trim()
      : apiKeyHeader;

    if (!token || token !== SISTEMA_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado. Se requiere x-api-key o Bearer token válido.',
      });
    }
    next();
  };

  // 1. Verificación de conexión / Ping
  app.get('/api/sistema/health', authenticateSistema, (req, res) => {
    res.json({
      success: true,
      service: 'Hollywood Pedidos API - Sistema',
      status: 'online',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Obtener lista de pedidos (con filtros opcionales: status, store, limit)
  app.get('/api/sistema/orders', authenticateSistema, (req, res) => {
    try {
      let orders = getAllOrders();
      const { status, store, limit } = req.query;

      if (status && typeof status === 'string' && status !== 'all') {
        orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
      }

      if (store && typeof store === 'string') {
        orders = orders.filter(o => o.store.toLowerCase().includes(store.toLowerCase()));
      }

      if (limit && !isNaN(Number(limit))) {
        orders = orders.slice(0, Number(limit));
      }

      res.json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (err: any) {
      console.error('Error in GET /api/sistema/orders:', err);
      res.status(500).json({ success: false, error: 'Error al consultar pedidos' });
    }
  });

  // 3. Obtener un pedido específico por ID
  app.get('/api/sistema/orders/:id', authenticateSistema, (req, res) => {
    try {
      const orders = getAllOrders();
      const order = orders.find(o => o.id === req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }

      res.json({ success: true, order });
    } catch (err: any) {
      console.error('Error in GET /api/sistema/orders/:id:', err);
      res.status(500).json({ success: false, error: 'Error al buscar el pedido' });
    }
  });

  // 4. Actualizar estado del pedido desde el Sistema (marcar como sincronizado, facturado, etc.)
  app.patch('/api/sistema/orders/:id', authenticateSistema, (req, res) => {
    try {
      const { id } = req.params;
      const { status, invoiceNumber, notes } = req.body;

      if (!status && !invoiceNumber && !notes) {
        return res.status(400).json({
          success: false,
          error: 'Debe enviar al menos uno de los campos a actualizar: status, invoiceNumber, notes',
        });
      }

      const updatedOrder = updateOrder(id, { status, invoiceNumber, notes });
      if (!updatedOrder) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado para actualizar' });
      }

      res.json({
        success: true,
        message: 'Pedido actualizado correctamente en el sistema',
        order: updatedOrder,
      });
    } catch (err: any) {
      console.error('Error in PATCH /api/sistema/orders/:id:', err);
      res.status(500).json({ success: false, error: 'Error al actualizar el pedido' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
