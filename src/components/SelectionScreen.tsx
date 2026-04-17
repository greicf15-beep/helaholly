import React, { useState, useMemo } from 'react';
import { StoreLocation } from '../types';
import { HOLLYWOOD_STORES } from '../constants';
import { motion } from 'motion/react';
import { Truck, Store as StoreIcon, Navigation, ArrowLeft, MapPin } from 'lucide-react';

interface SelectionScreenProps {
  orderMode: 'delivery' | 'pickup' | null;
  onOrderModeSelect: (mode: 'delivery' | 'pickup') => void;
  selectedStore: StoreLocation | null;
  onStoreSelect: (store: StoreLocation | null) => void;
  onCategorySelect: (category: 'gelato' | 'soft') => void;
}

import { logoBase64 } from '../logo_holly_base64';

export function SelectionScreen({
  orderMode,
  onOrderModeSelect,
  selectedStore,
  onStoreSelect,
  onCategorySelect
}: SelectionScreenProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const sortedStores = useMemo(() => {
    if (!userLocation) return HOLLYWOOD_STORES;
    return [...HOLLYWOOD_STORES].sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.lat - userLocation.lat, 2) + Math.pow(a.lng - userLocation.lng, 2));
      const distB = Math.sqrt(Math.pow(b.lat - userLocation.lat, 2) + Math.pow(b.lng - userLocation.lng, 2));
      return distA - distB;
    });
  }, [userLocation]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLocation(false);
        },
        () => setLoadingLocation(false)
      );
    }
  };

  const img_logo_holly_png = logoBase64;
  const img_gelato_webp = '/gelato.webp';
  const img_soft_webp = '/soft.webp';

  // State 3: Mode & Store selected -> Select Category
  if (orderMode && selectedStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative">
        <button
          onClick={() => onStoreSelect(null)}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-md text-holly-brown hover:text-holly-orange transition-all flex items-center gap-2 font-sans font-bold uppercase tracking-widest text-[9px] sm:text-[10px] z-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Atrás
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mb-12">
          <div className="flex flex-col items-center mb-6 sm:mb-12">
            <img src={img_logo_holly_png} alt="Heladería Hollywood" className="h-16 sm:h-24 w-auto object-contain mb-3 sm:mb-4" />
            <div className="flex flex-col items-center">
              <span className="text-[7px] sm:text-[10px] font-bold text-holly-brown/40 uppercase tracking-widest mb-1">Modo Seleccionado</span>
              <div className="flex items-center gap-1.5 text-holly-orange font-display font-bold text-[10px] sm:text-sm">
                {orderMode === 'delivery' ? (
                  <>
                    <Truck className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                    <span>MODO: DELIVERY</span>
                  </>
                ) : (
                  <>
                    <StoreIcon className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                    <span>MODO: PICK UP</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-1 sm:gap-y-2 max-w-4xl mx-auto px-2 sm:px-4 mb-8 sm:mb-16">
            <div className="flex flex-col items-start" />
            <div className="flex flex-col items-end text-right">
              <span className="text-lg sm:text-2xl font-display font-bold text-holly-brown uppercase tracking-tight">
                SEDE {selectedStore.name.replace(/Hollywood\s*/i, '')}
              </span>
            </div>
            <div className="flex flex-col items-start" />
            <div className="flex flex-col items-end text-right">
              <button onClick={() => onStoreSelect(null)} className="text-[8px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-holly-orange hover:bg-holly-orange hover:text-white border border-holly-orange px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all flex items-center gap-1">
                Cambiar sede
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[9px] sm:text-[11px] mb-1 sm:mb-2">
              Bienvenido a Hollywood
            </p>
            <h1 className="text-3xl sm:text-6xl font-display font-bold text-holly-brown mb-2 sm:mb-4">
              ¿Qué se te antoja hoy?
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[900px] w-full px-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategorySelect('gelato')}
            className="group relative overflow-hidden rounded-[2rem] sm:rounded-[40px] aspect-[4/5] sm:aspect-[4/3] shadow-xl border border-holly-brown/10"
          >
            <img src={img_gelato_webp} alt="Gelato Artigianale" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-left">
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-2">Gelato</h2>
              <p className="text-white/90 font-sans text-sm sm:text-lg mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                La experiencia original. Intenso, cremoso y hecho con pasión.
              </p>
              <div className="inline-flex items-center font-sans font-bold text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] relative overflow-hidden">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Explorar Línea</span>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategorySelect('soft')}
            className={`group relative overflow-hidden rounded-[2rem] sm:rounded-[40px] aspect-[4/5] sm:aspect-[4/3] shadow-xl border border-holly-brown/10 ${selectedStore.type === 'gelateria' ? 'filter grayscale opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedStore.type === 'gelateria'}
          >
            <img src={img_soft_webp} alt="Soft Ice Cream" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-left">
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-2">Soft</h2>
              <p className="text-white/90 font-sans text-sm sm:text-lg mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                Suave, divertido y lleno de toppings.
              </p>
              {selectedStore.type === 'gelateria' ? (
                <div className="inline-flex items-center font-sans text-[10px] sm:text-xs text-white uppercase tracking-[0.1em] px-3 py-1.5 bg-red-500/80 rounded-full font-bold">
                  No disponible en esta sede
                </div>
              ) : (
                <div className="inline-flex items-center font-sans font-bold text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] relative overflow-hidden">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Explorar Línea</span>
                </div>
              )}
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // State 2: Mode Selected -> Select Store
  if (orderMode && !selectedStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-holly-cream/30 pt-10 sm:pt-20">
        <button
          onClick={() => onOrderModeSelect(null as any)}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-md text-holly-brown hover:text-holly-orange transition-all flex items-center gap-2 font-sans font-bold uppercase tracking-widest text-[9px] sm:text-[10px] z-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Atrás
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
          <img src={img_logo_holly_png} alt="Heladería Hollywood" className="h-16 sm:h-24 w-auto object-contain mx-auto mb-4" />
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <span className="text-[7px] sm:text-[10px] font-bold text-holly-brown/40 uppercase tracking-widest mb-1">Modo Seleccionado</span>
            <div className="flex items-center gap-1.5 text-holly-orange font-display font-bold text-[10px] sm:text-sm">
              {orderMode === 'delivery' ? (
                <>
                  <Truck className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                  <span>MODO: DELIVERY</span>
                </>
              ) : (
                <>
                  <StoreIcon className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                  <span>MODO: PICK UP</span>
                </>
              )}
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-holly-brown mb-2">Bienvenido a Hollywood</h1>
          <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[9px] sm:text-[11px]">Selecciona tu sede más cercana</p>
        </motion.div>

        <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
          <button
            onClick={handleGetLocation}
            className="w-full p-4 sm:p-6 bg-white rounded-[20px] sm:rounded-[30px] shadow-lg flex items-center justify-between group hover:bg-holly-orange transition-all duration-500 border border-holly-brown/5"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-holly-cream rounded-xl sm:rounded-2xl group-hover:bg-white/20">
                <Navigation className={`w-5 h-5 sm:w-6 sm:h-6 ${loadingLocation ? 'animate-spin' : ''} text-holly-orange group-hover:text-white`} />
              </div>
              <div className="text-left">
                <span className="block font-display font-bold text-lg sm:text-xl text-holly-brown group-hover:text-white">
                  {userLocation ? 'Ubicación Detectada' : 'Detectar mi ubicación'}
                </span>
                <span className="text-[8px] sm:text-[10px] font-sans font-bold text-holly-brown/40 uppercase tracking-widest group-hover:text-white/60">
                  Para sugerirte la sede más cercana
                </span>
              </div>
            </div>
          </button>

          <div className="space-y-3 sm:space-y-4">
            {sortedStores.map((store) => (
              <motion.button
                key={store.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onStoreSelect(store)}
                className="w-full flex items-stretch bg-white rounded-[20px] sm:rounded-[30px] shadow-md hover:shadow-xl transition-all border border-holly-brown/5 overflow-hidden group text-left"
              >
                <div className={`w-2 sm:w-3 ${store.type === 'gelateria' ? 'bg-holly-orange' : 'bg-holly-pink'}`} />
                <div className="flex-1 p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-holly-brown mb-1 sm:mb-2 group-hover:text-holly-orange transition-colors">
                      {store.name}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-holly-brown/60 mb-2 sm:mb-3">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <p className="text-[10px] sm:text-xs font-sans leading-relaxed">{store.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${store.type === 'gelateria' ? 'bg-holly-orange/10 text-holly-orange' : 'bg-holly-pink/10 text-holly-pink'}`}>
                        {store.type === 'gelateria' ? 'Gelatería' : 'Tienda Soft'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 sm:ml-6 flex-shrink-0 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-holly-cream flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-holly-orange transform rotate-180" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // State 1: Select Mode (Delivery vs Pickup)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-16">
        <img src={img_logo_holly_png} alt="Heladería Hollywood" className="h-24 sm:h-40 w-auto object-contain mx-auto mb-6 sm:mb-8" />
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-holly-brown mb-3 sm:mb-4">
          ¿Cómo quieres tu pedido?
        </h1>
        <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[9px] sm:text-[11px]">
          Selecciona tu método de entrega
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-4xl">
        <motion.button
          whileHover={{ scale: 1.03, borderColor: "#e1a139" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOrderModeSelect('delivery')}
          className="group bg-white rounded-[25px] sm:rounded-[30px] p-6 sm:p-10 shadow-xl border-2 border-transparent transition-all flex flex-col items-center justify-center gap-4 sm:gap-6 min-h-[200px] sm:min-h-[280px]"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-[20px] bg-[#e1a139] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Truck className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#b55a30] mb-2 sm:mb-3 group-hover:text-[#e1a139] transition-colors">
              DELIVERY
            </h2>
            <p className="text-[#d89163] font-sans font-bold uppercase tracking-[2px] text-[8px] sm:text-[10px]">
              Te lo llevamos a donde estés
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, borderColor: "#e1a139" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOrderModeSelect('pickup')}
          className="group bg-white rounded-[25px] sm:rounded-[30px] p-6 sm:p-10 shadow-xl border-2 border-transparent transition-all flex flex-col items-center justify-center gap-4 sm:gap-6 min-h-[200px] sm:min-h-[280px]"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-[20px] border-[3px] border-[#e1a139] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 bg-white">
            <StoreIcon className="w-10 h-10 sm:w-14 sm:h-14 text-[#e1a139]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#b55a30] mb-2 sm:mb-3 group-hover:text-[#e1a139] transition-colors">
              PICK UP
            </h2>
            <p className="text-[#d89163] font-sans font-bold uppercase tracking-[2px] text-[8px] sm:text-[10px]">
              Retira en tu sede favorita
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
