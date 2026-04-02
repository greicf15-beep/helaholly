import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Info } from 'lucide-react';
import { Product, CartItem } from '../types';
import { TINA_SIZES, TINA_FLAVORS, TOPPINGS, EXTRA_TOPPINGS, FRAPUCCINO_FLAVORS, MILKSHAKE_FLAVORS } from '../constants';

interface ProductCustomizerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customizedItem: CartItem) => void;
}

export function ProductCustomizer({ product, isOpen, onClose, onConfirm }: ProductCustomizerProps) {
  const isTina = product.id === 'tinas-custom';
  const isFrapuccino = product.id === 'frapuccinos-custom';
  const isMilkshake = product.id === 'milkshakes-custom';
  const isSundae = product.id === 's6';
  const isFrosty = product.id === 's7';
  const isSundaeOrFrosty = isSundae || isFrosty;
  
  const [selectedSize, setSelectedSize] = useState(isTina ? TINA_SIZES[0] : null);
  const [selectedFlavor, setSelectedFlavor] = useState(
    isFrapuccino ? FRAPUCCINO_FLAVORS[0].name : 
    isMilkshake ? MILKSHAKE_FLAVORS[0].name : 
    TINA_FLAVORS[0]
  );
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedExtraToppings, setSelectedExtraToppings] = useState<{ name: string; price: number }[]>([]);

  const handleToppingToggle = (topping: string) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter(t => t !== topping));
    } else if (selectedToppings.length < 3) {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleExtraToppingToggle = (topping: { name: string; price: number }) => {
    if (selectedExtraToppings.some(t => t.name === topping.name)) {
      setSelectedExtraToppings(selectedExtraToppings.filter(t => t.name !== topping.name));
    } else {
      setSelectedExtraToppings([...selectedExtraToppings, topping]);
    }
  };

  const extraToppingsTotal = useMemo(() => 
    selectedExtraToppings.reduce((sum, t) => sum + t.price, 0),
  [selectedExtraToppings]);

  const handleConfirm = () => {
    let basePrice = product.price;
    let finalName = product.name;

    if (isTina && selectedSize) {
      basePrice = selectedSize.price;
      finalName = `${product.name} (${selectedSize.label})`;
    } else if (isFrapuccino) {
      const flavor = FRAPUCCINO_FLAVORS.find(f => f.name === selectedFlavor);
      if (flavor) {
        basePrice = flavor.price;
        finalName = `FRAPUCCINO ${flavor.name.toUpperCase()}`;
      }
    } else if (isMilkshake) {
      const flavor = MILKSHAKE_FLAVORS.find(f => f.name === selectedFlavor);
      if (flavor) {
        basePrice = flavor.price;
        finalName = `MILK SHAKE ${flavor.name.toUpperCase()}`;
      }
    }

    const finalPrice = basePrice + extraToppingsTotal;
    
    const customizedItem: CartItem = {
      ...product,
      price: finalPrice,
      name: finalName,
      quantity: 1,
      customization: {
        size: isTina && selectedSize ? selectedSize.label : undefined,
        flavor: selectedFlavor,
        toppings: (isFrapuccino || isMilkshake || isSundaeOrFrosty) ? [] : selectedToppings,
        extraToppings: selectedExtraToppings
      }
    };
    onConfirm(customizedItem);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-holly-brown/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden my-4 sm:my-8"
          >
            <div className="h-2 bg-holly-orange w-full" />
            
            <div className="p-6 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-display font-bold text-holly-brown uppercase leading-tight">Personaliza tu {product.name}</h2>
                  <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[11px] mt-2">
                    {isTina 
                      ? 'Elige el tamaño, sabor, 3 contornos gratis y extras.' 
                      : (isFrapuccino || isMilkshake)
                        ? 'Elige tu sabor favorito y añade extras si deseas.'
                        : isSundae
                          ? 'Elige tu sabor favorito y añade contornos extras.'
                          : isFrosty
                            ? 'Añade tus contornos extras favoritos.'
                            : 'Elige tu sabor favorito, 3 contornos gratis y extras.'}
                  </p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-3 sm:p-4 -mr-2 sm:-mr-4 text-holly-brown/20 hover:text-holly-orange transition-colors"
                >
                  <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </div>

              <div className="space-y-10">
                {/* Size Selection - Only for Tinas */}
                {isTina && (
                  <section>
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown mb-4">1. Selecciona el Tamaño</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {TINA_SIZES.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={`p-4 rounded-[15px] border-2 transition-all flex flex-col items-center gap-1 ${
                            selectedSize?.id === size.id
                              ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                              : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                          }`}
                        >
                          <span className="text-xl font-display font-bold">{size.label}</span>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-60">${size.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Flavor Selection - Not for Frosty */}
                {!isFrosty && (
                  <section>
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown mb-4">
                      {isTina ? '2.' : '1.'} Selecciona el Sabor
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {isFrapuccino ? (
                        FRAPUCCINO_FLAVORS.map((flavor) => (
                          <button
                            key={flavor.name}
                            onClick={() => setSelectedFlavor(flavor.name)}
                            className={`p-4 rounded-[15px] border-2 transition-all text-center flex flex-col gap-1 ${
                              selectedFlavor === flavor.name
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                            }`}
                          >
                            <span className="font-display font-bold uppercase tracking-wider">{flavor.name}</span>
                            <span className={`text-[10px] font-sans font-bold uppercase tracking-wider ${selectedFlavor === flavor.name ? 'text-holly-orange' : 'text-holly-brown/40'}`}>
                              ${flavor.price.toFixed(2)}
                            </span>
                          </button>
                        ))
                      ) : isMilkshake ? (
                        MILKSHAKE_FLAVORS.map((flavor) => (
                          <button
                            key={flavor.name}
                            onClick={() => setSelectedFlavor(flavor.name)}
                            className={`p-4 rounded-[15px] border-2 transition-all text-center flex flex-col gap-1 ${
                              selectedFlavor === flavor.name
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                            }`}
                          >
                            <span className="font-display font-bold uppercase tracking-wider">{flavor.name}</span>
                            <span className={`text-[10px] font-sans font-bold uppercase tracking-wider ${selectedFlavor === flavor.name ? 'text-holly-orange' : 'text-holly-brown/40'}`}>
                              ${flavor.price.toFixed(2)}
                            </span>
                          </button>
                        ))
                      ) : (
                        TINA_FLAVORS.map((flavor) => (
                          <button
                            key={flavor}
                            onClick={() => setSelectedFlavor(flavor)}
                            className={`p-4 rounded-[15px] border-2 transition-all text-center ${
                              selectedFlavor === flavor
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                            }`}
                          >
                            <span className="font-display font-bold uppercase tracking-wider">{flavor}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </section>
                )}

                {/* Toppings Selection - Not for Frappuccinos, Milkshakes, or Sundae/Frosty */}
                {(!isFrapuccino && !isMilkshake && !isSundaeOrFrosty) && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                        {isTina ? '3.' : '2.'} Elige 3 Contornos Gratis
                      </h3>
                      <span className="text-[9px] font-sans font-bold uppercase bg-holly-orange/10 text-holly-orange px-2 py-1 rounded-full tracking-wider">
                        {selectedToppings.length} / 3 Seleccionados
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {TOPPINGS.map((topping) => {
                        const isSelected = selectedToppings.includes(topping);
                        const isDisabled = !isSelected && selectedToppings.length >= 3;
                        
                        return (
                          <button
                            key={topping}
                            disabled={isDisabled}
                            onClick={() => handleToppingToggle(topping)}
                            className={`p-3 rounded-[12px] border text-left text-[10px] font-sans font-bold transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'border-holly-orange bg-holly-orange text-white'
                                : isDisabled
                                  ? 'border-holly-brown/5 text-holly-brown/20 cursor-not-allowed'
                                  : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/40'
                            }`}
                          >
                            <span className="leading-tight uppercase tracking-wider">{topping.replace('Topping ', '').replace('Toppping ', '')}</span>
                            {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Extra Toppings Selection */}
                <section>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                      {isTina ? '4.' : (isFrapuccino || isMilkshake || isSundae) ? '2.' : '1.'} Contornos Extra (Costo adicional)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {EXTRA_TOPPINGS.map((topping) => {
                      const isSelected = selectedExtraToppings.some(t => t.name === topping.name);
                      
                      return (
                        <button
                          key={topping.name}
                          onClick={() => handleExtraToppingToggle(topping)}
                          className={`p-3 rounded-[12px] border text-left text-[10px] font-sans font-bold transition-all flex flex-col gap-1 ${
                            isSelected
                              ? 'border-holly-orange bg-holly-orange text-white'
                              : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/40'
                          }`}
                        >
                          <span className="leading-tight uppercase tracking-wider">{topping.name.replace('Topping ', '').replace('Toppping ', '')}</span>
                          <span className={`text-[9px] font-sans font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-holly-orange'}`}>
                            +${topping.price.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-holly-brown/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown/40 block mb-1">Precio Final</span>
                  <span className="text-4xl font-display font-bold text-holly-brown">
                    ${( (isTina && selectedSize ? selectedSize.price : isFrapuccino ? (FRAPUCCINO_FLAVORS.find(f => f.name === selectedFlavor)?.price || 0) : isMilkshake ? (MILKSHAKE_FLAVORS.find(f => f.name === selectedFlavor)?.price || 0) : product.price) + extraToppingsTotal ).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-12 py-5 bg-holly-brown text-white font-sans font-semibold text-[11px] uppercase tracking-[1.5px] rounded-[15px] hover:bg-holly-orange transition-all duration-500 shadow-xl"
                >
                  AGREGAR AL CARRITO
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
