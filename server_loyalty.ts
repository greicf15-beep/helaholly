import fs from 'fs';
import path from 'path';

export interface CashierCustomer {
  id: string;
  name: string;
  phone: string;
  cleanPhone: string;
  email?: string;
  birthdate: string; // YYYY-MM-DD
  stamps: number; // 0 to 5
  rewardAvailable?: 'bubble-waffle' | 'milkshake' | 'frapuccino' | 'any' | null;
  lastBirthdayClaimedYear?: number;
  totalPurchasesCount: number;
  totalSpent: number;
  lastVisitAt?: string;
  lastStore?: string;
  history: Array<{
    date: string;
    type: 'stamp_added' | 'reward_redeemed' | 'birthday_redeemed' | 'registered';
    detail: string;
    store?: string;
    amount?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    // Seed with initial example customers for demonstration
    const initial: CashierCustomer[] = [
      {
        id: 'cust-1',
        name: 'Valentina Rodríguez',
        phone: '0414-9876543',
        cleanPhone: '04149876543',
        birthdate: '1998-09-28', // Septiembre (Mes actual!)
        stamps: 4,
        totalPurchasesCount: 4,
        totalSpent: 28.50,
        lastVisitAt: new Date().toISOString(),
        lastStore: 'Sede 5 de Julio',
        history: [
          { date: new Date().toISOString(), type: 'registered', detail: 'Registro inicial VIP', store: 'Sede 5 de Julio' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cust-2',
        name: 'Carlos Mendoza',
        phone: '0424-5551234',
        cleanPhone: '04245551234',
        birthdate: '1995-10-15',
        stamps: 5,
        rewardAvailable: 'any',
        totalPurchasesCount: 5,
        totalSpent: 34.00,
        lastVisitAt: new Date().toISOString(),
        lastStore: 'Sede Delicias Norte',
        history: [
          { date: new Date().toISOString(), type: 'stamp_added', detail: 'Sello 5 acumulado - Premio desbloqueado', store: 'Sede Delicias Norte' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  // Normalize Venezuelan country code (58)
  if (cleaned.startsWith('58') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.slice(2);
  }
  // Strip leading 0 if needed for matching flexibility, but keep consistent
  return cleaned;
}

export function getAllCustomers(): CashierCustomer[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading customers.json:', e);
    return [];
  }
}

function saveCustomers(customers: CashierCustomer[]) {
  ensureDataFile();
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), 'utf-8');
}

export function findCustomerByPhone(phone: string): CashierCustomer | null {
  const customers = getAllCustomers();
  const target = cleanPhoneNumber(phone);
  if (!target) return null;

  return customers.find(c => {
    const cp = cleanPhoneNumber(c.phone);
    return cp === target || (target.length >= 7 && cp.endsWith(target.slice(-7)));
  }) || null;
}

export function registerCashierCustomer(data: {
  name: string;
  phone: string;
  birthdate: string;
  store?: string;
  initialAmount?: number;
}): CashierCustomer {
  const customers = getAllCustomers();
  const cleaned = cleanPhoneNumber(data.phone);

  const existing = findCustomerByPhone(data.phone);
  if (existing) {
    throw new Error('Ya existe un cliente registrado con este número telefónico.');
  }

  const initialAmount = Number(data.initialAmount) || 0;
  const earnsStamp = initialAmount >= 4.0;
  const initialStamps = earnsStamp ? 1 : 0;

  const now = new Date().toISOString();
  const newCust: CashierCustomer = {
    id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.name.trim(),
    phone: data.phone.trim(),
    cleanPhone: cleaned,
    birthdate: data.birthdate,
    stamps: initialStamps,
    rewardAvailable: null,
    totalPurchasesCount: initialAmount > 0 ? 1 : 0,
    totalSpent: initialAmount,
    lastVisitAt: now,
    lastStore: data.store || 'Sede Tienda Física',
    history: [
      {
        date: now,
        type: 'registered',
        detail: earnsStamp ? 'Registro VIP con compra mínima $4 (+1 Sello)' : 'Registro VIP en caja',
        store: data.store,
        amount: initialAmount,
      }
    ],
    createdAt: now,
    updatedAt: now,
  };

  customers.unshift(newCust);
  saveCustomers(customers);
  return newCust;
}

export function addStampToCustomer(phone: string, amount: number, store?: string): CashierCustomer {
  if (amount < 4.0) {
    throw new Error('La compra debe ser de mínimo $4.00 para sumar un sello.');
  }

  const customers = getAllCustomers();
  const target = cleanPhoneNumber(phone);
  const index = customers.findIndex(c => cleanPhoneNumber(c.phone) === target || cleanPhoneNumber(c.phone).endsWith(target.slice(-7)));

  if (index === -1) {
    throw new Error('Cliente no encontrado con ese número telefónico.');
  }

  const customer = customers[index];
  let nextStamps = customer.stamps;
  let nextReward = customer.rewardAvailable;

  if (nextStamps < 4) {
    nextStamps += 1;
  } else {
    // Reached 5 stamps!
    nextStamps = 5;
    nextReward = 'any';
  }

  const now = new Date().toISOString();
  customer.stamps = nextStamps;
  customer.rewardAvailable = nextReward;
  customer.totalPurchasesCount = (customer.totalPurchasesCount || 0) + 1;
  customer.totalSpent = (customer.totalSpent || 0) + amount;
  customer.lastVisitAt = now;
  if (store) customer.lastStore = store;
  customer.updatedAt = now;

  customer.history.unshift({
    date: now,
    type: 'stamp_added',
    detail: nextStamps === 5 ? '¡Sello 5 acumulado! Premio desbloqueado' : `Sello ${nextStamps}/5 añadido (Compra: $${amount.toFixed(2)})`,
    store,
    amount,
  });

  customers[index] = customer;
  saveCustomers(customers);
  return customer;
}

export function redeemStampRewardInCashier(phone: string, rewardItem: 'bubble-waffle' | 'milkshake' | 'frapuccino', store?: string): CashierCustomer {
  const customers = getAllCustomers();
  const target = cleanPhoneNumber(phone);
  const index = customers.findIndex(c => cleanPhoneNumber(c.phone) === target || cleanPhoneNumber(c.phone).endsWith(target.slice(-7)));

  if (index === -1) {
    throw new Error('Cliente no encontrado.');
  }

  const customer = customers[index];
  if (customer.stamps < 5 && !customer.rewardAvailable) {
    throw new Error('El cliente no tiene 5 sellos acumulados para canjear este premio.');
  }

  const label = rewardItem === 'bubble-waffle' ? 'Bubble Waffle' : rewardItem === 'milkshake' ? 'Milkshake' : 'Frappuccino';
  const now = new Date().toISOString();

  // Reset stamps and consume reward
  customer.stamps = 0;
  customer.rewardAvailable = null;
  customer.lastVisitAt = now;
  if (store) customer.lastStore = store;
  customer.updatedAt = now;

  customer.history.unshift({
    date: now,
    type: 'reward_redeemed',
    detail: `Premio 5 Sellos entregado: ${label} ($0.00 GRATIS)`,
    store,
  });

  customers[index] = customer;
  saveCustomers(customers);
  return customer;
}

export function redeemBirthdayRewardInCashier(phone: string, store?: string): CashierCustomer {
  const customers = getAllCustomers();
  const target = cleanPhoneNumber(phone);
  const index = customers.findIndex(c => cleanPhoneNumber(c.phone) === target || cleanPhoneNumber(c.phone).endsWith(target.slice(-7)));

  if (index === -1) {
    throw new Error('Cliente no encontrado.');
  }

  const customer = customers[index];
  const currentYear = new Date().getFullYear();

  if (customer.lastBirthdayClaimedYear === currentYear) {
    throw new Error(`El cliente ya canjeó su regalo de cumpleaños correspondiente al año ${currentYear}.`);
  }

  const now = new Date().toISOString();
  customer.lastBirthdayClaimedYear = currentYear;
  customer.lastVisitAt = now;
  if (store) customer.lastStore = store;
  customer.updatedAt = now;

  customer.history.unshift({
    date: now,
    type: 'birthday_redeemed',
    detail: `Regalo de Cumpleaños entregado: 1 Sundae de Película ($0.00 GRATIS)`,
    store,
  });

  customers[index] = customer;
  saveCustomers(customers);
  return customer;
}
