const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const pdfFiles = [
  path.join(publicDir, 'api-respuesta-saint-hollywood.pdf'),
  path.join(publicDir, 'api-sistema-hollywood.pdf'),
  path.join(distDir, 'api-respuesta-saint-hollywood.pdf'),
  path.join(distDir, 'api-sistema-hollywood.pdf')
];

function generateDoc(outputPath, onFinish) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 45, right: 45 },
    bufferPages: true,
    info: {
      Title: 'Respuesta Tecnica de Integracion Saint Enterprise ERP v2.0 - Heladeria Hollywood',
      Author: 'Equipo Tecnico Heladeria Hollywood',
      Subject: 'Respuesta y Especificacion Tecnica al Informe DOC-INT-2026-01',
    }
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Colors
  const PRIMARY = '#9A3412';    // Rust / Hollywood Orange Dark
  const SECONDARY = '#431407';  // Deep Brown
  const TEXT = '#1E293B';       // Slate 800
  const MUTED = '#64748B';      // Slate 500
  const BG_CODE = '#F8FAFC';    // Slate 50
  const BORDER_CODE = '#CBD5E1';// Slate 300

  function drawHeader(title, subtitle) {
    doc.rect(45, 35, 505, 58).fill('#FFF7ED');
    doc.rect(45, 35, 505, 58).stroke('#FED7AA');

    doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold')
       .text('HELADERIA HOLLYWOOD - RESPUESTA TECNICA DE INTEGRACION', 58, 45);
    
    doc.fillColor(SECONDARY).fontSize(10).font('Helvetica-Bold')
       .text(title, 58, 62);

    doc.fillColor(MUTED).fontSize(8).font('Helvetica')
       .text(subtitle || 'Respuesta Oficial al Informe DOC-INT-2026-01 - Saint Enterprise ERP (v2.0)', 58, 76);

    doc.y = 105;
  }

  function drawSectionTitle(title) {
    doc.moveDown(0.7);
    const currentY = doc.y;
    doc.rect(45, currentY, 4, 16).fill(PRIMARY);
    doc.fillColor(SECONDARY).fontSize(11).font('Helvetica-Bold')
       .text(title, 55, currentY + 2);
    doc.moveDown(0.4);
  }

  function drawCodeBlock(code, fontSize = 7.8) {
    const currentY = doc.y;
    const lines = code.split('\n');
    const height = Math.max(25, lines.length * (fontSize + 2.5) + 12);

    doc.rect(45, currentY, 505, height).fill(BG_CODE);
    doc.rect(45, currentY, 505, height).stroke(BORDER_CODE);

    doc.fillColor(TEXT).fontSize(fontSize).font('Courier')
       .text(code, 53, currentY + 6, { width: 490, lineGap: 1.2 });
    
    doc.y = currentY + height + 6;
  }

  // ================= PAGE 1 =================
  drawHeader(
    'INFORME DE RESPUESTA Y ESPECIFICACION TECNICA v2.0',
    'Conformidad con "Opcion 1: Conexion Rapida" - Entorno de Produccion 2026'
  );

  doc.fillColor(TEXT).fontSize(8.8).font('Helvetica').lineGap(2);
  doc.text(
    'A la atencion del equipo de programacion e integracion de Saint Enterprise ERP:\n' +
    'Hemos recibido y analizado minuciosamente el informe tecnico DOC-INT-2026-01 ("Analisis Critico de la API REST de Pedidos y Arquitectura de Sincronizacion Bidireccional con Saint Enterprise ERP"). Confirmamos plena coincidencia en los estandares de conexion y presentamos en este documento la version definitiva v2.0 de la API web, implementada y lista para sincronizacion.'
  );

  drawSectionTitle('1. ALINEACION OPERATIVA: HELADERIA HOLLYWOOD (10 SEDES FISICAS)');
  doc.font('Helvetica').fontSize(8.5).fillColor(TEXT);
  doc.text(
    'Para garantizar el exito del proyecto sin alterar el funcionamiento del negocio, es fundamental tener presente la realidad operativa de Heladeria Hollywood:'
  );
  doc.moveDown(0.3);

  const modelBullets = [
    ['Red de 10 Sucursales:', 'Hollywood opera con 10 sedes fisicas en Maracaibo, Cabimas y Valencia. Cada sucursal cuenta con su propio personal, inventario fisico y linea de WhatsApp oficial para delivery y pickup.'],
    ['Cierre de Ventas en WhatsApp:', 'Los clientes configuran su pedido en la plataforma web y la transaccion se transfiere automaticamente al chat de WhatsApp de la sede seleccionada, donde la cajera valida la disponibilidad final y coordina el despacho.'],
    ['Validacion de Pagos (Opcion 1 del Informe):', 'En estricta concordancia con la "Opcion 1: Conexion Rapida" de su informe ("Validacion de Pagos: Manual / Cajero busca la referencia en el texto de notas"), la web NO forzara una pasarela bancaria ni la carga de comprobantes en el navegador. La web registra el metodo de pago previsto (Pago Movil, Zelle, Efectivo USD o Punto de Venta) y el cliente entrega el comprobante en el chat de WhatsApp con el cajero.'],
    ['Agilidad Comercial:', 'Este flujo evita la desercion de clientes en horas pico y permite que Saint cree la Nota de Pedido de inmediato, dejando la conciliacion final del dinero al cajero al pulsar "Totalizar".']
  ];

  modelBullets.forEach(([tit, desc]) => {
    doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(8.2).text('* ' + tit + ' ', { continued: true });
    doc.font('Helvetica').fillColor(TEXT).text(desc);
    doc.moveDown(0.2);
  });

  drawSectionTitle('2. MATRIZ DE SOLUCION A LAS 8 BRECHAS DEL INFORME');

  const matrix = [
    ['1. Catalogo & SKUs', 'Se asigno el codigo numerico SAPROD.CodProd (ej: "010045") a cada producto, tina y presentacion. Eliminados los slugs web libres en la ingesta de Saint.'],
    ['2. Datos Fiscales (Cedula/RIF)', 'Checkout actualizado: solicita obligatoriamente Cedula o RIF con selector (V-, E-, J-, G-) o boton "Consumidor Final" que mapea a V-00000000.'],
    ['3. Conciliacion de Pagos', 'Se agrego el objeto "payment" con el metodo previsto ("pago_movil", "zelle", "efectivo_usd", "punto") y notas para el cajero de Saint.'],
    ['4. Flete como Servicio', 'Cuando el pedido es delivery, se inyecta automaticamente un renglon de servicio con CodProd: "SERV-DELIV" cumpliendo la norma del SENIAT.'],
    ['5. Identificacion de Sede', 'El selector envia el codigo tecnico de sucursal de Saint (storeCode: "00000" a "00009") y deposito (warehouseCode: "01B").'],
    ['6. Maquina de Estados', 'Se incorporo el estado "en_caja" para bloquear pedidos duplicados al ingresar a Saint, y "facturado" con invoiceNumber y saintOrderNumber.'],
    ['7. Frecuencia de Sondeo', 'La API esta optimizada para que el SaintWebSyncWorker sondee cada 15 a 30 segundos sin sobrecarga.'],
    ['8. Estructura Financiera', 'Se agrego el objeto "financials" con desglose exacto de subtotal, flete, total en USD, tasa y total en Bs.']
  ];

  matrix.forEach(([area, sol]) => {
    doc.font('Helvetica-Bold').fillColor(SECONDARY).fontSize(8).text(area + ': ', { continued: true });
    doc.font('Helvetica').fillColor(TEXT).text(sol);
    doc.y += 1;
  });

  // ================= PAGE 2 =================
  doc.addPage();
  drawHeader('ESPECIFICACION DEL PAYLOAD JSON v2.0', 'GET /api/sistema/orders (Compatible con SAFACT / SAITEMFAC)');

  doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY).text('Estructura Oficial Entregada por la API (Enriquecida v2.0):');
  doc.moveDown(0.2);

  drawCodeBlock(
`{
  "success": true,
  "count": 1,
  "orders": [
    {
      "id": "ORD-1726912345-ABCD",
      "createdAt": "2026-09-28T14:30:00.000Z",
      "store": {
        "storeCode": "00000",             // -> SAFACT.CodSucu (00000 = Sede 72 / 5 de Julio)
        "storeName": "Hollywood Sede 72 (5 de Julio)",
        "warehouseCode": "01B"            // -> SAFACT.CodUbic y SAITEMFAC.CodUbic
      },
      "mode": "delivery",                 // "delivery" o "pickup"
      "vehicleType": "moto",              // "moto" o "carro"
      "customer": {
        "docId": "V-18456789",            // -> SACLIE.CodClie / ID3 (o "V-00000000")
        "name": "Maria Gonzalez",         // -> SACLIE.Descrip
        "phone": "584121234567",          // -> SACLIE.Telef
        "address": "Calle 72 con Av. 15, Casa #14-20" // -> SACLIE.Direc1
      },
      "payment": {
        "method": "pago_movil",           // "pago_movil", "zelle", "efectivo_usd", "punto"
        "amountUsd": 9.00,
        "amountBs": 450.00,
        "exchangeRate": 50.00,
        "notes": "Pago acordado y validado en WhatsApp con el operador de la sede"
      },
      "items": [
        {
          "line": 1,
          "codProd": "010045",            // -> SAPROD.CodProd (SKU exacto en Saint)
          "name": "Barquilla Hollywood Especial 2 Sabores",
          "quantity": 2.0,
          "priceUsd": 3.50,
          "subtotalUsd": 7.00,
          "isExempt": true,               // Alicuota fiscal en Saint
          "customizationText": "Sabor: Chocolate Fudge | Topping: Lluvia Choc"
        },
        {
          "line": 2,                      // Renglon de servicio de flete
          "codProd": "SERV-DELIV",        // -> SAPROD / SASERV (Servicio Delivery)
          "name": "Servicio de Delivery",
          "quantity": 1.0,
          "priceUsd": 2.00,
          "subtotalUsd": 2.00,
          "isExempt": false
        }
      ],
      "financials": {
        "subtotalUsd": 7.00,
        "deliveryFeeUsd": 2.00,
        "taxUsd": 0.00,
        "totalUsd": 9.00,
        "totalBs": 450.00,
        "exchangeRate": 50.00
      },
      "status": "pending",                // "pending", "en_caja", "facturado", "cancelado"
      "sistemaSync": {
        "syncedAt": null,
        "saintOrderNumber": null,
        "invoiceNumber": null,
        "terminalId": null
      }
    }
  ]
}`
  );

  // ================= PAGE 3 =================
  doc.addPage();
  drawHeader('CALLBACKS Y ACTUALIZACION EN CAJA (PATCH)', 'Transiciones de estado durante el ciclo operativo en Saint');

  drawSectionTitle('3. FLUJO DE CALLBACKS DEL WORKER LOCAL DE SAINT');
  doc.font('Helvetica').fontSize(8.5).fillColor(TEXT).text(
    'El endpoint PATCH /api/sistema/orders/{id} ha sido actualizado para aceptar los dos momentos transaccionales descritos en la seccion 4.1 y 5.1 de su informe:'
  );
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY).text('Momento 1: Ingesta del Pedido en Saint (Cambio a estado "en_caja")');
  doc.font('Helvetica').fontSize(8.2).fillColor(TEXT).text(
    'Al crearse la Nota de Pedido (SAFACT Tipo "E", ej. PED-000412) y enviarse la comanda a cocina, el Worker ejecuta:'
  );

  drawCodeBlock(
`PATCH /api/sistema/orders/ORD-1726912345-ABCD HTTP/1.1
Host: pedidos.helaholly.com
x-api-key: holly_sistema_sec_2026
Content-Type: application/json

{
  "status": "en_caja",
  "saintOrderNumber": "PED-000412",
  "notes": "Comanda registrada en Saint ERP y enviada a barra de preparacion."
}`
  );

  doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY).text('Momento 2: Totalizacion Fiscal en Caja (Cambio a estado "facturado")');
  doc.font('Helvetica').fontSize(8.2).fillColor(TEXT).text(
    'Cuando el cajero verifica el pago en WhatsApp y pulsa "Totalizar" emitiendo la Factura Fiscal (Tipo "A" / "C"), el Outbox Worker ejecuta:'
  );

  drawCodeBlock(
`PATCH /api/sistema/orders/ORD-1726912345-ABCD HTTP/1.1
Host: pedidos.helaholly.com
x-api-key: holly_sistema_sec_2026
Content-Type: application/json

{
  "status": "facturado",
  "invoiceNumber": "FAC-001245",
  "notes": "Factura emitida por Caja 1. Pago verificado en WhatsApp."
}`
  );

  drawSectionTitle('4. CATALOGO DE CODIGOS DE SUCURSAL SAINT (CodSucu)');
  const stores = [
    ['00000', '01B', 'Hollywood Sede 72 (5 de Julio)', 'Calle 72 con Av. 13A, Maracaibo'],
    ['00001', '01B', 'Hollywood CC Cima Gelato', 'CC Cima, Av. Libertador, Maracaibo'],
    ['00002', '01B', 'Hollywood CC Cima Soft', 'CC Cima, Av. Libertador, Maracaibo'],
    ['00003', '01B', 'Hollywood Farmavid', 'Av. Circunvalacion 2, Maracaibo'],
    ['00004', '01B', 'Hollywood Zona Norte', 'Av. Rosal Sur, Calle 45, Maracaibo'],
    ['00005', '01B', 'Hollywood CC Mall Paseo', 'CC Mall Paseo, San Francisco'],
    ['00006', '01B', 'Hollywood San Felipe', 'Casco Central, Maracaibo'],
    ['00007', '01B', 'Hollywood Farmak', 'Av. Carnevalli, Cabimas'],
    ['00008', '01B', 'Hollywood CC Costa Mall', 'CC Costa Mall, Cabimas'],
    ['00009', '01B', 'Hollywood Naguanagua', 'Av. Salvador Feo La Cruz, Valencia']
  ];

  doc.font('Helvetica-Bold').fontSize(7.8).fillColor(SECONDARY);
  doc.text('CodSucu    Deposito    Nombre de la Sucursal                      Ubicacion', 50, doc.y);
  doc.moveDown(0.2);

  stores.forEach(([sc, wh, nm, loc]) => {
    doc.font('Courier-Bold').fillColor(PRIMARY).fontSize(7.5).text(sc + '       ' + wh + '         ', 50, doc.y, { continued: true });
    doc.font('Helvetica-Bold').fillColor(TEXT).text(nm.padEnd(38, ' ') + ' ', { continued: true });
    doc.font('Helvetica').fillColor(MUTED).text(loc);
  });

  // ================= PAGE 4 =================
  doc.addPage();
  drawHeader('CATALOGO DE SKUS Y HOMOLOGACION DE PRODUCTOS', 'Mapeo a la tabla SAPROD.CodProd en SQL Server');

  drawSectionTitle('5. HOMOLOGACION DE CODIGOS DE PRODUCTO (SAPROD.CodProd)');
  doc.font('Helvetica').fontSize(8.2).fillColor(TEXT).text(
    'A continuacion se detallan los codigos alfanumericos homologados para insercion directa en SAITEMFAC:'
  );
  doc.moveDown(0.3);

  const skus = [
    ['SERV-DELIV', 'Servicio de Delivery / Flete', 'Servicio', 'Aplica en pedidos mode: delivery'],
    ['010010', 'Tina Soft 6 oz (3 contornos gratis)', 'Soft', 'Precio base: $3.30'],
    ['010011', 'Tina Soft 12 oz (3 contornos gratis)', 'Soft', 'Precio base: $4.15'],
    ['010012', 'Tina Soft 16 oz (3 contornos gratis)', 'Soft', 'Precio base: $5.97'],
    ['010014', 'Tina Galleta Soft 14 oz', 'Soft', 'Precio: $4.75'],
    ['010040', 'Barquilla Soft Clasica', 'Soft', 'Precio: $1.65'],
    ['010060', 'Bubble Waffle Soft 16 oz', 'Soft', 'Precio: $6.50'],
    ['010030', 'Sundae Soft 7 oz', 'Soft', 'Precio: $1.80'],
    ['010031', 'Sundae Frutas Soft 7 oz', 'Soft', 'Precio: $2.00'],
    ['010032', 'Sundae Soft 12 oz', 'Soft', 'Precio: $3.00'],
    ['010035', 'Frosty Tradicional 7 oz', 'Soft', 'Precio: $1.70'],
    ['010036', 'Frosty Tradicional 12 oz', 'Soft', 'Precio: $2.60'],
    ['010037', 'Frosty Especial 12 oz', 'Soft', 'Precio: $3.30'],
    ['010065', 'Maxi Sundae Basico', 'Soft', 'Precio: $3.30'],
    ['010050', 'Milkshakes Soft (Oreo, Toddy, etc.)', 'Soft', 'Precio: $4.40 - $5.60'],
    ['010055', 'Frappuccinos Soft (Original, Tiramisu)', 'Soft', 'Precio: $4.95 - $8.15'],
    ['010045', 'Barquilla Gelato 1 Porcion', 'Gelato', 'Linea Basica: $1.72 | Premium: $2.33'],
    ['010046', 'Barquillon Gelato 1 Porcion', 'Gelato', 'Linea Basica: $2.48 | Premium: $3.09'],
    ['010047', 'Barquillon Gelato 2 Porciones', 'Gelato', 'Linea Basica: $3.87 | Premium: $5.09'],
    ['010020', '1LT Gelato Linea Basica', 'Gelato', 'Precio: $9.65'],
    ['010021', '1LT Gelato Linea Premium', 'Gelato', 'Precio: $12.95'],
    ['010022', '1LT Gelato Linea Pelicula', 'Gelato', 'Precio: $16.10'],
    ['010023', '1LT Gelato Linea Deluxe', 'Gelato', 'Precio: $23.50']
  ];

  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(SECONDARY);
  doc.text('CodProd          Nombre / Descripcion                                     Linea       Observacion', 50, doc.y);
  doc.moveDown(0.2);

  skus.forEach(([sku, desc, cat, obs]) => {
    doc.font('Courier-Bold').fillColor(PRIMARY).fontSize(7.3).text(sku.padEnd(16, ' '), 50, doc.y, { continued: true });
    doc.font('Helvetica-Bold').fillColor(TEXT).text(desc.padEnd(42, ' '), { continued: true });
    doc.font('Helvetica').fillColor(MUTED).text(cat.padEnd(12, ' ') + ' ', { continued: true });
    doc.font('Helvetica').fillColor(TEXT).text(obs);
  });

  drawSectionTitle('6. CREDENCIALES, VALIDACION Y ENTORNO ACTIVO');
  const creds = [
    ['URL Base API:', 'https://pedidos.helaholly.com (Node.js en Hostinger)'],
    ['Encabezado Auth:', 'x-api-key: holly_sistema_sec_2026'],
    ['Estado del Endpoint:', 'Activo y validado con respuestas HTTP 200 OK'],
    ['Siguiente Paso:', 'El equipo de Saint puede compilar la tabla INT_PEDIDOS_WEB y el SP dbo.usp_ImportarPedidoWebSaint e iniciar las pruebas inmediatas.']
  ];

  creds.forEach(([l, v]) => {
    doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(8.2).text('* ' + l + ' ', { continued: true });
    doc.font('Helvetica').fillColor(TEXT).text(v);
  });

  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(SECONDARY).text('DOCUMENTO EMITIDO POR: Direccion de Tecnologia - Heladeria Hollywood C.A.');

  doc.end();

  stream.on('finish', () => {
    if (onFinish) onFinish();
  });
}

// Generate in parallel for all target paths
let completed = 0;
pdfFiles.forEach(file => {
  generateDoc(file, () => {
    completed++;
    console.log(`Generated: ${file} (${completed}/${pdfFiles.length})`);
  });
});
