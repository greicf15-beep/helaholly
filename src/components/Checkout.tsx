import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Loader2, CheckCircle2, Store as StoreIcon, Truck, Bike, Car, Search } from 'lucide-react';
import { OrderMode, CartItem, VehicleType, StoreLocation } from '../types';
import { StoreMap } from './StoreMap';
import { HOLLYWOOD_STORES, DELIVERY_RATE_PER_KM } from '../constants';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  mode: OrderMode;
  total: number;
  cart: CartItem[];
  preSelectedStore?: StoreLocation | null;
  onSubmit: (data: any) => void;
}

export function Checkout({ isOpen, onClose, mode, total, cart, preSelectedStore, onSubmit }: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(preSelectedStore || null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('moto');
  const [storeDistances, setStoreDistances] = useState<Record<string, number>>({});
  const [deliveryFee, setDeliveryFee] = useState(0);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const isMaracaiboStore = useMemo(() => {
    if (!selectedStore) return false;
    const mcboStores = ['mcbo-farmavid', 'mcbo-cima', 'mcbo-zonanorte', 'mcbo-cima-soft', 'mcbo-mallpaseo', 'mcbo-sanfelipe', 'mcbo-72'];
    return mcboStores.includes(selectedStore.id);
  }, [selectedStore]);

  const isCabimasStore = useMemo(() => {
    if (!selectedStore) return false;
    const cabStores = ['cab-farmak', 'cab-costamall'];
    return cabStores.includes(selectedStore.id);
  }, [selectedStore]);
  
  const distanceMatrixLib = useMapsLibrary('routes');
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !addressInputRef.current || mode !== 'delivery') return;

    const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 've' } // Restricted to Venezuela
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setAddress(place.formatted_address);
      }
      if (place.geometry?.location) {
        setLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [placesLib, mode]);

  const availableStores = useMemo(() => {
    const hasSoft = cart.some(item => item.category === 'soft');
    const hasNonPackagedGelato = cart.some(item => item.category === 'gelato' && !item.isPackaged);

    return HOLLYWOOD_STORES.filter(store => {
      if (hasSoft && store.type !== 'soft') return false;
      if (hasNonPackagedGelato && store.type !== 'gelateria') return false;
      return true;
    });
  }, [cart]);

  useEffect(() => {
    if (!location || mode !== 'delivery') return;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [location],
      destinations: availableStores.map(s => ({ lat: s.lat, lng: s.lng })),
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === 'OK' && response) {
        const newDistances: Record<string, number> = {};
        response.rows[0].elements.forEach((element, index) => {
          if (element.status === 'OK') {
            const distanceKm = element.distance.value / 1000;
            newDistances[availableStores[index].id] = distanceKm;
          }
        });
        setStoreDistances(newDistances);
      }
    });
  }, [location, mode, availableStores]);

  useEffect(() => {
    if (preSelectedStore) {
      setSelectedStore(preSelectedStore);
    }
  }, [preSelectedStore]);

  useEffect(() => {
    if (selectedStore && storeDistances[selectedStore.id] !== undefined && mode === 'delivery') {
      const distance = storeDistances[selectedStore.id];
      
      // Specific rules for Valencia (Naguanagua)
      if (selectedStore.id === 'val-naguanagua') {
        if (distance <= 2) {
          setDeliveryFee(2.00);
        } else if (distance < 5) {
          // $2.00 base + $0.40 per additional km
          setDeliveryFee(2.00 + (distance - 2) * 0.40);
        } else {
          // $0.50 per km for long routes
          setDeliveryFee(distance * 0.50);
        }
      } else if (isMaracaiboStore) {
        // Specific rules for Maracaibo/San Francisco
        if (vehicleType === 'moto') {
          if (distance <= 2.3) {
            setDeliveryFee(2.20);
          } else {
            // $2.20 base + $0.60 per additional km
            setDeliveryFee(2.20 + (distance - 2.3) * 0.60);
          }
        } else {
          // Carro
          if (distance <= 2.3) {
            setDeliveryFee(4.00);
          } else {
            // $4.00 base + $1.00 per additional km
            setDeliveryFee(4.00 + (distance - 2.3) * 1.00);
          }
        }
      } else if (isCabimasStore) {
        // Specific rules for Cabimas
        if (distance <= 2) {
          setDeliveryFee(2.00);
        } else {
          // $2.00 base + $0.50 per additional km
          setDeliveryFee(2.00 + (distance - 2) * 0.50);
        }
      } else {
        // Default rule for other stores
        setDeliveryFee(distance * DELIVERY_RATE_PER_KM);
      }
    } else {
      setDeliveryFee(0);
    }
  }, [selectedStore, storeDistances, mode, vehicleType, isMaracaiboStore]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no es compatible con tu navegador');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        alert('No pudimos obtener tu ubicación. Por favor, ingresa tu dirección manualmente.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const message = `*NUEVO PEDIDO HOLLYWOOD*%0A%0A` +
      `*Cliente:* ${name}%0A` +
      `*Teléfono:* ${phone}%0A` +
      `*Método:* ${mode === 'delivery' ? 'Delivery' : 'Retiro en Tienda'}%0A` +
      `*Sede:* ${selectedStore?.name || 'No especificada'}%0A` +
      (mode === 'delivery' ? `*Dirección:* ${address}%0A` : '') +
      (mode === 'delivery' && isMaracaiboStore ? `*Vehículo:* ${vehicleType.toUpperCase()}%0A` : '') +
      `%0A*PRODUCTOS:*%0A` +
      cart.map(item => {
        let itemStr = `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})`;
        if (item.customization) {
          if (item.customization.flavor) itemStr += `%0A  _Sabor: ${item.customization.flavor}_`;
          if (item.customization.toppings && item.customization.toppings.length > 0) itemStr += `%0A  _Toppings: ${item.customization.toppings.join(', ')}_`;
          if (item.customization.extraToppings && item.customization.extraToppings.length > 0) itemStr += `%0A  _Extras: ${item.customization.extraToppings.map(t => t.name).join(', ')}_`;
        }
        return itemStr;
      }).join('%0A') +
      `%0A%0A*Subtotal:* $${total.toFixed(2)}%0A` +
      (deliveryFee > 0 ? `*Delivery:* $${deliveryFee.toFixed(2)}%0A` : '') +
      `*TOTAL:* $${(total + deliveryFee).toFixed(2)}`;

    const whatsappUrl = `https://wa.me/${selectedStore?.phone || '584120000000'}?text=${message}`;
    
    onSubmit({
      name,
      phone,
      address: mode === 'delivery' ? address : 'Pick up',
      location,
      selectedStore,
      vehicleType: isMaracaiboStore ? vehicleType : null,
      total: total + deliveryFee,
      deliveryFee,
      mode,
    });
    
    setLoading(false);
    setSuccess(true);
    
    // Open WhatsApp after a short delay
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1500);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-holly-brown/60 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-holly-cream border border-holly-orange/10 shadow-[0_0_100px_rgba(0,0,0,0.2)] rounded-[40px] my-4 sm:my-12 overflow-visible"
          >
            {/* Decorative Top Bar */}
            <div className="h-2 bg-holly-orange w-full rounded-t-[40px]" />

            {success ? (
              <div className="p-8 sm:p-16 text-center space-y-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-32 h-32 sm:w-40 sm:h-40 bg-holly-orange text-holly-white rounded-full flex items-center justify-center mx-auto shadow-[0_15px_30px_rgba(241,183,11,0.4)]"
                >
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20" />
                </motion.div>
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-display font-bold uppercase text-holly-brown tracking-normal">¡PEDIDO CONFIRMADO!</h2>
                  <p className="text-lg sm:text-xl text-holly-brown/60 font-sans font-medium uppercase tracking-[0.2em] leading-relaxed">
                    Tu helado Holly está en producción. <br />
                    ¡Gracias por elegirnos!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-16">
                <div className="flex justify-between items-start mb-12 sm:mb-16">
                  <div className="space-y-2">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-holly-orange">Paso Final</span>
                    <h2 className="text-4xl sm:text-6xl font-display font-bold uppercase text-holly-brown tracking-normal">CHECKOUT</h2>
                  </div>
                  <button onClick={onClose} className="p-2 text-holly-brown/40 hover:text-holly-orange transition-all hover:rotate-90">
                    <X className="w-8 h-8 sm:w-12 sm:h-12" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-8">
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40 mb-4 group-focus-within:text-holly-orange transition-colors">Nombre del Cliente</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-0 py-4 bg-transparent border-b-2 border-holly-orange/10 text-holly-brown focus:outline-none focus:border-holly-orange transition-all text-2xl font-display font-bold uppercase tracking-widest placeholder:text-holly-brown/10"
                        placeholder="TU NOMBRE AQUÍ"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40 mb-4 group-focus-within:text-holly-orange transition-colors">Teléfono de Contacto</label>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-0 py-4 bg-transparent border-b-2 border-holly-orange/10 text-holly-brown focus:outline-none focus:border-holly-orange transition-all text-2xl font-display font-bold uppercase tracking-widest placeholder:text-holly-brown/10"
                        placeholder="+58 000 0000000"
                      />
                    </div>

                    {mode === 'delivery' && isMaracaiboStore && (
                      <div className="space-y-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40">
                          Tipo de Vehículo para Delivery
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setVehicleType('moto')}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                              vehicleType === 'moto'
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-orange/10 text-holly-brown hover:border-holly-orange/40'
                            }`}
                          >
                            <Bike className="w-8 h-8" />
                            <span className="font-display font-bold uppercase tracking-widest">Moto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVehicleType('carro')}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                              vehicleType === 'carro'
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-orange/10 text-holly-brown hover:border-holly-orange/40'
                            }`}
                          >
                            <Car className="w-8 h-8" />
                            <span className="font-display font-bold uppercase tracking-widest">Carro</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-8">
                      <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40 mb-4 group-focus-within:text-holly-orange transition-colors">
                          {mode === 'delivery' ? 'Dirección de Entrega' : 'Sede para Retiro'}
                        </label>
                        {mode === 'delivery' && (
                          <div className="relative group">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-holly-brown/20 group-focus-within:text-holly-orange transition-colors">
                              <Search className="w-6 h-6" />
                            </div>
                            <input
                              ref={addressInputRef}
                              required
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full pl-10 pr-0 py-4 bg-transparent border-b-2 border-holly-orange/10 text-holly-brown focus:outline-none focus:border-holly-orange transition-all text-2xl font-display font-bold uppercase tracking-widest placeholder:text-holly-brown/10 mb-8"
                              placeholder="BUSCAR DIRECCIÓN O ESCRIBIR..."
                            />
                          </div>
                        )}

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={handleGetLocation}
                              className="flex items-center gap-4 text-holly-orange hover:text-holly-brown font-bold uppercase tracking-[0.3em] text-xs transition-all group"
                            >
                              <div className="p-2 border border-holly-orange group-hover:bg-holly-orange group-hover:text-holly-white transition-all rounded-lg">
                                {loading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <MapPin className="w-5 h-5" />
                                )}
                              </div>
                              {location ? 'UBICACIÓN CAPTURADA' : 'USAR MI UBICACIÓN ACTUAL'}
                            </button>
                            
                            {selectedStore && (
                              <span className="text-[10px] font-bold text-holly-orange uppercase tracking-widest bg-holly-orange/10 px-2 py-1 rounded-full">
                                Sede: {selectedStore.name}
                              </span>
                            )}
                          </div>

                          <StoreMap 
                            userLocation={location} 
                            selectedStore={selectedStore}
                          />

                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-holly-brown">
                              Sede Seleccionada
                            </h4>
                            
                            {selectedStore ? (
                              <div className="p-6 rounded-2xl border-2 border-holly-orange bg-holly-orange/5 text-left flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-holly-orange text-white">
                                  <StoreIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-display font-bold uppercase text-lg">{selectedStore.name}</h4>
                                    {mode === 'delivery' && storeDistances[selectedStore.id] !== undefined && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-holly-orange">
                                        {storeDistances[selectedStore.id].toFixed(1)} km
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-holly-brown/60 font-medium">{selectedStore.address}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                                No se ha seleccionado ninguna sede. Por favor, regresa al inicio.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-holly-orange/10">
                    {mode === 'delivery' && deliveryFee > 0 && (
                      <div className="flex justify-between items-center mb-4 text-holly-brown/60">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          <span className="text-sm font-bold uppercase tracking-widest">Costo de Envío</span>
                        </div>
                        <span className="text-xl font-display font-bold">${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end mb-12">
                      <span className="text-xl font-sans font-bold uppercase text-holly-brown/40 tracking-[0.3em]">Total a Pagar</span>
                      <span className="text-7xl font-display font-bold text-holly-brown">${(total + deliveryFee).toFixed(2)}</span>
                    </div>
                    <button
                      disabled={loading || (mode === 'in-store' && !selectedStore) || availableStores.length === 0}
                      type="submit"
                      className="w-full py-6 bg-holly-brown text-white font-sans font-semibold text-[14px] uppercase tracking-[2px] hover:bg-holly-orange disabled:bg-holly-brown/20 disabled:text-holly-brown/40 disabled:cursor-not-allowed transition-all duration-500 shadow-xl flex items-center justify-center gap-6 rounded-[15px]"
                    >
                      {loading && <Loader2 className="w-8 h-8 animate-spin" />}
                      {loading ? 'PROCESANDO...' : 'REALIZAR PEDIDO'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
