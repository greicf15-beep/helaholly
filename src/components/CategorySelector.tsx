import React from 'react';
import { Category, StoreLocation } from '../types';
import { motion } from 'motion/react';

interface CategorySelectorProps {
  selected: Category;
  onSelect: (category: Category) => void;
  selectedStore: StoreLocation | null;
}

export function CategorySelector({ selected, onSelect, selectedStore }: CategorySelectorProps) {
  const isSoftDisabled = selectedStore?.type === 'gelateria';

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-12 mb-10 sm:mb-16">
      <button
        onClick={() => onSelect('gelato')}
        className={`relative px-6 sm:px-12 py-3 sm:py-5 text-lg sm:text-2xl font-display font-bold uppercase tracking-normal transition-all group ${
          selected === 'gelato' ? 'text-white' : 'text-holly-brown/40 hover:text-holly-orange'
        }`}
      >
        {selected === 'gelato' && (
          <motion.div
            layoutId="category-bg"
            className="absolute inset-0 bg-holly-brown shadow-xl rounded-[30px] sm:rounded-[45px]"
            transition={{ type: 'spring', bounce: 0.1, duration: 0.6 }}
          />
        )}
        <span className="relative z-10">Gelato</span>
      </button>

      <button
        disabled={isSoftDisabled}
        onClick={() => onSelect('soft')}
        className={`relative px-6 sm:px-12 py-3 sm:py-5 text-lg sm:text-2xl font-display font-bold uppercase tracking-normal transition-all group ${
          selected === 'soft' ? 'text-white' : 'text-holly-brown/40 hover:text-holly-orange'
        } ${isSoftDisabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
      >
        {selected === 'soft' && (
          <motion.div
            layoutId="category-bg"
            className="absolute inset-0 bg-holly-brown shadow-xl rounded-[30px] sm:rounded-[45px]"
            transition={{ type: 'spring', bounce: 0.1, duration: 0.6 }}
          />
        )}
        <span className="relative z-10">Soft</span>
        {isSoftDisabled && (
          <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-sans font-bold text-holly-brown/20 whitespace-nowrap uppercase tracking-widest">
            No disponible
          </span>
        )}
      </button>

    </div>
  );
}
