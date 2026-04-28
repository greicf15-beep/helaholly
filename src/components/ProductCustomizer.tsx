import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Info, ChevronDown } from 'lucide-react';
import { Product, CartItem } from '../types';
import { 
  TINA_SIZES, 
  TINA_FLAVORS, 
  TOPPINGS, 
  EXTRA_TOPPINGS, 
  SOFT_FRAPUCCINO_FLAVORS,
  SOFT_MILKSHAKE_FLAVORS,
  GELATO_FRAPUCCINO_FLAVORS,
  GELATO_MERENGADA_FLAVORS,
  GELATO_BASICO_FLAVORS,
  GELATO_PREMIUM_FLAVORS,
  GELATO_PELICULA_FLAVORS,
  GELATO_DELUXE_FLAVORS,
  GELATO_LINES,
  GELATO_16OZ_LINES,
  GELATO_16OZ_BASICO_FLAVORS,
  GELATO_16OZ_PREMIUM_FLAVORS,
  GELATO_16OZ_DELUXE_FLAVORS,
  BARQUILLA_1_PORCION_LINES,
  BARQUILLON_1_PORCION_LINES,
  BARQUILLON_2_PORCIONES_LINES,
  TINA_1_PORCION_LINES,
  TINA_2_PORCIONES_LINES,
  GELATO_EXTRA_PORTIONS,
  PROMOS,
  COOKIE_BROWNIE_FLAVORS
} from '../constants';

interface ProductCustomizerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customizedItem: CartItem) => void;
}

export function ProductCustomizer({ product, isOpen, onClose, onConfirm }: ProductCustomizerProps) {
  const isTina = product.id === 'tinas-custom';
  const isFrapuccino = product.id.startsWith('frapuccinos-custom');
  const isMilkshake = product.id.startsWith('milkshakes-custom');
  const isSundae = product.id === 's6';
  const isFrosty = product.id === 's7';
  const isSundaeOrFrosty = isSundae || isFrosty;
  
  const isGelato1Lt = product.id.startsWith('gelato-1lt-');
  const isGelato16oz = product.id === 'gelato-16oz-custom';
  const isBarquilla1 = product.id === 'barquilla-1-porcion-custom';
  const isBarquillon1 = product.id === 'barquillon-1-porcion-custom';
  const isBarquillon2 = product.id === 'barquillon-2-porciones-custom';
  const isTina1 = product.id === 'tina-1-porcion-custom';
  const isTina2 = product.id === 'tina-2-porciones-custom';
  const isCookieOrBrownie = product.id === 'cookies-chip' || product.id === 'brownie-fudge';
  const isGelatoWithExtraPortions = isBarquilla1 || isBarquillon1 || isBarquillon2 || isTina1 || isTina2;
  const isPromoGroup = product.id === 'promos-grouped';
  const isPromo = product.id.startsWith('promo-') || isPromoGroup;
  const isGroupedGelato = isGelato1Lt || isGelato16oz || isPromo || isBarquilla1 || isBarquillon1 || isBarquillon2 || isTina1 || isTina2;

  const [selectedSize, setSelectedSize] = useState(isTina ? TINA_SIZES[0] : null);
  const [selectedPromo, setSelectedPromo] = useState<Product | null>(isPromoGroup ? PROMOS[0] : null);
  
  const frapuccinoFlavors = useMemo(() => {
    return product.category === 'gelato' ? GELATO_FRAPUCCINO_FLAVORS : SOFT_FRAPUCCINO_FLAVORS;
  }, [product.category]);

  const milkshakeFlavors = useMemo(() => {
    return product.category === 'gelato' ? GELATO_MERENGADA_FLAVORS : SOFT_MILKSHAKE_FLAVORS;
  }, [product.category]);

  const [selectedLine, setSelectedLine] = useState(() => {
    if (isGelato1Lt) {
      const lineId = product.id.split('-').pop();
      return GELATO_LINES.find(l => l.id === lineId) || GELATO_LINES[0];
    }
    if (isPromoGroup && selectedPromo) {
      if (selectedPromo.id === 'promo-basico') return GELATO_LINES.find(l => l.id === 'basica');
      if (selectedPromo.id === 'promo-hollylunch' || selectedPromo.id === 'promo-casa-premium') return GELATO_LINES.find(l => l.id === 'premium');
      if (selectedPromo.id === 'promo-casa-pelicula') return GELATO_LINES.find(l => l.id === 'pelicula');
      if (selectedPromo.id === 'promo-casa-deluxe') return GELATO_LINES.find(l => l.id === 'deluxe');
    }
    if (isPromo && !isPromoGroup) {
      if (product.id === 'promo-basico') return GELATO_LINES.find(l => l.id === 'basica');
      if (product.id === 'promo-hollylunch' || product.id === 'promo-casa-premium') return GELATO_LINES.find(l => l.id === 'premium');
      if (product.id === 'promo-casa-pelicula') return GELATO_LINES.find(l => l.id === 'pelicula');
      if (product.id === 'promo-casa-deluxe') return GELATO_LINES.find(l => l.id === 'deluxe');
    }
    if (isGelato16oz) return GELATO_16OZ_LINES[0];
    if (isBarquilla1) return BARQUILLA_1_PORCION_LINES[0];
    if (isBarquillon1) return BARQUILLON_1_PORCION_LINES[0];
    if (isBarquillon2) return BARQUILLON_2_PORCIONES_LINES[0];
    if (isTina1) return TINA_1_PORCION_LINES[0];
    if (isTina2) return TINA_2_PORCIONES_LINES[0];
    return null;
  });

  // Update line when promo changes
  useEffect(() => {
    if (isPromoGroup && selectedPromo) {
      if (selectedPromo.id === 'promo-basico') setSelectedLine(GELATO_LINES.find(l => l.id === 'basica') || null);
      if (selectedPromo.id === 'promo-hollylunch' || selectedPromo.id === 'promo-casa-premium') setSelectedLine(GELATO_LINES.find(l => l.id === 'premium') || null);
      if (selectedPromo.id === 'promo-casa-pelicula') setSelectedLine(GELATO_LINES.find(l => l.id === 'pelicula') || null);
      if (selectedPromo.id === 'promo-casa-deluxe') setSelectedLine(GELATO_LINES.find(l => l.id === 'deluxe') || null);
    }
  }, [selectedPromo, isPromoGroup]);
  
  const gelatoFlavors = useMemo(() => {
    if ((isGelato1Lt || isPromo || isBarquilla1 || isBarquillon1 || isBarquillon2 || isTina1 || isTina2) && selectedLine) {
      if (selectedLine.id === 'basica') return GELATO_BASICO_FLAVORS;
      if (selectedLine.id === 'premium') return GELATO_PREMIUM_FLAVORS;
      if (selectedLine.id === 'pelicula') return GELATO_PELICULA_FLAVORS;
      if (selectedLine.id === 'deluxe') return GELATO_DELUXE_FLAVORS;
    }
    if (isGelato16oz && selectedLine) {
      if (selectedLine.id === 'basica') return GELATO_16OZ_BASICO_FLAVORS;
      if (selectedLine.id === 'premium') return GELATO_16OZ_PREMIUM_FLAVORS;
      if (selectedLine.id === 'deluxe') return GELATO_16OZ_DELUXE_FLAVORS;
    }
    if (isCookieOrBrownie) return COOKIE_BROWNIE_FLAVORS;
    return TINA_FLAVORS;
  }, [isGelato1Lt, isGelato16oz, isBarquilla1, isBarquillon1, isBarquillon2, isTina1, isTina2, isPromo, selectedLine, isCookieOrBrownie]);

  const [selectedFlavor, setSelectedFlavor] = useState(() => {
    if (isFrapuccino) return frapuccinoFlavors[0].name;
    if (isMilkshake) return milkshakeFlavors[0].name;
    if (isGroupedGelato || isCookieOrBrownie) return gelatoFlavors[0];
    return TINA_FLAVORS[0];
  });

  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  // Update flavor when line changes for Grouped Gelatos or when product is Cookie/Brownie
  React.useEffect(() => {
    if (isGroupedGelato || isCookieOrBrownie) {
      setSelectedFlavor(gelatoFlavors[0]);
      setSelectedFlavors([gelatoFlavors[0]]);
    }
  }, [selectedLine, gelatoFlavors, isGroupedGelato, isCookieOrBrownie]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedExtraToppings, setSelectedExtraToppings] = useState<{ name: string; price: number; flavor?: string }[]>([]);
  const [toppingError, setToppingError] = useState<string | null>(null);

  useEffect(() => {
    if (toppingError) {
      const timer = setTimeout(() => setToppingError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toppingError]);

  const toppingsRef = React.useRef<HTMLDivElement>(null);
  const extraToppingsRef = React.useRef<HTMLDivElement>(null);
  const [showToppingsScroll, setShowToppingsScroll] = useState(false);
  const [showExtraToppingsScroll, setShowExtraToppingsScroll] = useState(false);

  const checkScroll = (ref: React.RefObject<HTMLDivElement>, setter: (val: boolean) => void) => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      setter(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 10);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        checkScroll(toppingsRef, setShowToppingsScroll);
        checkScroll(extraToppingsRef, setShowExtraToppingsScroll);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedToppings, selectedExtraToppings]);

  const handleToppingToggle = (topping: string) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter(t => t !== topping));
      setToppingError(null);
    } else if (selectedToppings.length < 3) {
      setSelectedToppings([...selectedToppings, topping]);
      setToppingError(null);
    } else {
      setToppingError('Solo puedes seleccionar hasta 3 contornos gratis');
    }
  };

  const handleExtraToppingToggle = (topping: { name: string; price: number }) => {
    if (selectedExtraToppings.some(t => t.name === topping.name)) {
      setSelectedExtraToppings(selectedExtraToppings.filter(t => t.name !== topping.name));
      setToppingError(null);
    } else {
      // If it's a gelato portion, set a default flavor
      let flavor = undefined;
      if (topping.name.includes('Porción Básica')) flavor = GELATO_BASICO_FLAVORS[0];
      if (topping.name.includes('Porción Premium')) flavor = GELATO_PREMIUM_FLAVORS[0];
      if (topping.name.includes('Porción Película')) flavor = GELATO_PELICULA_FLAVORS[0];
      if (topping.name.includes('Porción Deluxe')) flavor = GELATO_DELUXE_FLAVORS[0];
      
      setSelectedExtraToppings([...selectedExtraToppings, { ...topping, flavor }]);
      setToppingError(null);
    }
  };

  const handleExtraPortionFlavorChange = (portionName: string, flavor: string) => {
    setSelectedExtraToppings(selectedExtraToppings.map(t => 
      t.name === portionName ? { ...t, flavor } : t
    ));
  };

  const extraToppingsTotal = useMemo(() => 
    selectedExtraToppings.reduce((sum, t) => sum + t.price, 0),
  [selectedExtraToppings]);

  const currentBasePrice = useMemo(() => {
    if (isTina && selectedSize) return selectedSize.price;
    if (isGelato16oz && selectedLine) return selectedLine.price;
    if (isBarquilla1 && selectedLine) return selectedLine.price;
    if (isBarquillon1 && selectedLine) return selectedLine.price;
    if (isBarquillon2 && selectedLine) return selectedLine.price;
    if (isTina1 && selectedLine) return selectedLine.price;
    if (isTina2 && selectedLine) return selectedLine.price;
    if (isPromoGroup && selectedPromo) return selectedPromo.price;
    if (isFrapuccino) return frapuccinoFlavors.find(f => f.name === selectedFlavor)?.price || product.price;
    if (isMilkshake) return milkshakeFlavors.find(f => f.name === selectedFlavor)?.price || product.price;
    return product.price;
  }, [isTina, selectedSize, isGelato16oz, selectedLine, isPromoGroup, selectedPromo, isFrapuccino, isMilkshake, selectedFlavor, product.price, frapuccinoFlavors, milkshakeFlavors]);

  const handleConfirm = () => {
    let finalName = product.name;

    if (isTina && selectedSize) {
      finalName = `${product.name} (${selectedSize.label})`;
    } else if (isPromoGroup && selectedPromo) {
      finalName = selectedPromo.name;
    } else if (isGroupedGelato && selectedLine) {
      // For 1LT separate products and promos, the name already includes the line/info
      finalName = (isGelato1Lt || isPromo) ? product.name : `${product.name} ${selectedLine.label}`;
    } else if (isFrapuccino) {
      const flavor = frapuccinoFlavors.find(f => f.name === selectedFlavor);
      if (flavor) {
        finalName = product.category === 'gelato' ? flavor.name : `FRAPUCCINO ${flavor.name.toUpperCase()}`;
      }
    } else if (isMilkshake) {
      const flavor = milkshakeFlavors.find(f => f.name === selectedFlavor);
      if (flavor) {
        finalName = product.category === 'gelato' ? flavor.name : `MILK SHAKE ${flavor.name.toUpperCase()}`;
      }
    }

    const finalPrice = currentBasePrice + extraToppingsTotal;
    
    const customizedItem: CartItem = {
      ...product,
      id: isPromoGroup && selectedPromo ? selectedPromo.id : product.id,
      image: isPromoGroup && selectedPromo ? selectedPromo.image : product.image,
      price: finalPrice,
      name: finalName,
      quantity: 1,
      customization: {
        size: isTina && selectedSize ? selectedSize.label : undefined,
        flavor: (isBarquillon2 || isTina2) ? selectedFlavors.join(', ') : selectedFlavor,
        toppings: (isFrapuccino || isMilkshake || isSundaeOrFrosty || isGroupedGelato || isCookieOrBrownie) ? [] : selectedToppings,
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
                  <h2 className="text-3xl sm:text-4xl font-display font-bold text-holly-brown uppercase leading-tight">
                    {isGroupedGelato ? product.name : `Personaliza tu ${product.name}`}
                  </h2>
                  <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[11px] mt-2">
                    {isTina 
                      ? 'Elige el tamaño, sabor, 3 contornos gratis y extras.' 
                      : isGroupedGelato
                        ? ''
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
                {/* Promo Selection - Only for Grouped Promos */}
                {isPromoGroup && (
                  <section>
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown mb-4">1. Selecciona tu Promo / Combo</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {PROMOS.map((promo) => (
                        <button
                          key={promo.id}
                          onClick={() => setSelectedPromo(promo)}
                          className={`p-4 rounded-[20px] border-2 transition-all flex items-center gap-4 text-left ${
                            selectedPromo?.id === promo.id
                              ? 'border-holly-orange bg-holly-orange/5'
                              : 'border-holly-brown/5 hover:border-holly-orange/30'
                          }`}
                        >
                          <div className="w-20 h-20 rounded-[15px] overflow-hidden flex-shrink-0 bg-holly-cream">
                            <img 
                              src={promo.image} 
                              alt={promo.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-display font-bold text-holly-brown uppercase tracking-wide text-[18px]">{promo.name}</h4>
                              {promo.price > 0 && <span className="text-[18px] font-display font-bold text-holly-orange">${promo.price.toFixed(2)}</span>}
                            </div>
                            <p className="text-[12px] text-holly-brown/80 font-sans mt-1 leading-relaxed">{promo.description}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedPromo?.id === promo.id ? 'border-holly-orange bg-holly-orange text-white' : 'border-holly-brown/10'
                          }`}>
                            {selectedPromo?.id === promo.id && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

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

                {/* Line Selection - Only for Grouped Gelato (16oz, Barquilla 1, Barquillon 1/2, Tina 1/2) - 1LT is now separate products */}
                {(isGelato16oz || isBarquilla1 || isBarquillon1 || isBarquillon2 || isTina1 || isTina2) && (
                  <section>
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown mb-4">1. Selecciona la Línea</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(isGelato16oz ? GELATO_16OZ_LINES : 
                        isBarquilla1 ? BARQUILLA_1_PORCION_LINES :
                        isBarquillon1 ? BARQUILLON_1_PORCION_LINES :
                        isBarquillon2 ? BARQUILLON_2_PORCIONES_LINES :
                        isTina1 ? TINA_1_PORCION_LINES :
                        TINA_2_PORCIONES_LINES).map((line) => (
                        <button
                          key={line.id}
                          onClick={() => setSelectedLine(line)}
                          className={`p-4 rounded-[15px] border-2 transition-all flex flex-col items-center gap-1 ${
                            selectedLine?.id === line.id
                              ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                              : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                          }`}
                        >
                          <span className="text-sm font-display font-bold uppercase tracking-wider">{line.label}</span>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-60">${line.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Flavor Selection - Not for Frosty */}
                {!isFrosty && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                        {isTina || isGelato16oz || isBarquilla1 || isBarquillon1 || isBarquillon2 || isTina1 || isTina2 || isPromoGroup ? '2.' : '1.'} Selecciona el Sabor del Helado
                      </h3>
                      {(isBarquillon2 || isTina2) && (
                        <span className="text-[9px] font-sans font-bold uppercase bg-holly-orange/10 text-holly-orange px-2 py-1 rounded-full tracking-wider">
                          {selectedFlavors.length} / 2 Seleccionados
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {isFrapuccino ? (
                        frapuccinoFlavors.map((flavor) => (
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
                        milkshakeFlavors.map((flavor) => (
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
                      ) : (isGroupedGelato || isCookieOrBrownie) ? (
                        gelatoFlavors.map((flavor) => {
                          const isSelected = (isBarquillon2 || isTina2) ? selectedFlavors.includes(flavor) : selectedFlavor === flavor;
                          const isDisabled = (isBarquillon2 || isTina2) && !isSelected && selectedFlavors.length >= 2;

                          return (
                            <button
                              key={flavor}
                              disabled={isDisabled}
                              onClick={() => {
                                if (isBarquillon2 || isTina2) {
                                  if (isSelected) {
                                    setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
                                  } else if (selectedFlavors.length < 2) {
                                    setSelectedFlavors([...selectedFlavors, flavor]);
                                  }
                                } else {
                                  setSelectedFlavor(flavor);
                                }
                              }}
                              className={`p-4 rounded-[15px] border-2 transition-all text-center ${
                                isSelected
                                  ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                  : isDisabled
                                    ? 'border-holly-brown/5 text-holly-brown/20 cursor-not-allowed'
                                    : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                              }`}
                            >
                              <span className="font-display font-bold uppercase tracking-wider">{flavor}</span>
                            </button>
                          );
                        })
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

                {/* Toppings Selection - Not for Frappuccinos, Milkshakes, Sundae/Frosty, Grouped Gelato, or Cookies/Brownies */}
                {(!isFrapuccino && !isMilkshake && !isSundaeOrFrosty && !isGroupedGelato && !isCookieOrBrownie) && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                        {isTina ? '3.' : '2.'} Elige 3 Contornos Gratis
                      </h3>
                      <span className="text-[9px] font-sans font-bold uppercase bg-holly-orange/10 text-holly-orange px-2 py-1 rounded-full tracking-wider">
                        {selectedToppings.length} / 3 Seleccionados
                      </span>
                    </div>

                    {/* Toppings Error Message */}
                    <AnimatePresence>
                      {toppingError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mb-4"
                        >
                          <Info className="w-3 h-3" />
                          {toppingError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <div 
                        ref={toppingsRef}
                        onScroll={() => checkScroll(toppingsRef, setShowToppingsScroll)}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
                      >
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
                      
                      {/* Scroll Indicator */}
                      <AnimatePresence>
                        {showToppingsScroll && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-1"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-bold text-holly-orange uppercase tracking-[0.2em]">Más opciones</span>
                              <ChevronDown className="w-3 h-3 text-holly-orange animate-bounce" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* Extra Toppings Selection - Only for Soft category */}
                {product.category === 'soft' && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                        {isTina ? '4.' : (isFrapuccino || isMilkshake || isSundae) ? '2.' : '1.'} Contornos Extra (Costo adicional)
                      </h3>
                    </div>

                    <div className="relative">
                      <div 
                        ref={extraToppingsRef}
                        onScroll={() => checkScroll(extraToppingsRef, setShowExtraToppingsScroll)}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
                      >
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

                      {/* Scroll Indicator */}
                      <AnimatePresence>
                        {showExtraToppingsScroll && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-1"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-bold text-holly-orange uppercase tracking-[0.2em]">Más opciones</span>
                              <ChevronDown className="w-3 h-3 text-holly-orange animate-bounce" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* Extra Gelato Portions - Only for specific Gelato products */}
                {isGelatoWithExtraPortions && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                        3. Porciones de Gelato Extra (Costo adicional)
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      {GELATO_EXTRA_PORTIONS.map((portion) => {
                        const selectedPortion = selectedExtraToppings.find(t => t.name === portion.name);
                        const isSelected = !!selectedPortion;
                        
                        let flavors: string[] = [];
                        if (portion.name.includes('Básica')) flavors = GELATO_BASICO_FLAVORS;
                        if (portion.name.includes('Premium')) flavors = GELATO_PREMIUM_FLAVORS;
                        if (portion.name.includes('Película')) flavors = GELATO_PELICULA_FLAVORS;
                        if (portion.name.includes('Deluxe')) flavors = GELATO_DELUXE_FLAVORS;

                        return (
                          <div key={portion.name} className="flex flex-col gap-2">
                            <button
                              onClick={() => handleExtraToppingToggle(portion)}
                              className={`p-3 rounded-[12px] border text-left text-[10px] font-sans font-bold transition-all flex flex-col gap-1 ${
                                isSelected
                                  ? 'border-holly-orange bg-holly-orange text-white'
                                  : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/40'
                              }`}
                            >
                              <span className="leading-tight uppercase tracking-wider">{portion.name}</span>
                              <span className={`text-[9px] font-sans font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-holly-orange'}`}>
                                +${portion.price.toFixed(2)}
                              </span>
                            </button>
                            
                            {isSelected && flavors.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-1"
                              >
                                <label className="text-[8px] font-sans font-bold uppercase text-holly-brown/40 mb-1 block">Sabor de la porción:</label>
                                <select
                                  value={selectedPortion.flavor}
                                  onChange={(e) => handleExtraPortionFlavorChange(portion.name, e.target.value)}
                                  className="w-full bg-holly-cream/30 border border-holly-brown/10 rounded-lg px-2 py-1.5 text-[10px] font-sans font-bold text-holly-brown focus:outline-none focus:border-holly-orange"
                                >
                                  {flavors.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-holly-brown/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown/40 block mb-1">Precio Final</span>
                  <span className="text-4xl font-display font-bold text-holly-brown">
                    ${(currentBasePrice + extraToppingsTotal).toFixed(2)}
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
