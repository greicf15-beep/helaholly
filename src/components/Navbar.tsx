import React from 'react';
import { ShoppingCart, Menu as MenuIcon, X, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderMode } from '../types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  orderMode: OrderMode | null;
  onChangeMode: () => void;
}

export function Navbar({ cartCount, onCartClick, orderMode, onChangeMode }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-holly-brown/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-16 sm:h-28 py-1 sm:py-2">
          <div className="flex items-center">
            <img 
              src="https://slategrey-goldfish-971844.hostingersite.com/logo_holly.png" 
              alt="Heladería Hollywood" 
              className="h-8 sm:h-14 w-auto object-contain"
            />
          </div>
          
          {orderMode && (
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
              <div className="flex items-center gap-1 text-holly-orange font-display font-bold text-[8px] sm:text-xs">
                {orderMode === 'delivery' ? (
                  <>
                    <Truck className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                    <span>MODO: DELIVERY</span>
                  </>
                ) : (
                  <>
                    <Store className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                    <span>MODO: PICK UP</span>
                  </>
                )}
              </div>
              <button 
                onClick={onChangeMode}
                className="text-[7px] sm:text-[9px] font-bold text-holly-brown/60 hover:text-holly-orange underline decoration-holly-orange/30 underline-offset-4 uppercase tracking-wider transition-colors"
              >
                Cambiar
              </button>
            </div>
          )}

          <div className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2">
            <button
              onClick={onCartClick}
              className="relative p-2 sm:p-3 text-holly-brown/60 hover:text-holly-orange transition-all group"
            >
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 10 }}
                    className="absolute top-0 right-0 sm:top-1 sm:right-1 bg-holly-orange text-white text-[9px] sm:text-[11px] font-bold w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shadow-md"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
