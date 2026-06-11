import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Info, ChevronDown, Plus, Minus } from 'lucide-react';
import { Product, CartItem } from '../types';
import { IceCreamScoop } from './IceCreamScoop';
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
  const isTinaGalleta = product.id === 's4';
  const isBubbleWaffle = product.id === 's5';
  const isFrapuccino = product.id.startsWith('frapuccinos-custom');
  const isMilkshake = product.id.startsWith('milkshakes-custom');
  const isSundae = product.id === 's6';
  const isFrosty = product.id === 's7';
  const isSundaeOrFrosty = isSundae || isFrosty;
  const isMaxiSundae = product.id === 's9' || product.id === 's10';
  const isMaxiSundaePremium = product.id === 's10';
  
  const MAXI_PREMIUM_TOPPINGS = [
    'Gotas de Chocolate Oscuro', 'Gotas de Chocolate Blanco', 'Dandy', 'Flips', 
    'Choco Crunch', 'Miramar', 'Lluvia de Colores', 'Lluvia de Chocolate', 'Mani', 'Oreo'
  ];

  const MAGIC_LAYERS = [
    'Chocolate Oscuro', 'Chocolate Blanco'
  ];

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
  const [selectedTeam, setSelectedTeam] = useState<string>('Piru');
  const [selectedPremiumTopping, setSelectedPremiumTopping] = useState<string>('Gotas de Chocolate Oscuro');
  const [selectedMagicLayer, setSelectedMagicLayer] = useState<string>('Chocolate Oscuro');
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

  const handleToppingAdd = (topping: string) => {
    if (selectedToppings.length < 3) {
      setSelectedToppings([...selectedToppings, topping]);
      setToppingError(null);
    } else {
      setToppingError('Has alcanzado el límite de 60g de contornos gratis');
    }
  };

  const handleToppingRemove = (topping: string) => {
    const index = selectedToppings.indexOf(topping);
    if (index > -1) {
      const newToppings = [...selectedToppings];
      newToppings.splice(index, 1);
      setSelectedToppings(newToppings);
      setToppingError(null);
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
        team: isMaxiSundae ? selectedTeam : undefined,
        premiumTopping: isMaxiSundaePremium ? selectedPremiumTopping : undefined,
        magicLayer: isMaxiSundaePremium ? selectedMagicLayer : undefined,
        toppings: (isFrapuccino || isMilkshake || isSundaeOrFrosty || isGroupedGelato || isCookieOrBrownie || isMaxiSundaePremium) ? [] : selectedToppings,
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
                {isMilkshake && product.category === 'gelato' && (
                  <div className="flex justify-center">
                    <img 
                      src={selectedFlavor ? `/${selectedFlavor.toLowerCase().replace(/[-\s]/g, '') === 'merengadagelatoferrero' ? 'merengadagelatoferreros' : selectedFlavor.toLowerCase().replace(/[-\s]/g, '')}.webp` : '/merengadasgelato.webp'} 
                      alt={selectedFlavor || product.name} 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-xl transition-all duration-300"
                      onError={(e) => {
                        // Fallback to default if specific flavor image is not found
                        (e.target as HTMLImageElement).src = '/merengadasgelato.webp';
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {isMilkshake && product.category === 'soft' && (
                  <div className="flex justify-center">
                    <img 
                      src={product.image || '/milkshakesoft.webp'} 
                      alt={product.name} 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-xl transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {isFrapuccino && product.category === 'gelato' && (
                  <div className="flex justify-center">
                    <img 
                      src={'/frappuccinogelatosinfondo.webp'} 
                      alt={selectedFlavor || product.name} 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {isGelatoWithExtraPortions && (
                  <div className="flex justify-center">
                    <img 
                      src={`/${product.name.toLowerCase().replace(/\s+/g, '').replace('ò', 'o')}sinfondo.webp`}
                      alt={product.name} 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-xl"
                      onError={(e) => {
                        // Fallback image if sinfondo is not uploaded yet for a specific size
                        (e.target as HTMLImageElement).src = product.image;
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {isTinaGalleta && (
                  <div className="flex justify-center">
                    <img 
                      src="/tinagalletausuario.webp"
                      alt={product.name} 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-xl transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {isBubbleWaffle && (
                  <div className="flex justify-center">
                    <img 
                      src="/bubblewaffleusuario.webp"
                      alt={product.name} 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-xl transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Promo Selection - Only for Grouped Promos */}
                {isPromoGroup && (
                  <section>
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown mb-4">1. Selecciona tu Promo / Combo</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {PROMOS.map((promo) => (
                        <button
                          key={promo.id}
                          onClick={() => setSelectedPromo(promo)}
                          className={`p-3 sm:p-4 rounded-[20px] border-2 transition-all flex flex-row items-center gap-3 sm:gap-4 text-left ${
                            selectedPromo?.id === promo.id
                              ? 'border-holly-orange bg-holly-orange/5'
                              : 'border-holly-brown/5 hover:border-holly-orange/30'
                          }`}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[12px] sm:rounded-[15px] overflow-hidden flex-shrink-0 bg-holly-cream self-start sm:self-center">
                            <img 
                              src={promo.image} 
                              alt={promo.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col self-start sm:self-center">
                            <h4 className="font-display font-bold text-holly-brown uppercase tracking-wide text-[16px] sm:text-[18px] leading-[1.1]">
                              {promo.name.split(' ').map((word, i) => (
                                <span key={i} className="block">{word}</span>
                              ))}
                            </h4>
                            <p className="text-[9px] sm:text-[12px] text-holly-brown/80 font-sans mt-2 leading-relaxed">
                              {promo.description}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-1 self-start sm:self-center">
                            {promo.price > 0 && (
                              <span className="text-[16px] sm:text-[18px] font-display font-bold text-holly-orange whitespace-nowrap inline-block mt-[-2px]">
                                ${promo.price.toFixed(2)}
                              </span>
                            )}
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPromo?.id === promo.id ? 'border-holly-orange bg-holly-orange text-white' : 'border-holly-brown/10'
                            }`}>
                              {selectedPromo?.id === promo.id && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Size Selection - Only for Tinas */}
                {isTina && (
                  <div className="flex flex-col gap-6">
                    {/* Selected Size Image */}
                    <div className="w-full h-64 sm:h-80 relative flex items-center justify-center">
                      <img 
                        src={
                          selectedSize?.label === '16oz' ? '/tina16oz.webp' : 
                          selectedSize?.label === '12oz' ? '/tina12oz.webp' : 
                          '/tina6oz.webp'
                        } 
                        alt={`Tina ${selectedSize?.label || '6oz'}`} 
                        className="w-full h-full object-contain relative z-10"
                      />
                    </div>

                    <section>
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown mb-4">1. Selecciona el Tamaño</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {TINA_SIZES.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={`p-4 sm:p-6 rounded-[15px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                              selectedSize?.id === size.id
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                            }`}
                          >
                            <span className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wider leading-none">{size.label}</span>
                            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider opacity-60">${size.price.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {isFrapuccino ? (
                        frapuccinoFlavors.map((flavor) => (
                          <button
                            key={flavor.name}
                            onClick={() => setSelectedFlavor(flavor.name)}
                            className={`p-4 rounded-[15px] border-2 transition-all text-center flex flex-col items-center justify-center gap-2 ${
                              selectedFlavor === flavor.name
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                            }`}
                          >
                            <div className="w-16 h-16 mb-1 relative flex items-center justify-center">
                              {flavor.name.toLowerCase().includes('original') || flavor.name.toLowerCase().includes('café') ? (
                                <img src="/frappuccinocafe.webp" alt={flavor.name} className="w-16 h-16 object-contain" />
                              ) : flavor.name.toLowerCase().includes('tiramisu') || flavor.name.toLowerCase().includes('tiramisú') ? (
                                <img src="/frappuccinotiramisu.webp" alt={flavor.name} className="w-16 h-16 object-contain" />
                              ) : (
                                <IceCreamScoop flavorName={flavor.name} className="w-full h-full" />
                              )}
                            </div>
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
                            className={`p-4 rounded-[15px] border-2 transition-all text-center flex flex-col items-center justify-center gap-2 ${
                              selectedFlavor === flavor.name
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                            }`}
                          >
                            {(() => {
                              if (product.category === 'soft') {
                                const flavorName = flavor.name.toLowerCase();
                                let imgSrc = '';
                                if (flavorName === 'oreo') imgSrc = '/merengadagelatooreo.webp';
                                else if (flavorName === 'ferrero rochers' || flavorName === 'ferrero') imgSrc = '/merengadagelatoferreros.webp';
                                else if (flavorName === 'toddy crunch') imgSrc = '/toddy.webp';
                                else if (flavorName === 'brownie snickers') imgSrc = '/snickers.webp';
                                else if (flavorName === 'frutos del bosque') imgSrc = '/frutosdelbosque.webp';

                                if (imgSrc) {
                                  return (
                                    <div className="w-16 h-16 mb-1 relative flex items-center justify-center">
                                      <img src={imgSrc} alt={flavor.name} className="w-16 h-16 object-contain" />
                                    </div>
                                  );
                                }
                              }
                              return <IceCreamScoop flavorName={flavor.name} className="w-16 h-16 mb-1" />;
                            })()}
                            <span className="font-display font-bold uppercase tracking-wider">{flavor.name.replace('Merengada ', '')}</span>
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
                              className={`p-4 rounded-[15px] border-2 transition-all text-center flex flex-col items-center justify-center gap-2 ${
                                isSelected
                                  ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                  : isDisabled
                                    ? 'border-holly-brown/5 text-holly-brown/20 cursor-not-allowed'
                                    : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {isGelato16oz ? (
                                  <img 
                                    src={
                                      flavor === 'Fresa' ? '/16ozfresa.webp' :
                                      flavor === 'Chocolattisimo' ? '/16ozchocolat.webp' :
                                      flavor === 'Ron Pasas' ? '/16ozronpasas.webp' :
                                      flavor === 'Brownie Snickers' ? '/16ozbrowniesnickers.webp' :
                                      flavor === 'Brazo Gitano de Coco' ? '/16ozbrazogitanococ.webp' :
                                      flavor === 'Pistacho' ? '/16ozpist.webp' :
                                      flavor.toLowerCase().includes('chocolate') || flavor.toLowerCase().includes('brownie') || flavor.toLowerCase().includes('oreo') ? '/16ozbrown.webp' : 
                                      '/16oz.webp'
                                    } 
                                    alt={`Helado 16oz ${flavor}`} 
                                    className="w-24 h-24 object-contain filter drop-shadow-md" 
                                  />
                                ) : (
                                  <IceCreamScoop flavorName={flavor} className="w-16 h-16" />
                                )}
                              </div>
                              <span className="font-display font-bold uppercase tracking-wider">{flavor}</span>
                            </button>
                          );
                        })
                      ) : (
                        TINA_FLAVORS.map((flavor) => {
                          let flavorImg = '';
                          if (flavor === 'Mantecado') flavorImg = '/mantecadosoft.webp';
                          else if (flavor === 'Chocolate') flavorImg = '/chocolatesoft.webp';
                          else if (flavor === 'Dulce de Leche') flavorImg = '/dulcedelechesoft.webp';
                          
                          return (
                            <button
                              key={flavor}
                              onClick={() => setSelectedFlavor(flavor)}
                              className={`relative overflow-hidden h-28 sm:h-32 rounded-[15px] border-2 transition-all text-center flex flex-col items-center justify-end ${
                                selectedFlavor === flavor
                                  ? 'border-holly-orange'
                                  : 'border-transparent hover:border-holly-orange/50'
                              } shadow-sm`}
                            >
                              {flavorImg ? (
                                <>
                                  <img src={flavorImg} alt={flavor} className="absolute inset-0 w-full h-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-holly-orange/5">
                                  <IceCreamScoop flavorName={flavor} className="w-16 h-16" />
                                </div>
                              )}
                              <span 
                                className={`relative z-10 pb-3 px-2 font-display font-black uppercase tracking-wider text-[13px] sm:text-[15px] ${flavorImg ? 'text-white' : 'text-holly-brown'}`}
                                style={flavorImg ? { 
                                  textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.8)',
                                  WebkitTextStroke: '0.5px rgba(0,0,0,0.2)'
                                } : {}}
                              >
                                {flavor}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </section>
                )}

                {/* Team Selection - Only for Maxi Sundae */}
                {isMaxiSundae && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                        2. Selecciona tu Team
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Piru', 'Panki', 'Loli'].map((team) => (
                        <button
                          key={team}
                          onClick={() => setSelectedTeam(team)}
                          className={`p-4 rounded-[15px] border-2 transition-all text-center flex flex-col gap-1 ${
                            selectedTeam === team
                              ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                              : 'border-holly-brown/5 text-holly-brown hover:border-holly-orange/30'
                          }`}
                        >
                          <span className="font-display font-bold uppercase tracking-wider">{team}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Premium Topping & Magic Layer Selection - Only for Maxi Sundae Premium */}
                {isMaxiSundaePremium && (
                  <>
                    <section>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                          3. ELIGE TU TOPPING PREMIUM
                        </h3>
                      </div>
                      <div className="relative">
                        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                          {MAXI_PREMIUM_TOPPINGS.map((topping, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedPremiumTopping(topping)}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                                selectedPremiumTopping === topping
                                  ? 'border-holly-orange bg-holly-orange/5 text-holly-orange shadow-md'
                                  : 'border-holly-brown/5 text-holly-brown hover:border-holly-brown/20'
                              }`}
                            >
                              <span className="font-sans font-bold text-[10px] sm:text-[11px] leading-tight flex-1 flex items-center justify-center uppercase">{topping}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="mt-8">
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                          4. ELIGE TU CAPITA MÁGICA
                        </h3>
                      </div>
                      <div className="relative">
                        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                          {MAGIC_LAYERS.map((layer, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedMagicLayer(layer)}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                                selectedMagicLayer === layer
                                  ? 'border-holly-orange bg-holly-orange/5 text-holly-orange shadow-md'
                                  : 'border-holly-brown/5 text-holly-brown hover:border-holly-brown/20'
                              }`}
                            >
                              <span className="font-sans font-bold text-[10px] sm:text-[11px] leading-tight flex-1 flex items-center justify-center uppercase">{layer}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {/* Toppings Selection - Not for Frappuccinos, Milkshakes, Sundae/Frosty, Grouped Gelato, or Cookies/Brownies */}
                {(!isFrapuccino && !isMilkshake && !isSundaeOrFrosty && !isGroupedGelato && !isCookieOrBrownie && !isMaxiSundaePremium) && (
                  <section>
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex justify-between items-end">
                        <h3 className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-holly-brown">
                          {isMaxiSundae ? '3.' : isTina ? '3.' : '2.'} Contornos Gratis (Máx 60g)
                        </h3>
                        <span className="text-[9px] font-sans font-bold uppercase bg-holly-orange/10 text-holly-orange px-2 py-1 rounded-full tracking-wider">
                          {selectedToppings.length * 20}g / 60g
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-holly-brown/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(selectedToppings.length / 3) * 100}%` }}
                          className="h-full bg-holly-orange"
                          transition={{ duration: 0.3 }}
                        />
                      </div>
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
                          <Info className="w-3 h-3 flex-shrink-0" />
                          <span className="leading-tight">{toppingError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <div 
                        ref={toppingsRef}
                        onScroll={() => checkScroll(toppingsRef, setShowToppingsScroll)}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar pb-2"
                      >
                        {TOPPINGS.map((topping) => {
                          const count = selectedToppings.filter(t => t === topping).length;
                          const isDisabled = selectedToppings.length >= 3;
                          
                          return (
                            <div
                              key={topping}
                              className={`p-3 rounded-[12px] border transition-all flex flex-col justify-between gap-2 min-h-[72px] ${
                                count > 0
                                  ? 'border-holly-orange bg-holly-orange/5'
                                  : 'border-holly-brown/5 bg-white'
                              }`}
                            >
                              <span className="text-[9px] font-sans font-bold leading-tight uppercase tracking-wider text-holly-brown">
                                {topping.replace('Topping ', '').replace('Toppping ', '')}
                              </span>
                              
                              <div className="flex items-center justify-between w-full h-6">
                                {count > 0 ? (
                                  <div className="flex items-center justify-between bg-white rounded-full px-2 py-1 shadow-sm border border-holly-brown/10 w-full h-full">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleToppingRemove(topping); }}
                                      className="text-holly-brown hover:text-holly-orange transition-colors flex items-center justify-center p-0.5"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-[10px] font-bold text-holly-brown w-6 text-center">{count * 20}g</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleToppingAdd(topping); }}
                                      disabled={isDisabled}
                                      className={`transition-colors flex items-center justify-center p-0.5 ${isDisabled ? 'text-holly-brown/30 cursor-not-allowed' : 'text-holly-brown hover:text-holly-orange'}`}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleToppingAdd(topping)}
                                    disabled={isDisabled}
                                    className={`w-full h-full rounded-full text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                                      isDisabled 
                                        ? 'bg-holly-brown/5 text-holly-brown/30 cursor-not-allowed' 
                                        : 'bg-holly-orange/10 text-holly-orange hover:bg-holly-orange hover:text-white'
                                    }`}
                                  >
                                    Agregar
                                  </button>
                                )}
                              </div>
                            </div>
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
                        {isMaxiSundaePremium ? '5.' : isMaxiSundae ? '4.' : isTina ? '4.' : (isFrapuccino || isMilkshake || isSundae) ? '2.' : '1.'} Contornos Extra (Costo adicional)
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
