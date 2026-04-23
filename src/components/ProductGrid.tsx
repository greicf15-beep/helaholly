import React from 'react';
import { Product, OrderMode } from '../types';
import { motion } from 'motion/react';
import { Plus, Truck, Store } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  orderMode: OrderMode | null;
}

export function ProductGrid({ products, onAddToCart, orderMode }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-16 px-4">
      {products.map((product, index) => {
        const isUnavailable = orderMode === 'delivery' && !product.deliveryAvailable;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.6 }}
            className={`group ${isUnavailable ? 'grayscale opacity-70' : ''}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-white mb-3 sm:mb-8 border border-holly-orange/10 group-hover:border-holly-orange/50 transition-colors duration-500 rounded-[20px] sm:rounded-[30px] shadow-xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-holly-brown/20 via-transparent to-transparent opacity-60" />
              
              {/* Price Tag Overlay */}
              <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 font-sans font-bold text-xs sm:text-lg tracking-normal sm:tracking-widest text-holly-orange rounded-lg sm:rounded-xl shadow-sm border border-holly-orange/10">
                ${product.price.toFixed(2)}
              </div>

              {/* Availability Badge */}
              <div className="absolute bottom-3 right-3 sm:top-6 sm:right-6 flex flex-col gap-2 items-end">
                {product.deliveryAvailable ? (
                  <div className="bg-emerald-500/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg shadow-lg text-white" title="Disponible para Delivery">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                ) : (
                  <div className="bg-holly-brown/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg shadow-lg text-white flex items-center gap-1 sm:gap-2" title="Solo en Tienda / Pickup">
                    <Store className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Solo Tienda</span>
                  </div>
                )}
              </div>

              {/* Desktop Hover Button */}
              {!isUnavailable && (
                <div className="hidden sm:block absolute bottom-8 left-0 right-0 px-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#e1a139' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAddToCart(product)}
                    className="w-full py-3 bg-holly-brown text-white font-sans font-semibold text-[11px] uppercase tracking-[1.5px] rounded-[25px] shadow-xl"
                  >
                    SELECCIONAR
                  </motion.button>
                </div>
              )}

              {isUnavailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-holly-brown/40 backdrop-blur-[2px]">
                  <div className="bg-white/90 px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl border border-holly-orange/20 mx-2">
                    <p className="text-holly-brown font-display font-bold text-[10px] sm:text-lg uppercase tracking-widest text-center">No disponible para Delivery</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center px-0.5 sm:px-4">
              <h3 className="text-[13px] sm:text-[18px] font-display font-bold text-holly-brown mb-0.5 sm:mb-2 tracking-tight sm:tracking-normal group-hover:text-holly-orange transition-colors duration-300">{product.name}</h3>
              <p className="text-[8px] sm:text-[11px] text-holly-orange font-sans font-medium uppercase tracking-[0.5px] sm:tracking-[1.5px] leading-tight sm:leading-relaxed line-clamp-2 mb-2 sm:mb-0">
                {product.description}
              </p>
              
              {/* Mobile Always Visible Button */}
              {!isUnavailable && (
                <div className="sm:hidden mt-1.5">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full py-2 bg-holly-brown text-white font-sans font-bold text-[9px] uppercase tracking-[1px] rounded-[25px] shadow-md active:scale-95 transition-transform"
                  >
                    SELECCIONAR
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
