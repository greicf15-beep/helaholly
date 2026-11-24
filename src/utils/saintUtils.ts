import { CartItem, StoreLocation } from '../types';

export const SKU_MAP: Record<string, string> = {
  // Gelato & Barquillas
  'barquilla-1-porcion-custom': '010045',
  'barquillon-1-porcion-custom': '010046',
  'barquillon-2-porciones-custom': '010047',
  'tina-1-porcion-custom': '010048',
  'tina-2-porciones-custom': '010049',
  'gelato-16oz-custom': '010025',
  'gelato-1lt-basica': '010020',
  'gelato-1lt-premium': '010021',
  'gelato-1lt-pelicula': '010022',
  'gelato-1lt-deluxe': '010023',
  'g4': '010070', // Concha de Coco
  'cookies-chip': '010085',
  'brownie-fudge': '010090',
  'milkshakes-custom-gelato': '010075',
  'frapuccinos-custom-gelato': '010080',
  'promos-grouped': '010095',
  'promo-basico': '010096',
  'promo-hollylunch': '010097',
  'promo-casa-premium': '010098',
  'promo-casa-pelicula': '010099',
  'promo-casa-deluxe': '010100',

  // Soft
  's8': '010040', // Barquilla Soft
  'tinas-custom': '010010', // Tina 6oz
  's4': '010014', // Tina Galleta 14 oz
  's5': '010060', // Bubble Waffle 16 oz
  's9': '010065', // Maxi Sundae Básico
  'sundae-7oz': '010030',
  'sundae-frutas-7oz': '010031',
  'sundae-12oz': '010032',
  'frosty-tradicional-7oz': '010035',
  'frosty-tradicional-12oz': '010036',
  'frosty-especial-12oz': '010037',
  'milkshakes-custom-soft': '010050',
  'frapuccinos-custom-soft': '010055',
  'delivery': 'SERV-DELIV',
};

/**
 * Returns the exact Saint ERP CodProd for any CartItem
 */
export function getItemSaintSku(item: CartItem): string {
  if (item.sku) return item.sku;
  
  if (item.id === 'tinas-custom' && item.customization?.size) {
    if (item.customization.size === '12oz') return '010011';
    if (item.customization.size === '16oz') return '010012';
    return '010010'; // 6oz default
  }

  if (item.id === 'sundae-7oz' && item.customization?.size) {
    if (item.customization.size === '12oz') return '010032';
    return '010030'; // 7oz default
  }

  if (item.id === 'frosty-tradicional-7oz' && item.customization?.size) {
    if (item.customization.size === '12oz') return '010036';
    return '010035'; // 7oz default
  }

  return SKU_MAP[item.id] || '010001';
}

/**
 * Builds a clear customization text for kitchen/counter command
 */
export function buildCustomizationText(item: CartItem): string {
  const parts: string[] = [];
  if (item.customization?.flavor) parts.push(`Sabor: ${item.customization.flavor}`);
  if (item.customization?.team) parts.push(`Team: ${item.customization.team}`);
  if (item.customization?.premiumTopping) parts.push(`Topping Prem: ${item.customization.premiumTopping}`);
  if (item.customization?.magicLayer) parts.push(`Capa: ${item.customization.magicLayer}`);
  if (item.customization?.toppings && item.customization.toppings.length > 0) {
    parts.push(`Toppings: ${item.customization.toppings.join(', ')}`);
  }
  if (item.customization?.extraToppings && item.customization.extraToppings.length > 0) {
    const extras = item.customization.extraToppings.map(e => `${e.name}${e.flavor ? ` (${e.flavor})` : ''}`).join(', ');
    parts.push(`Extras: ${extras}`);
  }
  return parts.join(' | ');
}

/**
 * Transforms cart items into Saint ERP SAITEMFAC format
 */
export function formatItemsForSaint(cart: CartItem[], deliveryFee: number = 0) {
  let line = 1;
  const items: any[] = [];

  for (const item of cart) {
    const codProd = getItemSaintSku(item);
    const customizationText = buildCustomizationText(item);
    
    items.push({
      line: line++,
      codProd,
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      priceUsd: item.price,
      subtotalUsd: Number((item.price * item.quantity).toFixed(2)),
      isExempt: true, // Helados comúnmente alícuota general o exenta según configuración de Saint
      customizationText: customizationText || undefined,
      customization: item.customization ? {
        flavor: item.customization.flavor,
        flavors: item.customization.flavor?.split(', ') || [],
        team: item.customization.team,
        magicLayer: item.customization.magicLayer,
        toppings: item.customization.toppings || [],
        extraToppings: item.customization.extraToppings || []
      } : undefined
    });
  }

  // Inject delivery as a service line if applicable
  if (deliveryFee > 0) {
    items.push({
      line: line++,
      codProd: 'SERV-DELIV',
      name: 'Servicio de Delivery',
      quantity: 1,
      priceUsd: deliveryFee,
      subtotalUsd: deliveryFee,
      isExempt: false
    });
  }

  return items;
}
