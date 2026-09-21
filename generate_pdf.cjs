const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'public', 'api-sistema-hollywood.pdf');

// Ensure public folder exists
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  info: {
    Title: 'Documentación Oficial API Pedidos - Sistema Administrativo',
    Author: 'Heladería Hollywood',
    Subject: 'Especificación Técnica de Integración API REST',
  }
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Color palette
const PRIMARY = '#9A3412';    // Rust / Hollywood Orange Dark
const SECONDARY = '#431407';  // Hollywood Deep Brown
const ACCENT = '#C2410C';     // Orange
const TEXT = '#1E293B';       // Slate 800
const MUTED = '#64748B';      // Slate 500
const BG_CODE = '#F8FAFC';    // Slate 50
const BORDER_CODE = '#E2E8F0';// Slate 200

// Helper functions
function drawHeader(title, subtitle) {
  doc.rect(45, 40, 505, 60).fill('#FFF7ED');
  doc.rect(45, 40, 505, 60).stroke('#FED7AA');

  doc.fillColor(PRIMARY).fontSize(16).font('Helvetica-Bold')
     .text('HELADERÍA HOLLYWOOD — ESPECIFICACIÓN TÉCNICA', 60, 52);
  
  doc.fillColor(SECONDARY).fontSize(11).font('Helvetica-Bold')
     .text(title, 60, 72);

  doc.fillColor(MUTED).fontSize(9).font('Helvetica')
     .text(subtitle || 'API REST de Integración para el Sistema Administrativo Contable', 60, 86);

  doc.y = 115;
}

function drawSectionTitle(title) {
  doc.moveDown(0.8);
  const currentY = doc.y;
  doc.rect(45, currentY, 4, 18).fill(PRIMARY);
  doc.fillColor(SECONDARY).fontSize(13).font('Helvetica-Bold')
     .text(title, 55, currentY + 2);
  doc.moveDown(0.5);
}

function drawCodeBlock(code) {
  const currentY = doc.y;
  const lines = code.split('\n');
  const height = Math.max(30, lines.length * 11 + 16);

  doc.rect(45, currentY, 505, height).fill(BG_CODE);
  doc.rect(45, currentY, 505, height).stroke(BORDER_CODE);

  doc.fillColor(TEXT).fontSize(8.5).font('Courier')
     .text(code, 55, currentY + 8, { width: 485, lineGap: 1.5 });
  
  doc.y = currentY + height + 8;
}

function checkPageSpace(requiredHeight = 100) {
  if (doc.y + requiredHeight > 760) {
    doc.addPage();
    drawHeader('INTEGRACIÓN DE PEDIDOS', 'Continuación del documento técnico');
  }
}

// ================= PAGE 1 =================
drawHeader('DOCUMENTACIÓN DE API REST — SISTEMA ADMINISTRATIVO', 'Versión 1.0 • Entorno de Producción');

doc.fillColor(TEXT).fontSize(9.5).font('Helvetica').lineGap(2);
doc.text(
  'Este documento contiene la especificación completa, rutas, encabezados de seguridad y estructuras JSON para la sincronización bidireccional entre la plataforma web de pedidos de Heladería Hollywood y el software administrativo contable de la empresa.'
);

drawSectionTitle('1. PARÁMETROS GENERALES DE CONEXIÓN');
doc.fontSize(9).font('Helvetica').fillColor(TEXT);

const generalParams = [
  ['Protocolo:', 'REST API (intercambio de datos en formato JSON sobre HTTPS)'],
  ['URL Base de Producción:', 'https://pedidos.helaholly.com  (o URL del servidor Node.js en Hostinger)'],
  ['Método de Autenticación:', 'Encabezado HTTP personalizado: x-api-key'],
  ['API Key Asignada:', 'holly_sistema_sec_2026'],
  ['Autenticación Alternativa:', 'Authorization: Bearer holly_sistema_sec_2026'],
  ['Formato de Fechas:', 'Estándar ISO 8601 UTC (ejemplo: 2026-09-21T19:20:00.000Z)'],
  ['Codificación de Caracteres:', 'UTF-8 estricto']
];

generalParams.forEach(([label, value]) => {
  doc.font('Helvetica-Bold').fillColor(SECONDARY).text(label, 50, doc.y, { continued: true });
  doc.font('Helvetica').fillColor(TEXT).text('  ' + value);
  doc.y += 2;
});

drawSectionTitle('2. ENDPOINTS DISPONIBLES');

// Endpoint 1
doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY).text('2.1. Ping / Verificación de Conexión (Health Check)');
doc.font('Helvetica').fontSize(9).fillColor(TEXT).text('Permite comprobar que el servicio está activo y que la API Key es válida.');
doc.moveDown(0.2);
doc.font('Helvetica-Bold').text('Método: ', { continued: true }).font('Helvetica').text('GET  |  ')
   .font('Helvetica-Bold').text('Ruta: ', { continued: true }).font('Helvetica').text('/api/sistema/health  |  ')
   .font('Helvetica-Bold').text('Auth: ', { continued: true }).font('Helvetica').text('x-api-key requerida');
doc.moveDown(0.3);

drawCodeBlock(
`// Ejemplo de Petición cURL:
curl -H "x-api-key: holly_sistema_sec_2026" \\
     https://pedidos.helaholly.com/api/sistema/health

// Respuesta Exitosa (200 OK):
{
  "success": true,
  "service": "Hollywood Pedidos API - Sistema",
  "status": "online",
  "timestamp": "2026-09-21T19:22:01.079Z"
}`
);

// Endpoint 2
checkPageSpace(220);
doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY).text('2.2. Obtención de Pedidos (GET /api/sistema/orders)');
doc.font('Helvetica').fontSize(9).fillColor(TEXT).text(
  'Retorna la lista de pedidos registrados. Admite filtrado por estado, sede y límite de resultados mediante parámetros de URL (Query Parameters).'
);
doc.moveDown(0.2);

doc.font('Helvetica-Bold').text('Parámetros Query Opcionales:');
const qParams = [
  ['?status=pending', 'Retorna solo pedidos pendientes por procesar en caja (Recomendado para el sistema)'],
  ['?status=facturado', 'Retorna pedidos que ya han sido facturados por el sistema contable'],
  ['?status=all', 'Retorna el histórico completo de pedidos sin importar su estado'],
  ['?store=5 de Julio', 'Filtra únicamente los pedidos pertenecientes a una sede en particular'],
  ['?limit=50', 'Limita la cantidad máxima de pedidos en la respuesta']
];
qParams.forEach(([p, desc]) => {
  doc.font('Courier-Bold').fillColor(PRIMARY).text(p, 60, doc.y, { continued: true });
  doc.font('Helvetica').fillColor(TEXT).text(' : ' + desc);
});

// ================= PAGE 2 =================
doc.addPage();
drawHeader('ESPECIFICACIÓN DEL OBJETO JSON DE PEDIDOS', 'Estructura detallada y campos de respuesta');

doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY).text('Ejemplo de Respuesta JSON (GET /api/sistema/orders):');
doc.moveDown(0.3);

drawCodeBlock(
`{
  "success": true,
  "count": 1,
  "orders": [
    {
      "id": "ORD-DEMO-001",
      "createdAt": "2026-09-21T19:20:00.000Z",
      "customer": {
        "name": "María González",
        "phone": "584121234567",
        "address": "Calle 72 con Av. 15, Maracaibo",
        "location": { "lat": 10.6698, "lng": -71.6094 }
      },
      "store": "Sede 5 de Julio",
      "mode": "delivery",              // "delivery" o "pickup"
      "vehicleType": "moto",           // "moto" o "carro" (aplica en delivery)
      "items": [
        {
          "id": "barquilla-especial",
          "name": "Barquilla Hollywood Especial",
          "price": 3.50,
          "quantity": 2,
          "subtotal": 7.00,
          "customization": {
            "flavor": "Chocolate Fudge",
            "magicLayer": "Capa Mágica de Avellana",
            "toppings": ["Lluvia de Chocolate (20g)", "Maní Tostado (20g)"]
          }
        }
      ],
      "subtotal": 7.00,
      "deliveryFee": 2.00,
      "total": 9.00,
      "status": "pending",             // "pending", "facturado", etc.
      "sistemaSync": {}
    }
  ]
}`
);

drawSectionTitle('3. DICCIONARIO DE CAMPOS DE CADA PEDIDO');
const fields = [
  ['id', 'String', 'Identificador único del pedido (ej. ORD-1726912345-ABCD)'],
  ['createdAt', 'String (ISO)', 'Fecha y hora en que el cliente realizó el pedido'],
  ['customer.name', 'String', 'Nombre completo del cliente'],
  ['customer.phone', 'String', 'Número de teléfono / WhatsApp del cliente'],
  ['customer.address', 'String', 'Dirección física de entrega (o retiro en tienda)'],
  ['store', 'String', 'Nombre de la heladería seleccionada (ej. Sede 5 de Julio, Cima)'],
  ['mode', 'String', 'Modalidad de entrega: "delivery" o "in-store" (retiro en tienda)'],
  ['items[].name', 'String', 'Nombre del producto helado'],
  ['items[].price', 'Number', 'Precio unitario en USD'],
  ['items[].quantity', 'Integer', 'Cantidad de unidades ordenadas'],
  ['items[].subtotal', 'Number', 'Monto subtotal del producto (precio * cantidad)'],
  ['items[].customization', 'Object', 'Detalle de sabores, capas mágicas y toppings seleccionados'],
  ['subtotal', 'Number', 'Monto total en productos'],
  ['deliveryFee', 'Number', 'Costo de envío por delivery (0 si es retiro en tienda)'],
  ['total', 'Number', 'Monto total a cobrar/facturar en USD'],
  ['status', 'String', 'Estado actual: "pending", "facturado", "cancelado"']
];

fields.forEach(([fName, fType, fDesc]) => {
  doc.font('Courier-Bold').fillColor(PRIMARY).fontSize(8.5).text(fName, 50, doc.y, { continued: true });
  doc.font('Helvetica-Bold').fillColor(MUTED).text(' (' + fType + ') - ', { continued: true });
  doc.font('Helvetica').fillColor(TEXT).text(fDesc);
  doc.y += 1.5;
});

// ================= PAGE 3 =================
doc.addPage();
drawHeader('ACTUALIZACIÓN DE ESTADO Y GUÍA DE IMPLEMENTACIÓN', 'Sincronización con el sistema de facturación');

doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY).text('2.3. Actualizar Estado / Confirmar Facturación (PATCH /api/sistema/orders/{id})');
doc.font('Helvetica').fontSize(9).fillColor(TEXT).text(
  'Una vez que el sistema administrativo emite la factura o comanda, debe notificar a la API para marcar el pedido como "facturado". Esto garantiza que futuras consultas de pedidos pendientes no repitan pedidos ya emitidos.'
);
doc.moveDown(0.3);

doc.font('Helvetica-Bold').text('Método: ', { continued: true }).font('Helvetica').text('PATCH  |  ')
   .font('Helvetica-Bold').text('Ruta: ', { continued: true }).font('Helvetica').text('/api/sistema/orders/{id}  |  ')
   .font('Helvetica-Bold').text('Content-Type: ', { continued: true }).font('Helvetica').text('application/json');

drawCodeBlock(
`// Petición PATCH:
PATCH /api/sistema/orders/ORD-DEMO-001 HTTP/1.1
Host: pedidos.helaholly.com
x-api-key: holly_sistema_sec_2026
Content-Type: application/json

{
  "status": "facturado",
  "invoiceNumber": "FAC-001245",
  "notes": "Factura generada en Caja 1 - Sede 5 de Julio"
}

// Respuesta Exitosa (200 OK):
{
  "success": true,
  "message": "Pedido actualizado correctamente en el sistema",
  "order": {
    "id": "ORD-DEMO-001",
    "status": "facturado",
    "sistemaSync": {
      "syncedAt": "2026-09-21T19:25:00.000Z",
      "invoiceNumber": "FAC-001245",
      "notes": "Factura generada en Caja 1 - Sede 5 de Julio"
    }
  }
}`
);

drawSectionTitle('4. CÓDIGO DE EJEMPLO PARA EL PROGRAMADOR');
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(SECONDARY).text('Ejemplo en C# / .NET / VB (Sistemas de escritorio):');
doc.moveDown(0.2);

drawCodeBlock(
`using System;
using System.Net.Http;
using System.Threading.Tasks;

public class HollywoodSyncService {
    private static readonly HttpClient client = new HttpClient();
    private const string BASE_URL = "https://pedidos.helaholly.com";
    private const string API_KEY = "holly_sistema_sec_2026";

    public async Task ConsultarPedidosPendientes() {
        var request = new HttpRequestMessage(HttpMethod.Get, BASE_URL + "/api/sistema/orders?status=pending");
        request.Headers.Add("x-api-key", API_KEY);

        var response = await client.SendAsync(request);
        if (response.IsSuccessStatusCode) {
            string jsonResponse = await response.Content.ReadAsStringAsync();
            Console.WriteLine("Pedidos obtenidos: " + jsonResponse);
            // Procesar JSON e insertar en la base de datos del sistema administrativo...
        }
    }
}`
);

drawSectionTitle('5. RECOMENDACIONES DE OPERACIÓN Y SOPORTE');
const bestPractices = [
  '• Frecuencia de Sondeo (Polling): Se recomienda realizar consultas cada 60 a 120 segundos para evitar saturación y mantener tiempo real.',
  '• Identificador de Factura: Almacene el "id" del pedido en su tabla de facturas para trazabilidad contable.',
  '• Soporte y Pruebas: Para cualquier ajuste adicional de campos o formatos, coordinar con el departamento técnico de Heladería Hollywood.'
];
bestPractices.forEach(bp => {
  doc.font('Helvetica').fontSize(8.5).fillColor(TEXT).text(bp);
  doc.y += 2;
});

// Finalize PDF file
doc.end();

stream.on('finish', () => {
  console.log('PDF generated successfully at:', outputPath);
});
