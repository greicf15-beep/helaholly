export type Category = 'soft' | 'gelato';
export type OrderMode = 'in-store' | 'delivery';
export type StoreType = 'soft' | 'gelateria';
export type VehicleType = 'moto' | 'carro';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  deliveryAvailable: boolean;
  isPackaged?: boolean; // True for gelato ready-to-go
  isCustomizable?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  customization?: {
    size?: string;
    flavor?: string;
    toppings?: string[];
    extraToppings?: { name: string; price: number }[];
  };
}

export interface StoreLocation {
  id: string;
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
