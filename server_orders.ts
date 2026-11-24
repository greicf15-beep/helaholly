import fs from 'fs';
import path from 'path';

export interface SistemaOrderItem {
  line?: number;
  codProd?: string;
  id?: string;
  name: string;
  price?: number;
  priceUsd?: number;
  quantity: number;
  subtotal?: number;
  subtotalUsd?: number;
  isExempt?: boolean;
  customizationText?: string;
  customization?: {
    flavor?: string;
    flavors?: string[];
    team?: string;
    premiumTopping?: string;
    magicLayer?: string;
    toppings?: string[];
    extraToppings?: Array<{ name: string; price: number; flavor?: string }>;
  } | null;
}

export interface SistemaOrderStore {
  storeCode: string;
  storeName: string;
  warehouseCode: string;
}

export interface SistemaOrderCustomer {
  docId?: string; // V-..., E-..., J-..., G-..., o V00000000
  name: string;
  phone: string;
  email?: string;
  address?: string;
  referencePoint?: string;
  location?: { lat: number; lng: number } | null;
}

export interface SistemaOrderPayment {
  method: 'pago_movil' | 'zelle' | 'efectivo_usd' | 'punto' | 'whatsapp' | string;
  reference?: string;
  originBank?: string;
  destinationBank?: string;
  amountBs?: number;
  amountUsd?: number;
  exchangeRate?: number;
  paidAt?: string;
  proofUrl?: string;
  notes?: string;
}

export interface SistemaOrderFinancials {
  subtotalUsd: number;
  deliveryFeeUsd: number;
  taxUsd: number;
  totalUsd: number;
  totalBs: number;
  exchangeRate: number;
}

export interface SistemaOrder {
  id: string;
  createdAt: string;
  store: SistemaOrderStore | string;
  mode: 'in-store' | 'delivery' | 'pickup' | string;
  vehicleType?: string | null;
  customer: SistemaOrderCustomer;
  payment?: SistemaOrderPayment;
  items: SistemaOrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  financials?: SistemaOrderFinancials;
  status: 'pending' | 'en_caja' | 'facturado' | 'atendido' | 'en_camino' | 'entregado' | 'cancelado' | string;
  rewardsClaimed?: {
    birthday?: boolean;
    stampReward?: string | null;
  };
  sistemaSync?: {
    syncedAt?: string | null;
    saintOrderNumber?: string | null;
    invoiceNumber?: string | null;
    terminalId?: string | null;
    notes?: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    // Seed initial sample order for testing purposes
    const sampleOrder: SistemaOrder = {
      id: 'ORD-DEMO-001',
      createdAt: new Date().toISOString(),
      customer: {
        name: 'Cliente Demo',
        phone: '584120000000',
        address: 'Av. 5 de Julio, Maracaibo',
        location: { lat: 10.6698, lng: -71.6094 },
      },
      store: 'Sede 5 de Julio',
      mode: 'delivery',
      vehicleType: 'moto',
      items: [
        {
          id: 'sample-1',
          name: 'Barquilla Hollywood Especial',
          price: 3.5,
          quantity: 2,
          subtotal: 7.0,
          customization: {
            flavor: 'Chocolate Fudge',
            magicLayer: 'Capa Mágica de Avellana',
            toppings: ['Lluvia de Chocolate (20g)', 'Maní Tostado (20g)'],
          },
        },
      ],
      subtotal: 7.0,
      deliveryFee: 2.0,
      total: 9.0,
      status: 'pending',
      sistemaSync: {
        notes: 'Pedido de demostración para pruebas del sistema administrativo',
      },
    };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([sampleOrder], null, 2), 'utf-8');
  }
}

export function getAllOrders(): SistemaOrder[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading orders.json:', err);
    return [];
  }
}

export function saveAllOrders(orders: SistemaOrder[]): void {
  ensureDataFile();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders.json:', err);
  }
}

export function addOrder(newOrderData: Omit<SistemaOrder, 'id' | 'createdAt' | 'status'> & { id?: string; status?: string }): SistemaOrder {
  const orders = getAllOrders();
  const id = newOrderData.id || `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const order: SistemaOrder = {
    ...newOrderData,
    id,
    createdAt: new Date().toISOString(),
    status: newOrderData.status || 'pending',
  };

  orders.unshift(order);
  saveAllOrders(orders);
  return order;
}

export function updateOrder(
  id: string,
  updates: { 
    status?: string; 
    saintOrderNumber?: string;
    invoiceNumber?: string; 
    terminalId?: string;
    notes?: string;
  }
): SistemaOrder | null {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;

  const current = orders[index];
  const updated: SistemaOrder = {
    ...current,
    status: updates.status || current.status,
    sistemaSync: {
      ...current.sistemaSync,
      syncedAt: new Date().toISOString(),
      ...(updates.saintOrderNumber ? { saintOrderNumber: updates.saintOrderNumber } : {}),
      ...(updates.invoiceNumber ? { invoiceNumber: updates.invoiceNumber } : {}),
      ...(updates.terminalId ? { terminalId: updates.terminalId } : {}),
      ...(updates.notes ? { notes: updates.notes } : {}),
    },
  };

  orders[index] = updated;
  saveAllOrders(orders);
  return updated;
}
