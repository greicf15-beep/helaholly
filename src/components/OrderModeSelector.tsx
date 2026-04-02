import React from 'react';
import { Store, Truck } from 'lucide-react';
import { OrderMode } from '../types';
import { motion } from 'motion/react';

interface OrderModeSelectorProps {
  mode: OrderMode | null;
  onSelect: (mode: OrderMode) => void;
}

export function OrderModeSelector({ mode, onSelect }: OrderModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
      <motion.button
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('delivery')}
        className={`relative p-12 transition-all flex flex-col items-center gap-8 text-center overflow-hidden group rounded-[30px] shadow-xl border-2 ${
          mode === 'delivery'
            ? 'bg-holly-brown text-white border-holly-brown'
            : 'bg-white text-holly-brown border-holly-brown/5 hover:border-holly-orange'
        }`}
      >
        <div className={`p-6 rounded-[20px] transition-colors duration-500 ${mode === 'delivery' ? 'bg-white text-holly-brown shadow-lg' : 'bg-holly-cream text-holly-orange group-hover:bg-holly-orange group-hover:text-white'}`}>
          <Truck className="w-12 h-12" />
        </div>
        <div className="relative z-10">
          <h3 className="text-5xl font-display font-bold uppercase mb-3 tracking-normal">Delivery</h3>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] opacity-60">Lo llevamos a donde estés.</p>
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('in-store')}
        className={`relative p-12 transition-all flex flex-col items-center gap-8 text-center overflow-hidden group rounded-[30px] shadow-xl border-2 ${
          mode === 'in-store'
            ? 'bg-holly-brown text-white border-holly-brown'
            : 'bg-white text-holly-brown border-holly-brown/5 hover:border-holly-orange'
        }`}
      >
        <div className={`p-6 rounded-[20px] transition-colors duration-500 ${mode === 'in-store' ? 'bg-white text-holly-brown shadow-lg' : 'bg-holly-cream text-holly-orange group-hover:bg-holly-orange group-hover:text-white'}`}>
          <Store className="w-12 h-12" />
        </div>
        <div className="relative z-10">
          <h3 className="text-5xl font-display font-bold uppercase mb-3 tracking-normal">Pick up</h3>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] opacity-60">Lo retiras en nuestra tienda.</p>
        </div>
      </motion.button>
    </div>
  );
}
