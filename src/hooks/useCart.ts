import { useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hollywood-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hollywood-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((itemToAdd: Product | CartItem) => {
    setCart(prev => {
      const isCustomized = 'customization' in itemToAdd && itemToAdd.customization;
      
      const existing = prev.find(item => {
        if (isCustomized) {
          // For customized items, check if ID and customization match
          return item.id === itemToAdd.id && 
                 JSON.stringify(item.customization) === JSON.stringify((itemToAdd as CartItem).customization);
        }
        // For standard items, just check ID and ensure it doesn't have customization
        return item.id === itemToAdd.id && !item.customization;
      });

      if (existing) {
        return prev.map(item => {
          const isMatch = isCustomized 
            ? (item.id === itemToAdd.id && JSON.stringify(item.customization) === JSON.stringify((itemToAdd as CartItem).customization))
            : (item.id === itemToAdd.id && !item.customization);
            
          return isMatch ? { ...item, quantity: item.quantity + 1 } : item;
        });
      }

      const newItem: CartItem = 'quantity' in itemToAdd 
        ? itemToAdd as CartItem 
        : { ...itemToAdd, quantity: 1 };
        
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, customization?: any) => {
    setCart(prev => prev.filter(item => {
      if (customization) {
        return !(item.id === productId && JSON.stringify(item.customization) === JSON.stringify(customization));
      }
      return item.id !== productId || !!item.customization;
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, customization?: any) => {
    setCart(prev =>
      prev.map(item => {
        const isMatch = customization
          ? (item.id === productId && JSON.stringify(item.customization) === JSON.stringify(customization))
          : (item.id === productId && !item.customization);
          
        return isMatch ? { ...item, quantity: Math.max(0, quantity) } : item;
      }).filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, total };
}
