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

export const FRAPUCCINO_FLAVORS = [
  { name: "Original", price: 4.95 },
  { name: "Tiramisú", price: 4.95 },
  { name: "Nutella", price: 8.15 }
];

export const MILKSHAKE_FLAVORS = [
  { name: "Oreo", price: 4.40 },
  { name: "Toddy Crunch", price: 4.40 },
  { name: "Brownie Snickers", price: 4.40 },
  { name: "Ferrero Rochers", price: 5.60 },
  { name: "Frutos del Bosque", price: 5.60 }
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

export const PRODUCTS: Product[] = [
  // Gelato
  {
    id: 'g1',
    name: 'Helado 16oz Básico',
    description: 'Nuestro gelato artesanal en presentación de 16oz, sabores clásicos.',
    price: 4.40,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g2',
    name: 'Helado 16oz Premium',
    description: 'Gelato de 16oz con nuestra selección de sabores premium.',
    price: 6.05,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g3',
    name: 'Helado 16oz Deluxe',
    description: 'La experiencia máxima en 16oz con sabores exclusivos deluxe.',
    price: 8.25,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g4',
    name: 'Helado Concha de Coco',
    description: 'Delicioso helado servido en una auténtica concha de coco.',
    price: 3.20,
    category: 'gelato',
    image: '/hollycoco.webp',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g5',
    name: 'Helado 1 Lt Básico',
    description: 'Un litro de nuestro mejor gelato artesanal, sabores básicos.',
    price: 9.65,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g6',
    name: 'Helado 1 Lt Premium',
    description: 'Un litro de placer con nuestra selección de sabores premium.',
    price: 12.95,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g7',
    name: 'Helado 1 Lt Película',
    description: 'Sabores especiales de película en presentación de un litro.',
    price: 16.10,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g8',
    name: 'Helado 1 Lt Deluxe',
    description: 'Nuestra gama más alta de sabores en presentación de un litro.',
    price: 23.50,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g9',
    name: 'Combo Holly Conos Básico 1Lt',
    description: 'Un litro de helado básico más conos crujientes para compartir.',
    price: 11.55,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g10',
    name: 'Combo Holly Conos Premium 1 Lt',
    description: 'Un litro de helado premium más conos crujientes para compartir.',
    price: 14.85,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g11',
    name: 'Combo Holly Conos Película 1 Lt',
    description: 'Un litro de helado película más conos crujientes para compartir.',
    price: 18.15,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g12',
    name: 'Combo Holly Conos Deluxe 1 Lt',
    description: 'Un litro de helado deluxe más conos crujientes para compartir.',
    price: 25.50,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g13',
    name: 'Helado Fresa 16oz',
    description: 'Clásico y refrescante gelato de fresas naturales en 16oz.',
    price: 4.40,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g14',
    name: 'Helado Chocolattisimo 16oz',
    description: 'La experiencia definitiva para los amantes del chocolate en 16oz.',
    price: 4.40,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g15',
    name: 'Helado Ron Pasas 16oz',
    description: 'Tradicional sabor de ron con pasas en nuestra base cremosa de 16oz.',
    price: 4.40,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g16',
    name: 'Helado Brownie Snickers 16oz',
    description: 'Mezcla explosiva de brownie y trozos de Snickers en 16oz.',
    price: 6.05,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g17',
    name: 'Helado Brazo Gitano de Coco 16oz',
    description: 'Inspirado en el postre tradicional con el toque tropical del coco en 16oz.',
    price: 6.05,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  {
    id: 'g18',
    name: 'Helado Pistacho 16oz',
    description: 'Auténtico gelato de pistacho italiano, cremoso y delicioso en 16oz.',
    price: 8.25,
    category: 'gelato',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=400&h=400&q=80',
    deliveryAvailable: true,
    isPackaged: true
  },
  // Soft
  {
    id: 'tinas-custom',
    name: 'Tinas Holly',
    description: 'Personaliza tu tina con tu tamaño, sabor y 3 contornos favoritos.',
    price: 3.50,
    category: 'soft',
    image: '/Tinas.webp',
    deliveryAvailable: true,
    isCustomizable: true
  },
  {
    id: 's4',
    name: 'Tina Galleta 14oz',
    description: 'Tina de helado soft acompañada de galletas crujientes.',
    price: 5.70,
    category: 'soft',
    image: '/Tinas.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's5',
    name: 'Bubble Waffle',
    description: 'Waffle esponjoso con burbujas, helado soft y tus toppings favoritos.',
    price: 7.00,
    category: 'soft',
    image: '/bubble waffle.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's6',
    name: 'Sundae',
    description: 'Helado soft con sirope y toppings clásicos.',
    price: 2.00,
    category: 'soft',
    image: '/sundae.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's7',
    name: 'Frosty Chicha',
    description: 'Refrescante helado de chicha con un toque especial.',
    price: 2.00,
    category: 'soft',
    image: '/frosty.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's8',
    name: 'Barquilla',
    description: 'El clásico cono crujiente con nuestro suave helado soft.',
    price: 1.65,
    category: 'soft',
    image: '/barquilla.webp',
    deliveryAvailable: false
  },
  {
    id: 's9',
    name: 'Maxi Sundae Básico',
    description: 'La versión definitiva del sundae con capas extra de sabor.',
    price: 4.50,
    category: 'soft',
    image: '/maxi.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 's10',
    name: 'Maxi Sundae Premium',
    description: 'Maxi Sundae con toppings premium y sabores especiales.',
    price: 4.80,
    category: 'soft',
    image: '/maxi.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 'milkshakes-custom',
    name: 'MILKSHAKES',
    description: 'Elige tu sabor favorito de milkshake: Oreo, Toddy Crunch, Brownie Snickers, Ferrero Rochers o Frutos del Bosque.',
    price: 4.40,
    category: 'soft',
    image: '/milkshake.webp',
    deliveryAvailable: false,
    isCustomizable: true
  },
  {
    id: 'frapuccinos-custom',
    name: 'FRAPUCCINOS',
    description: 'Elige tu sabor favorito de frapuccino: Original, Tiramisú o Nutella.',
    price: 4.95,
    category: 'soft',
    image: '/frappu.webp',
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
    phone: '584120000001'
  },
  {
    id: 'cab-farmak',
    name: 'Hollywood Farmak',
    address: 'Av. Carnevalli con Calle Nueva Granada, Cabimas (Farmak)',
    lat: 10.3915256,
    lng: -71.4607155,
    city: 'Cabimas',
    type: 'gelateria',
    phone: '584120000002'
  },
  {
    id: 'mcbo-cima',
    name: 'Hollywood CC Cima Gelato',
    address: 'CC Cima, Av. Libertador, Maracaibo',
    lat: 10.6412835,
    lng: -71.6184280,
    city: 'Maracaibo',
    type: 'gelateria',
    phone: '584120000003'
  },
  {
    id: 'mcbo-zonanorte',
    name: 'Hollywood Zona Norte',
    address: 'Av. Rosal Sur. Calle 45 entre Av. 14 y 14A, Maracaibo',
    lat: 10.7001385,
    lng: -71.6227916,
    city: 'Maracaibo',
    type: 'gelateria',
    phone: '584120000004'
  },
  {
    id: 'cab-costamall',
    name: 'Hollywood CC Costa Mall',
    address: 'CC Costa Mall, Av. Intercomunal, Cabimas',
    lat: 10.3484878,
    lng: -71.4176744,
    city: 'Cabimas',
    type: 'soft',
    phone: '584120000005'
  },
  {
    id: 'mcbo-cima-soft',
    name: 'Hollywood CC Cima Soft',
    address: 'CC Cima, Av. Libertador, Maracaibo',
    lat: 10.6412835,
    lng: -71.6184280,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584120000006'
  },
  {
    id: 'mcbo-mallpaseo',
    name: 'Hollywood CC Mall Paseo',
    address: 'CC Mall Paseo, San Francisco (Av. 40)',
    lat: 10.5898,
    lng: -71.6558,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584120000007'
  },
  {
    id: 'mcbo-sanfelipe',
    name: 'Hollywood San Felipe',
    address: 'Casco Central, Av. 10 con Av. Libertador, Maracaibo (San Felipe)',
    lat: 10.6405678,
    lng: -71.6141801,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584120000008'
  },
  {
    id: 'mcbo-72',
    name: 'Hollywood Sede 72',
    address: 'Calle 72 con Avenida 13A, Maracaibo',
    lat: 10.6698035,
    lng: -71.6172572,
    city: 'Maracaibo',
    type: 'soft',
    phone: '584120000009'
  },
  {
    id: 'val-naguanagua',
    name: 'Hollywood Naguanagua',
    address: 'Av. Salvador Feo La Cruz, Naguanagua, Valencia',
    lat: 10.2447663,
    lng: -68.0090645,
    city: 'Valencia',
    type: 'soft',
    phone: '584120000010'
  }
];

export const DELIVERY_RATE_PER_KM = 0.5; // Example rate: $0.50 per km
