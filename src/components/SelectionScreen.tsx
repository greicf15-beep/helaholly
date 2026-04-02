import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { HOLLYWOOD_STORES } from '../constants';
import { OrderMode, Category, StoreLocation } from '../types';
import { MapPin, Store as StoreIcon, ChevronRight, Navigation, Truck, ShoppingBag, ArrowLeft } from 'lucide-react';

interface SelectionScreenProps {
  orderMode: OrderMode | null;
  onOrderModeSelect: (mode: OrderMode) => void;
  selectedStore: StoreLocation | null;
  onStoreSelect: (store: StoreLocation) => void;
  onCategorySelect: (category: Category) => void;
}

export function SelectionScreen({ orderMode, onOrderModeSelect, selectedStore, onStoreSelect, onCategorySelect }: SelectionScreenProps) {
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
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false)
    );
  };

  if (!orderMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-holly-brown mb-4">
            ¿Cómo quieres tu pedido?
          </h1>
          <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[11px]">
            Selecciona tu método de entrega
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <motion.button
            whileHover={{ scale: 1.03, borderColor: '#e1a139' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOrderModeSelect('delivery')}
            className="group bg-white rounded-[30px] p-10 shadow-xl border-2 border-holly-brown/5 transition-all duration-500 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-holly-cream rounded-[20px] flex items-center justify-center mb-6 group-hover:bg-holly-orange group-hover:text-white transition-all">
              <Truck className="w-12 h-12 text-holly-orange group-hover:text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-holly-brown mb-2 uppercase">Delivery</h2>
            <p className="text-holly-brown/40 text-[11px] font-sans font-medium uppercase tracking-[1px]">Te lo llevamos a donde estés</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, borderColor: '#e1a139' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOrderModeSelect('in-store')}
            className="group bg-white rounded-[30px] p-10 shadow-xl border-2 border-holly-brown/5 transition-all duration-500 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-holly-cream rounded-[20px] flex items-center justify-center mb-6 group-hover:bg-holly-orange group-hover:text-white transition-all">
              <ShoppingBag className="w-12 h-12 text-holly-orange group-hover:text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-holly-brown mb-2 uppercase">Pick Up</h2>
            <p className="text-holly-brown/40 text-[11px] font-sans font-medium uppercase tracking-[1px]">Retira en tu sede favorita</p>
          </motion.button>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative">
        <button 
          onClick={() => onOrderModeSelect(null as any)}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-md text-holly-brown hover:text-holly-orange transition-all flex items-center gap-2 font-sans font-bold uppercase tracking-widest text-[9px] sm:text-[10px] z-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Atrás
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-holly-brown mb-4">
            Bienvenido a Hollywood
          </h1>
          <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[11px]">
            Selecciona tu sede más cercana
          </p>
        </motion.div>

        <div className="w-full max-w-2xl space-y-6">
          <button
            onClick={handleGetLocation}
            className="w-full p-6 bg-white rounded-[30px] shadow-lg flex items-center justify-between group hover:bg-holly-orange transition-all duration-500 border border-holly-brown/5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-holly-cream rounded-2xl group-hover:bg-white/20">
                <Navigation className={`w-6 h-6 ${loadingLocation ? 'animate-spin' : ''} text-holly-orange group-hover:text-white`} />
              </div>
              <div className="text-left">
                <span className="block font-display font-bold text-xl text-holly-brown group-hover:text-white">
                  {userLocation ? 'Ubicación Detectada' : 'Detectar mi ubicación'}
                </span>
                <span className="text-[10px] font-sans font-bold text-holly-brown/40 uppercase tracking-widest group-hover:text-white/60">
                  Para sugerirte la sede más cercana
                </span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {sortedStores.map((store, index) => (
              <motion.button
                key={store.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onStoreSelect(store)}
                className="w-full p-6 bg-white rounded-[30px] shadow-md flex items-center justify-between group hover:border-holly-orange border-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-holly-cream rounded-2xl group-hover:bg-holly-orange/10">
                    <StoreIcon className="w-6 h-6 text-holly-brown group-hover:text-holly-orange" />
                  </div>
                  <div className="text-left">
                    <span className="block font-display font-bold text-lg text-holly-brown">{store.name}</span>
                    <span className="text-[11px] text-holly-brown/40 font-sans font-medium uppercase tracking-wider">{store.address}</span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-holly-brown/20 group-hover:text-holly-orange transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative">
      <button 
        onClick={() => onStoreSelect(null as any)}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-md text-holly-brown hover:text-holly-orange transition-all flex items-center gap-2 font-sans font-bold uppercase tracking-widest text-[9px] sm:text-[10px] z-10"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Atrás
      </button>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-holly-cream rounded-full text-holly-orange text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-widest border border-holly-orange/10">
            <StoreIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Sede: {selectedStore.name}
            <button 
              onClick={() => onStoreSelect(null as any)} 
              className="ml-2 px-2 py-0.5 bg-holly-orange text-white rounded-md hover:bg-holly-brown transition-colors"
            >
              Cambiar
            </button>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-holly-brown mb-4 tracking-normal">
          ¿Qué te provoca hoy?
        </h1>
        <p className="text-holly-orange font-sans font-semibold uppercase tracking-[1.5px] text-[11px]">
          Selecciona tu favorito
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* GELATO CARD */}
        <motion.button
          whileHover={{ scale: 1.03, borderColor: '#e1a139' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onCategorySelect('gelato')}
          className="relative group bg-white rounded-[25px] sm:rounded-[30px] p-6 sm:p-8 shadow-xl border-2 border-holly-brown/5 transition-all duration-500 flex flex-col items-center"
        >
          <div className="w-full aspect-square mb-4 sm:mb-6 overflow-hidden rounded-[15px] sm:rounded-[20px] bg-holly-cream relative">
            <img 
              src="https://picsum.photos/seed/holly-gelato-premium/800/800" 
              alt="Gelato Premium"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-holly-brown/20 to-transparent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-holly-brown mb-1 sm:mb-2 tracking-normal">GELATO</h2>
          <p className="text-holly-brown/40 text-[9px] sm:text-[11px] font-sans font-medium uppercase tracking-[1px]">
            {selectedStore.type === 'soft' ? 'Envasados listos para llevar' : 'Cremosidad Italiana Premium'}
          </p>
          
          <div className="mt-4 sm:mt-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-holly-brown flex items-center justify-center text-white shadow-lg group-hover:bg-holly-orange transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* SOFT CARD */}
        <motion.button
          whileHover={{ scale: 1.03, borderColor: '#e1a139' }}
          whileTap={{ scale: 0.97 }}
          disabled={selectedStore.type === 'gelateria'}
          onClick={() => onCategorySelect('soft')}
          className={`relative group bg-white rounded-[25px] sm:rounded-[30px] p-6 sm:p-8 shadow-xl border-2 border-holly-brown/5 transition-all duration-500 flex flex-col items-center ${
            selectedStore.type === 'gelateria' ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-holly-orange'
          }`}
        >
          <div className="w-full aspect-square mb-4 sm:mb-6 overflow-hidden rounded-[15px] sm:rounded-[20px] bg-holly-cream relative">
            <img 
              src="https://picsum.photos/seed/holly-cone/800/800" 
              alt="Soft Serve"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-holly-brown/20 to-transparent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-holly-brown mb-1 sm:mb-2 tracking-normal">SOFT</h2>
          <p className="text-holly-brown/40 text-[9px] sm:text-[11px] font-sans font-medium uppercase tracking-[1px]">
            {selectedStore.type === 'gelateria' ? 'No disponible en esta sede' : 'Ligero, suave y refrescante'}
          </p>

          <div className="mt-4 sm:mt-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-holly-brown flex items-center justify-center text-white shadow-lg group-hover:bg-holly-orange transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
