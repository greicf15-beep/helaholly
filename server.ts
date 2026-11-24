import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getAllOrders, addOrder, updateOrder } from './server_orders';
import { 
  findCustomerByPhone, 
  registerCashierCustomer, 
  addStampToCustomer, 
  redeemStampRewardInCashier, 
  redeemBirthdayRewardInCashier,
  getAllCustomers,
  cleanPhoneNumber
} from './server_loyalty';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

function getFilePath(filename: string): string {
  const distCandidate = path.join(distDir, filename);
  if (fs.existsSync(distCandidate)) return distCandidate;

  const publicCandidate = path.join(publicDir, filename);
  if (fs.existsSync(publicCandidate)) return publicCandidate;

  return path.join(rootDir, filename);
}

const SISTEMA_API_KEY = process.env.SISTEMA_API_KEY || 'holly_sistema_sec_2026';
const CAJA_PIN = process.env.CAJA_PIN || '0304';

async function startServer() {
  const app = express();
  // Dev server and internal backend MUST run on port 3000 (nginx listens on 8080 and proxies to 3000)
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON request bodies
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Direct PDF and Documentation files
  app.get(['/api-respuesta-saint-hollywood.pdf', '/respuesta-saint.pdf'], (req, res) => {
    const pdfPath = getFilePath('api-respuesta-saint-hollywood.pdf');
    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      const disposition = req.query.download === '1' ? 'attachment' : 'inline';
      res.setHeader('Content-Disposition', `${disposition}; filename="api-respuesta-saint-hollywood.pdf"`);
      return res.sendFile(pdfPath);
    }
    return res.status(404).send('Archivo PDF no encontrado');
  });

  app.get(['/api-sistema-hollywood.pdf', '/api/docs/pdf', '/api/sistema/docs/pdf', '/api-docs.pdf'], (req, res) => {
    const pdfPath = getFilePath('api-sistema-hollywood.pdf');
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
    const htmlPath = getFilePath('api-docs.html');
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

      // Auto-sync customer to loyalty storage if phone provided
      if (orderData.customer?.phone) {
        try {
          const phone = orderData.customer.phone;
          const existing = findCustomerByPhone(phone);
          const totalAmount = Number(orderData.total) || 0;
          const storeName = typeof orderData.store === 'object' && orderData.store?.storeName ? orderData.store.storeName : String(orderData.store || '');
          if (existing) {
            if (totalAmount >= 4.0 && !orderData.rewardsClaimed?.stampReward) {
              addStampToCustomer(phone, totalAmount, storeName);
            }
            if (orderData.rewardsClaimed?.stampReward) {
              redeemStampRewardInCashier(phone, orderData.rewardsClaimed.stampReward as any, storeName);
            }
            if (orderData.rewardsClaimed?.birthday) {
              redeemBirthdayRewardInCashier(phone, storeName);
            }
          } else if (orderData.customer.name) {
            registerCashierCustomer({
              name: orderData.customer.name,
              phone: orderData.customer.phone,
              birthdate: '',
              store: storeName,
              initialAmount: totalAmount,
            });
          }
        } catch (e) {
          console.warn('Loyalty auto-sync non-critical error:', e);
        }
      }

      return res.status(201).json({ success: true, order: savedOrder });
    } catch (err: any) {
      console.error('Error saving order in server:', err);
      return res.status(500).json({ error: 'Error interno guardando pedido' });
    }
  });

  // ==========================================
  // API TERMINAL DE CAJA (MÉTODO TIENDA FÍSICA)
  // ==========================================

  // 1. Verificación de PIN de caja
  app.post('/api/caja/auth', (req, res) => {
    const { pin } = req.body;
    if (pin === CAJA_PIN) {
      return res.json({ success: true, message: 'Acceso autorizado' });
    }
    return res.status(401).json({ success: false, error: 'PIN de caja incorrecto' });
  });

  // 2. Búsqueda de cliente por teléfono
  app.get('/api/caja/search', (req, res) => {
    const phone = req.query.phone as string;
    if (!phone) {
      return res.status(400).json({ error: 'Número de teléfono requerido' });
    }
    const customer = findCustomerByPhone(phone);
    return res.json({ found: Boolean(customer), customer });
  });

  // 3. Sumar sello por compra (mínimo $4.00)
  app.post('/api/caja/stamp', (req, res) => {
    try {
      const { phone, amount, store } = req.body;
      if (!phone) return res.status(400).json({ error: 'Teléfono requerido' });
      const purchaseAmount = Number(amount);
      if (isNaN(purchaseAmount) || purchaseAmount < 4.0) {
        return res.status(400).json({ error: 'La compra mínima debe ser de $4.00 para sumar un sello.' });
      }
      const updated = addStampToCustomer(phone, purchaseAmount, store);
      return res.json({ success: true, customer: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Error procesando sello' });
    }
  });

  // 4. Canjear premio de 5 sellos
  app.post('/api/caja/redeem-stamp', (req, res) => {
    try {
      const { phone, rewardItem, store } = req.body;
      if (!phone || !rewardItem) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (phone, rewardItem)' });
      }
      const updated = redeemStampRewardInCashier(phone, rewardItem, store);
      return res.json({ success: true, customer: updated, message: `Premio ${rewardItem} canjeado exitosamente` });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Error canjeando premio de sellos' });
    }
  });

  // 5. Canjear regalo de cumpleaños (Sundae de Película)
  app.post('/api/caja/redeem-birthday', (req, res) => {
    try {
      const { phone, store } = req.body;
      if (!phone) return res.status(400).json({ error: 'Teléfono requerido' });
      const updated = redeemBirthdayRewardInCashier(phone, store);
      return res.json({ success: true, customer: updated, message: 'Sundae de Cumpleaños canjeado exitosamente' });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Error canjeando regalo de cumpleaños' });
    }
  });

  // 6. Registro rápido de cliente en caja (en 5 segundos)
  app.post('/api/caja/register', (req, res) => {
    try {
      const { name, phone, birthdate, store, initialAmount } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
      }
      const newCust = registerCashierCustomer({
        name,
        phone,
        birthdate: birthdate || '',
        store,
        initialAmount: Number(initialAmount) || 0,
      });
      return res.status(201).json({ success: true, customer: newCust });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Error registrando cliente' });
    }
  });

  // 7. Lista de clientes para la caja
  app.get('/api/caja/customers', (req, res) => {
    const list = getAllCustomers();
    return res.json({ success: true, count: list.length, customers: list });
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
        orders = orders.filter(o => {
          const sName = typeof o.store === 'object' && o.store?.storeName ? o.store.storeName : String(o.store || '');
          const sCode = typeof o.store === 'object' && o.store?.storeCode ? o.store.storeCode : '';
          return sName.toLowerCase().includes(store.toLowerCase()) || sCode.toLowerCase().includes(store.toLowerCase());
        });
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
      const { status, saintOrderNumber, invoiceNumber, terminalId, notes } = req.body;

      if (!status && !saintOrderNumber && !invoiceNumber && !terminalId && !notes) {
        return res.status(400).json({
          success: false,
          error: 'Debe enviar al menos uno de los campos a actualizar: status, saintOrderNumber, invoiceNumber, terminalId, notes',
        });
      }

      const updatedOrder = updateOrder(id, { status, saintOrderNumber, invoiceNumber, terminalId, notes });
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
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} in use, retrying in 1s...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
