import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number, customization?: any) => void;
  onRemove: (id: string, customization?: any) => void;
  onCheckout: () => void;
  total: number;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout, total }: CartProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-holly-brown/40 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 350 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:max-w-lg bg-holly-cream border-l border-holly-orange/10 shadow-[0_0_100px_rgba(0,0,0,0.1)] z-[70] flex flex-col"
          >
            <div className="p-6 sm:p-10 border-b border-holly-brown/5 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-holly-brown text-white rounded-xl">
                  <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase text-holly-brown tracking-normal">Tu Carrito</h2>
              </div>
              <button onClick={onClose} className="p-2 sm:p-3 text-holly-brown/40 hover:text-holly-orange transition-all hover:rotate-90">
                <X className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 sm:space-y-10 bg-holly-cream/30">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-holly-brown/20 gap-6 sm:gap-8">
                  <ShoppingBag className="w-24 h-24 sm:w-32 sm:h-32 opacity-10" />
                  <p className="text-xl sm:text-2xl font-display font-bold uppercase tracking-[0.3em] text-center">El carrito está vacío</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-holly-brown text-white font-sans font-bold text-[11px] uppercase tracking-[2px] rounded-xl hover:bg-holly-orange transition-all"
                  >
                    Seguir Comprando
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4 sm:gap-8 group">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 overflow-hidden bg-white flex-shrink-0 border border-holly-orange/10 group-hover:border-holly-orange/50 transition-colors duration-500 rounded-2xl sm:rounded-3xl shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-[18px] font-display font-bold text-holly-brown tracking-normal group-hover:text-holly-orange transition-colors leading-tight truncate sm:whitespace-normal">{item.name}</h3>
                          {item.customization && (
                            <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-holly-orange tracking-widest">
                                Sabor: {item.customization.flavor}
                              </p>
                              {item.customization.toppings && item.customization.toppings.length > 0 && (
                                <p className="text-[9px] sm:text-[10px] font-medium text-holly-brown/60 uppercase leading-tight line-clamp-2">
                                  Contornos: {item.customization.toppings.map(t => t.replace('Topping ', '').replace('Toppping ', '')).join(', ')}
                                </p>
                              )}
                              {item.customization.extraToppings && item.customization.extraToppings.length > 0 && (
                                <p className="text-[9px] sm:text-[10px] font-medium text-holly-orange uppercase leading-tight line-clamp-2">
                                  Extras: {item.customization.extraToppings.map(t => {
                                    const name = t.name.replace('Topping ', '').replace('Toppping ', '');
                                    return t.flavor ? `${name} (${t.flavor})` : name;
                                  }).join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-lg sm:text-xl font-display font-bold text-holly-orange shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 sm:gap-4 bg-white border border-holly-orange/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.customization)}
                            className="p-1 text-holly-brown/40 hover:text-holly-orange transition-colors"
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <span className="text-base sm:text-lg font-display font-bold text-holly-brown w-6 sm:w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.customization)}
                            className="p-1 text-holly-brown/40 hover:text-holly-orange transition-colors"
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(item.id, item.customization)}
                          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-holly-brown/40 hover:text-holly-orange transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 sm:p-10 bg-white border-t border-holly-brown/5 space-y-6 sm:space-y-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg sm:text-xl font-sans font-bold uppercase text-holly-brown/40 tracking-[0.3em]">Total</span>
                  <span className="text-4xl sm:text-6xl font-display font-bold text-holly-brown">${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-4 sm:py-5 bg-holly-brown text-white font-sans font-semibold text-[12px] sm:text-[14px] uppercase tracking-[2px] hover:bg-holly-orange transition-all duration-500 shadow-xl rounded-[15px]"
                >
                  Finalizar Pedido
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-holly-brown/60 hover:text-holly-orange font-sans font-bold text-[11px] uppercase tracking-[2px] transition-all"
                >
                  Seguir Comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
