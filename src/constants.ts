import { Product, StoreType, StoreLocation } from './types';

export const TOPPINGS = [
  "Topping Cereales Azucarado", "Topping Cereales Crispy", "Topping Cereales Fruti Aro", "Topping Cereales Pop",
  "Topping Ciruelas", "Topping Cocosette troceado", "Topping Crocanti", "Topping Dandy", "Topping Flips",
  "Topping frutos del bosque", "Topping Brownie blanco", "Topping Galleta de Chocolate", "Topping Gomitas",
  "Topping Gotas de Chocolate Blanco", "Topping Gotas de Chocolate Oscuro", "Topping guanabana",
  "Topping Lluvia de Chocolate", "Topping Lluvia de Colores", "Topping Lluvia de Granilla de Coco",
  "Topping Lluvia de Mani", "Topping Miramar", "Topping Oreo de Chocolate", "Topping Pasion tropical",
  "Topping Susy troceado", "Topping Torta Brownie", "Toppping Fresas", "Toppping Higo", "Toppping Melocoton",
  "Toppping Piña en Almibar", "Baño Capita Magica Chocolate Blanco", "Baño Capita Magica Chocolate",
  "Sirop Arequipe", "Sirop Caramelo", "Sirop Chocolate", "Sirop Fresa Holly", "Sirop Leche Condensada",
  "Sirop Naranja citrica", "Sirop Ponche Crema"
];

export const TINA_SIZES = [
  { id: '6oz', label: '6oz', price: 3.50 },
  { id: '12oz', label: '12oz', price: 4.50 },
  { id: '16oz', label: '16oz', price: 6.70 }
];

export const TINA_FLAVORS = [
  "Mantecado", "Chocolate", "Dulce de Leche"
];

export const GELATO_BASICO_FLAVORS = ['Fresa', 'Mantecado', 'Chocolate Malteado', 'Napolitano'];
export const GELATO_PREMIUM_FLAVORS = [
  'Tiramisu', 'Biscotti Dolci', 'Brazo Gitano de Coco', "Hershey's", 
  'Sundae de Arequipe', 'Sundae de Chocolate', 'Sundae de Fresa', 
  'Brownie Snickers', 'Oreo', 'Ron Pasas', 'Tia Gesua', 
  'Cheesecake de Fresa', 'Chocolatissimo', 'Brownie', 'Brownie Fudge', 'Coco'
];
export const GELATO_PELICULA_FLAVORS = ['Ferrero Rocher', 'Chocolate Dubai'];
export const GELATO_DELUXE_FLAVORS = ['Pistacho'];

export const GELATO_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 9.65 },
  { id: 'premium', label: 'Línea Premium', price: 12.95 },
  { id: 'pelicula', label: 'Línea de Película', price: 16.10 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 23.50 }
];

export const GELATO_16OZ_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 4.40 },
  { id: 'premium', label: 'Línea Premium', price: 6.05 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 8.25 }
];

export const GELATO_16OZ_BASICO_FLAVORS = ['Fresa', 'Chocolattisimo', 'Ron Pasas'];
export const GELATO_16OZ_PREMIUM_FLAVORS = ['Brownie Snickers', 'Brazo Gitano de Coco'];
export const GELATO_16OZ_DELUXE_FLAVORS = ['Pistacho'];

export const BARQUILLA_1_PORCION_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 1.72 },
  { id: 'premium', label: 'Línea Premium', price: 2.33 },
  { id: 'pelicula', label: 'Línea de Película', price: 2.92 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 4.75 }
];

export const BARQUILLON_1_PORCION_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 2.48 },
  { id: 'premium', label: 'Línea Premium', price: 3.09 },
  { id: 'pelicula', label: 'Línea de Película', price: 3.69 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 5.49 }
];

export const BARQUILLON_2_PORCIONES_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 3.87 },
  { id: 'premium', label: 'Línea Premium', price: 5.09 },
  { id: 'pelicula', label: 'Línea de Película', price: 6.28 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 9.92 }
];

export const TINA_1_PORCION_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 1.70 },
  { id: 'premium', label: 'Línea Premium', price: 2.32 },
  { id: 'pelicula', label: 'Línea de Película', price: 2.91 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 4.74 }
];

export const TINA_2_PORCIONES_LINES = [
  { id: 'basica', label: 'Línea Básica', price: 3.09 },
  { id: 'premium', label: 'Línea Premium', price: 4.31 },
  { id: 'pelicula', label: 'Línea de Película', price: 5.50 },
  { id: 'deluxe', label: 'Línea Deluxe', price: 9.16 }
];

export const SOFT_FRAPUCCINO_FLAVORS = [
  { name: "Original", price: 4.95 },
  { name: "Tiramisú", price: 4.95 },
  { name: "Nutella", price: 8.15 },
  { name: "PISTACHO", price: 8.15 },
  { name: "NOCCIOLA", price: 8.15 }
];

export const SOFT_MILKSHAKE_FLAVORS = [
  { name: "Oreo", price: 4.40 },
  { name: "Toddy Crunch", price: 4.40 },
  { name: "Brownie Snickers", price: 4.40 },
  { name: "Ferrero Rochers", price: 5.60 },
  { name: "Frutos del Bosque", price: 5.60 }
];

export const GELATO_FRAPUCCINO_FLAVORS = [
  { name: "Frapuccino Original", price: 7.34 },
  { name: "Frapuccino Tiramisu", price: 7.40 }
];

export const GELATO_MERENGADA_FLAVORS = [
  { name: "Merengada Reeses", price: 7.80 },
  { name: "Merengada Oreo", price: 7.80 },
  { name: "Merengada Nutella", price: 7.80 },
  { name: "Merengada B-ready", price: 7.80 },
  { name: "Merengada Raffaello", price: 9.64 },
  { name: "Merengada Ferrero", price: 9.64 }
];

export const GELATO_EXTRA_PORTIONS = [
  { name: "Porción Básica", price: 1.38 },
  { name: "Porción Premium", price: 2.00 },
  { name: "Porción Película", price: 2.59 },
  { name: "Porción Deluxe", price: 4.43 }
];

export const EXTRA_TOPPINGS = [
  { name: "Topping Lluvia granilla pistacho", price: 2.00 },
  { name: "Topping Lluvia granilla avellana", price: 1.50 },
  { name: "Topping Lluvia granilla almendra", price: 1.50 },
  { name: "Topping Lluvia granilla merey", price: 1.50 },
  { name: "Topping Pirulin troceado", price: 1.50 },
  { name: "Topping Samba mini Fresa", price: 1.50 },
  { name: "Topping Cri cri", price: 1.50 },
  { name: "Baño Crema Kinder Bueno", price: 1.50 },
  { name: "Baño Crema Pistacho", price: 1.50 },
  { name: "Baño Crema Reeses white", price: 1.50 },
  { name: "Baño Crema Toddy", price: 1.50 },
  { name: "Sirop Nutella", price: 1.50 },
  { name: "TEAM LOLY WAFFLE", price: 0.80 },
  { name: "TEAM PANQUI", price: 0.80 },
  { name: "TEAM PIRULON", price: 0.80 },
  { name: "GALLETA / SUNDAE", price: 0.50 },
  { name: "BUBBLE", price: 2.00 }
];

export const PROMOS: Product[] = [
  {
    id: 'promo-basico',
    name: 'Combo basico',
    description: '1 Helado Basico 1 lt + 10 Conos. Elige tu sabor favorito.',
    price: 11.55,
    category: 'gelato',
    image: '/combobasico.webp?v=2',
    deliveryAvailable: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'promo-hollylunch',
    name: 'Promo HollyLunch',
    description: '1 Helado Premium 1 lt. + 1 Caja Holly Conos + 1 Bolso Hollylonchera. Elige tu sabor favorito.',
    price: 19.25,
    category: 'gelato',
    image: '/hollylunch.webp?v=2',
    deliveryAvailable: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'promo-casa-premium',
    name: 'Promo Hollywood a tu casa',
    description: '1 Helado Premium 1 lt. + 1 Caja de Holly Conos + 1 Cuchara para helados. Elige tu sabor favorito.',
    price: 18.50,
    category: 'gelato',
    image: '/Hollywoodatucasa.webp?v=2',
    deliveryAvailable: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'promo-casa-pelicula',
    name: 'Promo Hollywood a tu casa - de pelicula',
    description: '1 Helado Pelicula 1 lt + 1 Caja de Holly Conos. Elige tu sabor favorito.',
    price: 18.15,
    category: 'gelato',
    image: '/hollywoodatucasapelicula.webp?v=2',
    deliveryAvailable: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'promo-casa-deluxe',
    name: 'Promo Hollywood a tu casa - deluxe',
    description: '1 Helado Deluxe 1 lt + 1 Caja Holly Conos. Elige tu sabor favorito.',
    price: 25.50,
    category: 'gelato',
    image: '/hollywoodatucasadeluxe.webp?v=2',
    deliveryAvailable: true,
    isPackaged: true,
    isCustomizable: true
  }
];

export const COOKIE_BROWNIE_FLAVORS = [
  "Mantecado", "Fresa", "Chocolate", "Napolitano"
];

export const PRODUCTS: Product[] = [
  // Gelato
  {
    id: 'gelato-16oz-custom',
    name: 'Helado 16oz',
    description: 'Nuestro gelato artesanal en presentación de 16oz. Elige tu línea y sabor favorito.',
    price: 4.40,
    category: 'gelato',
    image: '/16oz.webp?v=2',
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'g4',
    name: 'Helado Concha de Coco',
    description: 'Delicioso helado servido en una auténtica concha de coco.',
    price: 3.20,
    category: 'gelato',
    image: '/helado_coco_en_concha.webp?v=2',
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true
  },
  {
    id: 'gelato-1lt-basica',
    name: '1LT Linea basica',
    description: 'Un litro de nuestro gelato artesanal Línea Básica. Elige tu sabor favorito.',
    price: 9.65,
    category: 'gelato',
    image: '/linea_basica.webp?v=2',
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'gelato-1lt-premium',
    name: '1LT Linea Premium',
    description: 'Un litro de nuestro gelato artesanal Línea Premium. Elige tu sabor favorito.',
    price: 12.95,
    category: 'gelato',
    image: '/linea_premium.webp?v=2',
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'gelato-1lt-pelicula',
    name: '1LT Linea de pelicula',
    description: 'Un litro de nuestro gelato artesanal Línea de Película. Elige tu sabor favorito.',
    price: 16.10,
    category: 'gelato',
    image: '/linea_pelicula.webp?v=2',
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true,
    isCustomizable: true
  },
  {
    id: 'gelato-1lt-deluxe',
    name: '1LT Linea deluxe',
    description: 'Un litro de nuestro gelato artesanal Línea Deluxe. Elige tu sabor favorito.',
    price: 23.50,
    category: 'gelato',
    image: '/linea_deluxe.webp?v=2',
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true,
    isCustomizable: true
  },
  // Pick-up only Gelato (Gelateria Stores only)
  {
    id: 'barquilla-1-porcion-custom',
    name: 'Barquilla 1 Porciòn',
    description: 'Elige tu línea de helado y sabor favorito para tu barquilla de una porción.',
    price: 1.72,
    category: 'gelato',
    image: '/barquilla 1porcion.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'barquillon-1-porcion-custom',
    name: 'Barquillon 1 Porciòn',
    description: 'Elige tu línea de helado y sabor favorito para tu barquillón de una porción.',
    price: 2.48,
    category: 'gelato',
    image: '/barquillon 1porcion.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'barquillon-2-porciones-custom',
    name: 'Barquillon 2 Porciones',
    description: 'Elige tu línea de helado y sabores favoritos para tu barquillón de dos porciones.',
    price: 3.87,
    category: 'gelato',
    image: '/barquillon 2 porciones.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'tina-1-porcion-custom',
    name: 'Tina 1 Porciòn',
    description: 'Elige tu línea de helado y sabor favorito para tu tina de una porción.',
    price: 1.70,
    category: 'gelato',
    image: '/tina1porcion.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'tina-2-porciones-custom',
    name: 'Tina 2 Porciones',
    description: 'Elige tu línea de helado y sabores favoritos para tu tina de dos porciones.',
    price: 3.09,
    category: 'gelato',
    image: '/tina2porciones.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'milkshakes-custom-gelato',
    name: 'Merengadas Gelato',
    description: 'Elige tu sabor favorito de merengada gelato: Reess, Oreo, Nutella, B-ready, Raffaello o Ferrero.',
    price: 7.80,
    category: 'gelato',
    image: '/milkshakegelato.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'frapuccinos-custom-gelato',
    name: 'Frappuccinos Gelato',
    description: 'Elige tu sabor favorito de frappuccino gelato: Original o Tiramisu.',
    price: 7.34,
    category: 'gelato',
    image: '/frappuccinogelato.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'cookies-chip',
    name: 'Cookies Chip',
    description: 'Galleta con chispas de chocolate. Elige tu sabor de helado favorito.',
    price: 4.83,
    category: 'gelato',
    image: '/COOKIE.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  {
    id: 'brownie-fudge',
    name: 'Brownie Fugde',
    description: 'Brownie de chocolate fudge. Elige tu sabor de helado favorito.',
    price: 5.11,
    category: 'gelato',
    image: '/BROWNIE FUDG.webp?v=2',
    deliveryAvailable: false,
    onlyInStore: true,
    isCustomizable: true
  },
  // Promos / Combos
  {
    id: 'promos-grouped',
    name: 'Promos / Combos',
    description: 'Descubre nuestras promociones especiales y combos de helado.',
    price: 0, // Will be determined by selection
    category: 'gelato',
    image: '/Promos.webp?v=2', // Main image for the promos group
    deliveryAvailable: true,
    onlyDelivery: true,
    isPackaged: true,
    isCustomizable: true
  },
  // Soft
  {
    id: 'tinas-custom',
    name: 'Tinas Holly',
    description: 'Personaliza tu tina con tu tamaño, sabor y 3 contornos favoritos.',
    price: 3.50,
    category: 'soft',
    image: '/Tinas.webp?v=2',
    deliveryAvailable: true,
    isCustomizable: true
  },
  {
    id: 's4',
    name: 'Tina Galleta',
    description: 'Tina de helado soft acompañada de galletas crujientes.',
    price: 5.70,
    category: 'soft',
    image: '/tina_cesta.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's5',
    name: 'Bubble Waffle',
    description: 'Waffle esponjoso con burbujas, helado soft y tus toppings favoritos.',
    price: 7.00,
    category: 'soft',
    image: '/bubble_waffle.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's6',
    name: 'Sundae',
    description: 'Helado soft con sirope y toppings clásicos.',
    price: 2.00,
    category: 'soft',
    image: '/sundae.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's7',
    name: 'Frosty Chicha',
    description: 'Refrescante helado de chicha con un toque especial.',
    price: 2.00,
    category: 'soft',
    image: '/frosty.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's8',
    name: 'Barquilla',
    description: 'El clásico cono crujiente con nuestro suave helado soft.',
    price: 1.65,
    category: 'soft',
    image: '/barquilla.webp?v=2',
    deliveryAvailable: false
  },
  {
    id: 's9',
    name: 'Maxi Sundae Básico',
    description: 'La versión definitiva del sundae con capas extra de sabor.',
    price: 4.50,
    category: 'soft',
    image: '/maxi.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's10',
    name: 'Maxi Sundae Premium',
    description: 'Maxi Sundae con toppings premium y sabores especiales.',
    price: 4.80,
    category: 'soft',
    image: '/maxi.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 'milkshakes-custom-soft',
    name: 'Milkshakes Soft',
    description: 'Elige tu sabor favorito de milkshake soft: Oreo, Toddy Crunch, Brownie Snickers, Ferrero Rochers o Frutos del Bosque.',
    price: 4.40,
    category: 'soft',
    image: '/milkshakesoft.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 'frapuccinos-custom-soft',
    name: 'Frappuccinos Soft',
    description: 'Elige tu sabor favorito de frappuccino soft: Original, Tiramisú, Nutella, Pistacho o Nocciola.',
    price: 4.95,
    category: 'soft',
    image: '/frappuccinosoft.webp?v=2',
    deliveryAvailable: false,
    isCustomizable: true
  }
];

export const HOLLYWOOD_STORES: StoreLocation[] = [
  {
    id: 'mcbo-farmavid',
    name: 'Hollywood Farmavid',
    address: 'Av. Circunvalación 2 con Calle 115, Maracaibo (Farmavid)',
    lat: 10.5981897,
    lng: -71.6482119,
    city: 'Maracaibo',
    type: 'gelateria',
    phone: '584121000643'
  },
  {
    id: 'cab-farmak',
    name: 'Hollywood Farmak',
    address: 'Av. Carnevalli con Calle Nueva Granada, Cabimas (Farmak)',
    lat: 10.3915256,
    lng: -71.4607155,
    city: 'Cabimas',
    type: 'gelateria',
    phone: '584146829225'
  },
  {
    id: 'mcbo-cima',
    name: 'Hollywood CC Cima Gelato',
    address: 'CC Cima, Av. Libertador, Maracaibo',
    lat: 10.6412835,
    lng: -71.6184280,
    city: 'Maracaibo',
    type: 'gelateria',
    phone: '584246290925'
  },
  {
    id: 'mcbo-zonanorte',
    name: 'Hollywood Zona Norte',
    address: 'Av. Rosal Sur. Calle 45 entre Av. 14 y 14A, Maracaibo',
    lat: 10.7001385,
    lng: -71.6227916,
    city: 'Maracaibo',
    type: 'gelateria',
    phone: '584247643040'
  },
  {
    id: 'cab-costamall',
    name: 'Hollywood CC Costa Mall',
    address: 'CC Costa Mall, Av. Intercomunal, Cabimas',
    lat: 10.3484878,
    lng: -71.4176744,
    city: 'Cabimas',
    type: 'soft',
    phone: '584246142820'
  },
  {
    id: 'mcbo-cima-soft',
    name: 'Hollywood CC Cima Soft',
    address: 'CC Cima, Av. Libertador, Maracaibo',
    lat: 10.6412835,
    lng: -71.6184280,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584246211655'
  },
  {
    id: 'mcbo-mallpaseo',
    name: 'Hollywood CC Mall Paseo',
    address: 'CC Mall Paseo, San Francisco (Av. 40)',
    lat: 10.5898,
    lng: -71.6558,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584246463591'
  },
  {
    id: 'mcbo-sanfelipe',
    name: 'Hollywood San Felipe',
    address: 'Casco Central, Av. 10 con Av. Libertador, Maracaibo (San Felipe)',
    lat: 10.6405678,
    lng: -71.6141801,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584246571962'
  },
  {
    id: 'mcbo-72',
    name: 'Hollywood Sede 72',
    address: 'Calle 72 con Avenida 13A, Maracaibo',
    lat: 10.6698035,
    lng: -71.6172572,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584126501375'
  },
  {
    id: 'val-naguanagua',
    name: 'Hollywood Naguanagua',
    address: 'Av. Salvador Feo La Cruz, Naguanagua, Valencia',
    lat: 10.2447663,
    lng: -68.0090645,
    city: 'Valencia',
    type: 'soft',
    phone: '584126974229'
  }
];

export const DELIVERY_RATE_PER_KM = 0.5; // Example rate: $0.50 per km
