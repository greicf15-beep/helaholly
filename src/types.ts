export type Category = 'soft' | 'gelato';
export type OrderMode = 'in-store' | 'delivery';
export type StoreType = 'soft' | 'gelateria';
export type VehicleType = 'moto' | 'carro';

export interface Product {
  id: string;
  sku?: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  deliveryAvailable: boolean;
  onlyDelivery?: boolean;
  onlyInStore?: boolean;
  isPackaged?: boolean; // True for gelato ready-to-go
  isCustomizable?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  isReward?: boolean;
  pointsCost?: number;
  rewardId?: string;
  customization?: {
    size?: string;
    flavor?: string;
    team?: string;
    premiumTopping?: string;
    magicLayer?: string;
    toppings?: string[];
    extraToppings?: { name: string; price: number; flavor?: string }[];
  };
}

export type LoyaltyTierType = 'Bronce' | 'Plata' | 'Oro' | 'VIP';

export interface LoyaltyTier {
  name: LoyaltyTierType;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgGradient: string;
  borderClass: string;
  badgeText: string;
  benefit: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'topping' | 'soft' | 'gelato' | 'especial';
  tierRequired: LoyaltyTierType;
  valueUsd: number;
  image: string;
  productId?: string;
}

export interface CustomerProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  points: number;
  tier: LoyaltyTierType;
  pinCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreLocation {
  id: string;
  storeCode?: string;
  warehouseCode?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  type: StoreType;
  phone?: string;
}

export interface Order {
  id?: string;
  items: CartItem[];
  total: number;
  mode: OrderMode;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'preparing' | 'delivered';
  createdAt: Date;
}
