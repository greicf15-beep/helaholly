import { RewardItem, LoyaltyTier, CartItem } from './types';

// Interruptor maestro para producción: cambiar a `true` cuando Club Hollywood se lance al público
export const CLUB_HOLLYWOOD_PRODUCTION_ENABLED = false;

export const POINTS_PER_DOLLAR = 30;

export const LOYALTY_TIERS: Record<string, LoyaltyTier> = {
  Bronce: {
    name: 'Bronce',
    minPoints: 0,
    maxPoints: 999,
    color: '#cd7f32',
    bgGradient: 'from-[#8B4513]/10 to-[#cd7f32]/20',
    borderClass: 'border-[#cd7f32]/40',
    badgeText: 'Nivel Bronce',
    benefit: 'Gana 30 pts por cada $1 + Helado regalo en tu cumpleaños'
  },
  Plata: {
    name: 'Plata',
    minPoints: 1000,
    maxPoints: 2499,
    color: '#94a3b8',
    bgGradient: 'from-slate-100 to-slate-200',
    borderClass: 'border-slate-300',
    badgeText: 'Socio Plata',
    benefit: 'Desbloqueo de Barquillas, Frosty y Sundaes de regalo'
  },
  Oro: {
    name: 'Oro',
    minPoints: 2500,
    maxPoints: 4999,
    color: '#f6b40c',
    bgGradient: 'from-[#fdf8e1] to-[#fde047]/30',
    borderClass: 'border-[#f6b40c]/50',
    badgeText: 'Socio Oro',
    benefit: 'Desbloqueo de Tinas, Milkshakes y Maxi Sundae de regalo'
  },
  VIP: {
    name: 'VIP',
    minPoints: 5000,
    maxPoints: 99999,
    color: '#e1a139',
    bgGradient: 'from-[#5a2f0f] to-[#e1a139]',
    borderClass: 'border-[#f6b40c]',
    badgeText: 'VIP Hollywood',
    benefit: 'Desbloqueo de Bubble Waffle 16oz, Tinas 16oz y Frappuccinos de regalo'
  }
};

/**
 * Tabla oficial de Puntos Hollywood Soft:
 * Contiene el valor de acumulación y valor de canje exactos por producto.
 */
export const HOLLYWOOD_SOFT_POINTS_TABLE = {
  barquilla: { name: 'Barquilla Tradicional', price: 1.00, earn: 30, redeem: 540 },
  sundae7oz: { name: 'Sundae 7 oz', price: 1.80, earn: 54, redeem: 972 },
  sundae12oz: { name: 'Sundae 12 oz', price: 3.00, earn: 90, redeem: 1620 },
  sundaeFrutas7oz: { name: 'Sundae de Frutas 7 oz', price: 2.00, earn: 60, redeem: 1080 },
  sundaePelicula7oz: { name: 'Sundae de Película 7 oz', price: 2.00, earn: 60, redeem: 1080 },
  sundaePelicula12oz: { name: 'Sundae de Película 12 oz', price: 2.90, earn: 87, redeem: 1566 },
  frostyTrad7oz: { name: 'Frosty Chicha Tradicional 7 oz', price: 1.70, earn: 51, redeem: 918 },
  frostyTrad12oz: { name: 'Frosty Chicha Tradicional 12 oz', price: 2.60, earn: 78, redeem: 1404 },
  frappuccinos: { name: 'Frappuccinos Original / Tiramisú', price: 4.95, earn: 149, redeem: 2682 },
  milkshakeTrad: { name: 'Milkshakes Tradicionales (Oreo, Toddy, Brownie)', price: 4.40, earn: 132, redeem: 2376 },
  milkshakeEsp: { name: 'Milkshakes Especiales (Ferrero, Frutos del Bosque)', price: 5.60, earn: 168, redeem: 3024 },
  tina6oz: { name: 'Tina 6 oz', price: 3.30, earn: 99, redeem: 1782 },
  tina12oz: { name: 'Tina 12 oz', price: 4.15, earn: 125, redeem: 2250 },
  tina16oz: { name: 'Tina 16 oz', price: 5.97, earn: 179, redeem: 3222 },
  bubbleWaffle16oz: { name: 'Bubble Waffle 16 oz', price: 6.50, earn: 195, redeem: 3510 },
  tinaGalleta14oz: { name: 'Tina Galleta 14 oz', price: 4.75, earn: 143, redeem: 2574 },
  maxiSundae: { name: 'Maxi Sundae', price: 3.30, earn: 99, redeem: 1782 },
  frostyEsp12oz: { name: 'Frosty Chicha Especial 12 oz', price: 3.30, earn: 99, redeem: 1782 },
};

/**
 * Obtiene los puntos de acumulación exactos para un producto base en el catálogo / menú.
 */
export function getProductAccumulationPoints(product: { id: string; category?: string; price: number }): number {
  if (product.category === 'soft') {
    switch (product.id) {
      case 'tinas-custom':
        return 99; // Tina 6 oz ($3.30)
      case 's4':
        return 143; // Tina Galleta 14 oz ($4.75)
      case 's5':
        return 195; // Bubble Waffle 16 oz ($6.50)
      case 'sundae-7oz':
        return 54; // Sundae 7 oz ($1.80)
      case 'sundae-12oz':
        return 90; // Sundae 12 oz ($3.00)
      case 'sundae-frutas-7oz':
        return 60; // Sundae de Frutas 7 oz ($2.00)
      case 'frosty-tradicional-7oz':
        return 51; // Frosty Chicha Tradicional 7 oz ($1.70)
      case 'frosty-tradicional-12oz':
        return 78; // Frosty Chicha Tradicional 12 oz ($2.60)
      case 'frosty-especial-12oz':
        return 99; // Frosty Chicha Especial 12 oz ($3.30)
      case 's8':
        return 30; // Barquilla Tradicional ($1.00)
      case 's9':
        return 99; // Maxi Sundae ($3.30)
      case 'milkshakes-custom-soft':
        return 132; // Milkshakes Soft tradicionales ($4.40)
      case 'frapuccinos-custom-soft':
        return 149; // Frappuccinos Soft ($4.95)
    }
  }

  // Regla para productos Gelato o combos: 30 puntos por cada $1
  return Math.round(product.price * 30);
}

/**
 * Obtiene los puntos de acumulación para un producto con su tamaño/sabor personalizado.
 */
export function getCustomizedItemAccumulationPoints(
  productId: string,
  price: number,
  category?: string,
  customization?: { size?: string; flavor?: string }
): number {
  if (category === 'soft') {
    if (productId === 's8') return 30;
    if (productId === 'sundae-7oz') {
      const size = customization?.size;
      if (size === '12oz') return 90;
      return 54; // 7oz
    }
    if (productId === 'sundae-12oz') return 90;
    if (productId === 'sundae-frutas-7oz') return 60;
    if (productId === 'frosty-tradicional-7oz') {
      const size = customization?.size;
      if (size === '12oz') return 78;
      return 51; // 7oz
    }
    if (productId === 'frosty-tradicional-12oz') return 78;
    if (productId === 'frosty-especial-12oz') return 99;
    if (productId === 's9') return 99;
    if (productId === 's4') return 143;
    if (productId === 's5') return 195;
    if (productId === 'tinas-custom') {
      const size = customization?.size;
      if (size === '12oz') return 125;
      if (size === '16oz') return 179;
      return 99; // 6oz
    }
    if (productId === 'milkshakes-custom-soft') {
      const flavor = customization?.flavor?.toLowerCase() || '';
      if (flavor.includes('ferrero') || flavor.includes('bosque')) {
        return 168;
      }
      return 132;
    }
    if (productId === 'frapuccinos-custom-soft') {
      return 149;
    }
  }

  return Math.round(price * 30);
}

/**
 * Calcula la acumulación exacta de puntos para los productos del carrito
 */
export function calculateCartAccumulationPoints(cart: CartItem[]): number {
  let totalPoints = 0;
  for (const item of cart) {
    if (item.isReward) continue;
    totalPoints += getCustomizedItemAccumulationPoints(item.id, item.price, item.category, item.customization) * item.quantity;
  }
  return totalPoints;
}

export const REWARDS_CATALOG: RewardItem[] = [
  // 1. Barquilla Tradicional (540 pts)
  {
    id: 'reward-soft-barquilla',
    name: 'Barquilla Tradicional',
    description: 'El clásico cono crujiente con nuestro suave helado soft.',
    pointsRequired: 540,
    category: 'soft',
    tierRequired: 'Bronce',
    valueUsd: 1.00,
    image: './barquilla.webp',
    productId: 's8'
  },
  // 2. Frosty Tradicional 7 oz (918 pts)
  {
    id: 'reward-frosty-7oz',
    name: 'Frosty Tradicional 7 oz',
    description: 'Refrescante Frosty tradicional de 7 oz con un toque especial.',
    pointsRequired: 918,
    category: 'soft',
    tierRequired: 'Bronce',
    valueUsd: 1.70,
    image: './frosty.webp',
    productId: 'frosty-tradicional-7oz'
  },
  // 3. Sundae Clásico 7 oz (972 pts)
  {
    id: 'reward-sundae-7oz',
    name: 'Sundae Clásico 7 oz',
    description: 'Helado soft 7 oz con sirope y toppings clásicos.',
    pointsRequired: 972,
    category: 'soft',
    tierRequired: 'Bronce',
    valueUsd: 1.80,
    image: './sundae.webp',
    productId: 'sundae-7oz'
  },
  // 4. Sundae de Frutas 7 oz (1.080 pts)
  {
    id: 'reward-sundae-frutas-7oz',
    name: 'Sundae Frutas 7 oz',
    description: 'Helado soft 7 oz con deliciosas frutas frescas y sirope.',
    pointsRequired: 1080,
    category: 'soft',
    tierRequired: 'Plata',
    valueUsd: 2.00,
    image: '/assets/aistudio/SUNDAEFRUTAS_881be972.webp',
    productId: 'sundae-frutas-7oz'
  },
  // 5. Frosty Tradicional 12 oz (1.404 pts)
  {
    id: 'reward-frosty-12oz',
    name: 'Frosty Tradicional 12 oz',
    description: 'Refrescante Frosty tradicional en presentación grande de 12 oz.',
    pointsRequired: 1404,
    category: 'soft',
    tierRequired: 'Plata',
    valueUsd: 2.60,
    image: './frosty.webp',
    productId: 'frosty-tradicional-12oz'
  },
  // 6. Sundae Clásico 12 oz (1.620 pts)
  {
    id: 'reward-sundae-12oz',
    name: 'Sundae Clásico 12 oz',
    description: 'Helado soft 12 oz con sirope y doble ración de toppings.',
    pointsRequired: 1620,
    category: 'soft',
    tierRequired: 'Plata',
    valueUsd: 3.00,
    image: './sundaechocolate.webp',
    productId: 'sundae-12oz'
  },
  // 7. Tina Soft 6 oz (1.782 pts)
  {
    id: 'reward-tina-6oz',
    name: 'Tina Soft 6 oz con Toppings',
    description: 'Tina personal de 6 oz con tu sabor favorito y 3 contornos.',
    pointsRequired: 1782,
    category: 'soft',
    tierRequired: 'Oro',
    valueUsd: 3.30,
    image: './tina6oz.webp',
    productId: 'tinas-custom'
  },
  // 8. Maxi Sundae (1.782 pts)
  {
    id: 'reward-maxi-sundae',
    name: 'Maxi Sundae',
    description: 'La versión definitiva del sundae con capas extra de sabor.',
    pointsRequired: 1782,
    category: 'soft',
    tierRequired: 'Oro',
    valueUsd: 3.30,
    image: '/assets/aistudio/maxisundae_7ee2bb08.webp',
    productId: 's9'
  },
  // 9. Frosty Especial 12 oz (1.782 pts)
  {
    id: 'reward-frosty-especial-12oz',
    name: 'Frosty Especial 12 oz',
    description: 'Frosty especial de 12 oz con contornos y combinación premium.',
    pointsRequired: 1782,
    category: 'soft',
    tierRequired: 'Oro',
    valueUsd: 3.30,
    image: '/assets/aistudio/frostyespecialproducto_9de45733.webp',
    productId: 'frosty-especial-12oz'
  },
  // 10. Tina Soft 12 oz (2.250 pts)
  {
    id: 'reward-tina-12oz',
    name: 'Tina Soft Familiar 12 oz',
    description: 'Tina mediana de 12 oz para compartir con 3 contornos.',
    pointsRequired: 2250,
    category: 'soft',
    tierRequired: 'Oro',
    valueUsd: 4.15,
    image: './tina12oz.webp',
    productId: 'tinas-custom'
  },
  // 11. Milkshake Soft Tradicional (2.376 pts)
  {
    id: 'reward-milkshake-soft-trad',
    name: 'Milkshake Soft Tradicional',
    description: 'Cremoso milkshake a elección: Oreo, Toddy Crunch o Brownie Snickers.',
    pointsRequired: 2376,
    category: 'soft',
    tierRequired: 'Oro',
    valueUsd: 4.40,
    image: './milkshakesoft.webp',
    productId: 'milkshakes-custom-soft'
  },
  // 12. Tina Galleta Soft 14 oz (2.574 pts)
  {
    id: 'reward-tina-galleta-14oz',
    name: 'Tina Galleta Soft 14 oz',
    description: 'Tina de helado soft 14 oz servida en cesta de galleta crujiente.',
    pointsRequired: 2574,
    category: 'soft',
    tierRequired: 'VIP',
    valueUsd: 4.75,
    image: './tina_cesta.webp',
    productId: 's4'
  },
  // 13. Frappuccino Soft (2.682 pts)
  {
    id: 'reward-frappuccino-soft',
    name: 'Frappuccino Soft Original / Tiramisú',
    description: 'Refrescante frappuccino helado a elección: Original o Tiramisú.',
    pointsRequired: 2682,
    category: 'soft',
    tierRequired: 'VIP',
    valueUsd: 4.95,
    image: './frappuccinosoft.webp',
    productId: 'frapuccinos-custom-soft'
  },
  // 14. Milkshake Soft Especial (3.024 pts)
  {
    id: 'reward-milkshake-soft-esp',
    name: 'Milkshake Soft Especial (Ferrero / Frutos del Bosque)',
    description: 'Milkshake premium a elección: Ferrero Rochers o Frutos del Bosque.',
    pointsRequired: 3024,
    category: 'soft',
    tierRequired: 'VIP',
    valueUsd: 5.60,
    image: './merengadagelatoferreros.webp',
    productId: 'milkshakes-custom-soft'
  },
  // 15. Tina Soft 16 oz (3.222 pts)
  {
    id: 'reward-tina-16oz',
    name: 'Tina Soft Grande 16 oz',
    description: 'Tina grande de 16 oz de suave helado soft con 3 contornos.',
    pointsRequired: 3222,
    category: 'soft',
    tierRequired: 'VIP',
    valueUsd: 5.97,
    image: './tina16oz.webp',
    productId: 'tinas-custom'
  },
  // 16. Bubble Waffle 16 oz (3.510 pts)
  {
    id: 'reward-bubble-waffle-16oz',
    name: 'Bubble Waffle 16 oz',
    description: 'Waffle esponjoso con burbujas 16 oz, helado soft y tus toppings favoritos.',
    pointsRequired: 3510,
    category: 'soft',
    tierRequired: 'VIP',
    valueUsd: 6.50,
    image: './bubble_waffle.webp',
    productId: 's5'
  }
];
