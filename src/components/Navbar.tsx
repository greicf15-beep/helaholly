import React from 'react';
import { ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
}

export function Navbar({ cartCount, onCartClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-holly-brown/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-holly-brown flex items-center justify-center font-display text-xl sm:text-2xl text-white shadow-lg rounded-lg">
              H
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl sm:text-3xl font-display font-bold uppercase tracking-tight text-holly-brown leading-none">Heladería</span>
              <span className="text-sm sm:text-xl font-display font-bold uppercase tracking-[0.3em] text-holly-orange leading-none">Hollywood</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={onCartClick}
              className="relative p-3 text-holly-brown/60 hover:text-holly-orange transition-all group"
            >
              <ShoppingCart className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 10 }}
                    className="absolute top-1 right-1 bg-holly-orange text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md"
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
