<?php
/**
 * Heladería Hollywood - API REST para Sistema Administrativo
 * Compatible nativamente con Hostinger (Apache/LiteSpeed/Nginx + PHP)
 */

header('Content-Type: application/json; charset=utf-8');

// Configuración CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Clave API de seguridad esperada
$API_KEY = 'holly_sistema_sec_2026';

// Directorio de almacenamiento seguro
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
    // Proteger carpeta de datos para que nadie pueda descargar el json directamente
    file_put_contents($dataDir . '/.htaccess', "Order Deny,Allow\nDeny from all\n");
}

$dataFile = $dataDir . '/orders.json';

// Si no existe, inicializar con pedido demo
if (!file_exists($dataFile)) {
    $initialOrders = [
        [
            'id' => 'ORD-DEMO-001',
            'createdAt' => gmdate('Y-m-d\TH:i:s.v\Z'),
            'customer' => [
                'name' => 'Cliente Demo',
                'phone' => '584120000000',
                'address' => 'Av. 5 de Julio, Maracaibo',
                'location' => ['lat' => 10.6698, 'lng' => -71.6094]
            ],
            'store' => 'Sede 5 de Julio',
            'mode' => 'delivery',
            'vehicleType' => 'moto',
            'items' => [
                [
                    'id' => 'sample-1',
                    'name' => 'Barquilla Hollywood Especial',
                    'price' => 3.5,
                    'quantity' => 2,
                    'subtotal' => 7.0,
                    'customization' => [
                        'flavor' => 'Chocolate Fudge',
                        'magicLayer' => 'Capa Mágica de Avellana',
                        'toppings' => ['Lluvia de Chocolate (20g)', 'Maní Tostado (20g)']
                    ]
                ]
            ],
            'subtotal' => 7.0,
            'deliveryFee' => 2.0,
            'total' => 9.0,
            'status' => 'pending',
            'sistemaSync' => [
                'notes' => 'Pedido de demostración para pruebas del sistema administrativo'
            ]
        ]
    ];
    file_put_contents($dataFile, json_encode($initialOrders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function getOrders($dataFile) {
    if (!file_exists($dataFile)) return [];
    $content = file_get_contents($dataFile);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function saveOrders($dataFile, $orders) {
    file_put_contents($dataFile, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// Obtener encabezados HTTP
function getHeader($name) {
    $nameLower = strtolower($name);
    foreach (getallheaders() as $key => $value) {
        if (strtolower($key) === $nameLower) {
            return trim($value);
        }
    }
    // Fallback en $_SERVER
    $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    if (isset($_SERVER[$serverKey])) {
        return trim($_SERVER[$serverKey]);
    }
    return null;
}

// Analizar ruta requerida
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Verificar si requiere autenticación
function checkAuth($API_KEY) {
    $clientKey = getHeader('x-api-key');
    $authHeader = getHeader('Authorization');

    if ($clientKey && $clientKey === $API_KEY) {
        return true;
    }

    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        if (trim($matches[1]) === $API_KEY) {
            return true;
        }
    }

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'No autorizado. Se requiere x-api-key o Bearer token válido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// 1. Health check: /api/sistema/health
if (strpos($requestUri, '/api/sistema/health') !== false) {
    checkAuth($API_KEY);
    echo json_encode([
        'success' => true,
        'service' => 'Hollywood Pedidos API - Sistema',
        'status' => 'online',
        'timestamp' => gmdate('Y-m-d\TH:i:s.v\Z')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Sincronizar/Facturar pedido: /api/sistema/orders/{id}/sync (PATCH o POST)
if (preg_match('#/api/sistema/orders/([^/]+)/sync#', $requestUri, $matches)) {
    checkAuth($API_KEY);
    $orderId = urldecode($matches[1]);
    $body = json_decode(file_get_contents('php://input'), true) ?: [];

    $orders = getOrders($dataFile);
    $found = false;
    $updatedOrder = null;

    foreach ($orders as &$order) {
        if ($order['id'] === $orderId) {
            $found = true;
            if (isset($body['status'])) {
                $order['status'] = $body['status'];
            }
            if (!isset($order['sistemaSync'])) {
                $order['sistemaSync'] = [];
            }
            $order['sistemaSync']['syncedAt'] = gmdate('Y-m-d\TH:i:s.v\Z');
            if (isset($body['invoiceNumber'])) {
                $order['sistemaSync']['invoiceNumber'] = $body['invoiceNumber'];
            }
            if (isset($body['notes'])) {
                $order['sistemaSync']['notes'] = $body['notes'];
            }
            $updatedOrder = $order;
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => "Pedido con ID {$orderId} no encontrado"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    saveOrders($dataFile, $orders);
    echo json_encode([
        'success' => true,
        'message' => "Pedido {$orderId} actualizado correctamente",
        'order' => $updatedOrder
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Crear pedido desde el checkout: POST /api/sistema/orders o POST /api/orders
if (($method === 'POST') && (strpos($requestUri, '/api/sistema/orders') !== false || strpos($requestUri, '/api/orders') !== false)) {
    // Permitir creación pública desde la web de pedidos, o con api key
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Cuerpo JSON inválido'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $orders = getOrders($dataFile);
    $newId = isset($body['id']) ? $body['id'] : 'ORD-' . round(microtime(true) * 1000) . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));

    $newOrder = array_merge($body, [
        'id' => $newId,
        'createdAt' => gmdate('Y-m-d\TH:i:s.v\Z'),
        'status' => isset($body['status']) ? $body['status'] : 'pending'
    ]);

    array_unshift($orders, $newOrder);
    saveOrders($dataFile, $orders);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'orderId' => $newId,
        'order' => $newOrder
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Listar pedidos: GET /api/sistema/orders
if (strpos($requestUri, '/api/sistema/orders') !== false || strpos($requestUri, '/api/orders') !== false) {
    checkAuth($API_KEY);
    $orders = getOrders($dataFile);

    // Filtro por status opcional
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $statusFilter = strtolower($_GET['status']);
        $orders = array_values(array_filter($orders, function($o) use ($statusFilter) {
            return isset($o['status']) && strtolower($o['status']) === $statusFilter;
        }));
    }

    // Límite opcional
    if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
        $limit = intval($_GET['limit']);
        $orders = array_slice($orders, 0, $limit);
    }

    echo json_encode([
        'success' => true,
        'count' => count($orders),
        'orders' => $orders
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Endpoint no reconocido
http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => 'Ruta API no encontrada'
], JSON_UNESCAPED_UNICODE);
