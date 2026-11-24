import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Loader2, CheckCircle2, Store as StoreIcon, Truck, Bike, Car, Search, Gift } from 'lucide-react';
import { OrderMode, CartItem, VehicleType, StoreLocation, CustomerProfile } from '../types';
import { StoreMap } from './StoreMap';
import { HOLLYWOOD_STORES, DELIVERY_RATE_PER_KM } from '../constants';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { calculateCartAccumulationPoints } from '../loyaltyConstants';
import { useClubHollywood } from '../context/ClubHollywoodContext';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  mode: OrderMode;
  total: number;
  cart: CartItem[];
  preSelectedStore?: StoreLocation | null;
  onSubmit: (data: any) => void;
  loyaltyProfile?: CustomerProfile | null;
  onAddPoints?: (amount: number) => Promise<void>;
  onDeductPoints?: (amount: number) => Promise<boolean>;
}

export function Checkout({ isOpen, onClose, mode, total, cart, preSelectedStore, onSubmit, loyaltyProfile, onAddPoints, onDeductPoints }: CheckoutProps) {
  const { isClubEnabled } = useClubHollywood();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [name, setName] = useState(loyaltyProfile?.name || '');
  const [phone, setPhone] = useState(loyaltyProfile?.phone || '');
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(preSelectedStore || null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('moto');
  const [storeDistances, setStoreDistances] = useState<Record<string, number>>({});
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  
  // Fiscal & Payment Fields (Saint ERP Integration)
  const [docType, setDocType] = useState<'V' | 'E' | 'J' | 'G'>('V');
  const [docNumber, setDocNumber] = useState('');
  const [isFinalConsumer, setIsFinalConsumer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'efectivo_usd' | 'zelle' | 'punto'>('pago_movil');
  
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<number>(loyaltyProfile?.points || 0);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const pointsToEarn = useMemo(() => (isClubEnabled ? calculateCartAccumulationPoints(cart) : 0), [cart, isClubEnabled]);

  useEffect(() => {
    if (isClubEnabled && loyaltyProfile) {
      if (!name && loyaltyProfile.name) setName(loyaltyProfile.name);
      if (!phone && loyaltyProfile.phone) setPhone(loyaltyProfile.phone);
      setUserPoints(loyaltyProfile.points);
    }
  }, [loyaltyProfile, isClubEnabled]);

  useEffect(() => {
    if (!isClubEnabled) {
      setUser(null);
      setUserPoints(0);
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!name) setName(currentUser.displayName || '');
        try {
          const docRef = doc(db, 'customers', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserPoints(docSnap.data().points || 0);
          } else if (loyaltyProfile) {
            setUserPoints(loyaltyProfile.points);
          } else {
            setUserPoints(0);
          }
        } catch (error) {
          console.error("Error fetching points:", error);
        }
      } else if (loyaltyProfile) {
        setUserPoints(loyaltyProfile.points);
      } else {
        setUserPoints(0);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [name, loyaltyProfile, isClubEnabled]);

  const handleSignIn = async () => {
    if (!isClubEnabled || isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup cancelled by user.");
      } else {
        console.error("Error signing in:", error);
        setAuthError("No se pudo iniciar sesión. Por favor intenta de nuevo.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

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
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !addressInputRef.current || !isOpen || success) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
      componentRestrictions: { country: 've' } // Restrict to Venezuela
    };

    const autocompleteInstance = new placesLib.Autocomplete(addressInputRef.current, options);
    setAutocomplete(autocompleteInstance);

    const listener = autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      
      setLocation(newLocation);
      setAddress(place.formatted_address || place.name || '');
      setIsAddressConfirmed(false);
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [placesLib, mode, isOpen, success]);

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
    if (!location || mode !== 'delivery' || !window.google) return;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [location],
      destinations: availableStores.map(s => ({ lat: s.lat, lng: s.lng })),
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK && response) {
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
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        handleLocationUpdate(newLocation);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        alert('No pudimos obtener tu ubicación. Por favor, intenta de nuevo.');
      }
    );
  };

  const handleLocationUpdate = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
    setIsAddressConfirmed(false);
    setLoading(true);
    
    if (!window.google) {
      setAddress(`Ubicación seleccionada (${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)})`);
      setLoading(false);
      return;
    }

    // Reverse geocoding to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: newLocation }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress(`Ubicación seleccionada (${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)})`);
      }
      setLoading(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const effectiveDocId = isFinalConsumer
      ? 'V-00000000 (Consumidor Final)'
      : (docNumber.trim() ? `${docType}-${docNumber.trim()}` : 'V-00000000 (Consumidor Final)');

    const paymentLabels: Record<string, string> = {
      pago_movil: 'Pago Móvil (Bs)',
      efectivo_usd: 'Efectivo Divisas ($)',
      zelle: 'Zelle (USD)',
      punto: 'Punto de Venta'
    };

    const messageText = `¡Hola, quiero realizar un pedido de pelicula! 🎬\n\n` +
      `*DATOS DEL CLIENTE*\n` +
      `👤 *Nombre:* ${name}\n` +
      `🆔 *Cédula/RIF:* ${effectiveDocId}\n` +
      `📞 *Teléfono:* ${phone}\n` +
      `💳 *Pago acordado:* ${paymentLabels[paymentMethod] || 'Pago Móvil'} (Confirmar por este chat)\n` +
      `📍 *Ubicación:* ${mode === 'delivery' ? `https://www.google.com/maps/search/?api=1&query=${location?.lat},${location?.lng}` : 'Retiro en Tienda'}\n` +
      (mode === 'delivery' ? `🏠 *Dirección:* ${address}\n` : '') +
      `🏪 *Sede:* ${selectedStore?.name} (Cod: ${selectedStore?.storeCode || '00000'})\n` +
      (mode === 'delivery' && isMaracaiboStore ? `🛵 *Vehículo:* ${vehicleType.toUpperCase()}\n` : '') +
      `\n*DETALLE DEL PEDIDO:*\n` +
      cart.map(item => {
        let basePrice = item.price;
        if (item.customization && item.customization.extraToppings) {
          const extrasTotal = item.customization.extraToppings.reduce((sum, t) => sum + t.price, 0);
          basePrice = item.price - extrasTotal;
        }
        let itemStr = `✅ *${item.quantity}x ${item.name}* ($${basePrice.toFixed(2)} c/u)`;
        if (item.customization) {
          if (item.customization.flavor) itemStr += `\n   _Sabor: ${item.customization.flavor}_`;
          if (item.customization.team) itemStr += `\n   _Team: ${item.customization.team}_`;
          if (item.customization.premiumTopping) itemStr += `\n   _Topping Premium: ${item.customization.premiumTopping}_`;
          if (item.customization.magicLayer) itemStr += `\n   _Capa Mágica: ${item.customization.magicLayer}_`;
          if (item.customization.toppings && item.customization.toppings.length > 0) {
            const groupedToppings = item.customization.toppings.reduce((acc, curr) => {
              acc[curr] = (acc[curr] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const toppingsStr = Object.entries(groupedToppings).map(([name, count]) => `${name} (${count * 20}g)`).join(', ');
            itemStr += `\n   _Toppings: ${toppingsStr}_`;
          }
          if (item.customization.extraToppings && item.customization.extraToppings.length > 0) {
            const extras = item.customization.extraToppings.map(t => {
              const flavorStr = t.flavor ? ` (${t.flavor})` : '';
              return `${t.name}${flavorStr} [+$${t.price.toFixed(2)}]`;
            }).join(', ');
            itemStr += `\n   _Extras: ${extras}_`;
          }
        }
        if (item.isReward) {
          itemStr += `\n   🎁 _[Recompensa Club Hollywood: Gratis (-${item.pointsCost || 0} pts)]_`;
        }
        itemStr += `\n   *Subtotal:* ${item.isReward ? '$0.00' : `$${(item.price * item.quantity).toFixed(2)}`}`;
        return itemStr;
      }).join('\n\n') +
      `\n\n*RESUMEN DE PAGO*\n` +
      `💰 *Subtotal Productos:* $${total.toFixed(2)}\n` +
      (deliveryFee > 0 ? `🚚 *Costo Delivery:* $${deliveryFee.toFixed(2)}\n` : '') +
      `⭐ *TOTAL A PAGAR:* $${(total + deliveryFee).toFixed(2)}\n\n` +
      (isClubEnabled
        ? `*CLUB RECOMPENSAS HOLLYWOOD:*\n` +
          `✨ *Puntos sumados:* +${pointsToEarn} pts\n` +
          (loyaltyProfile?.pinCode ? `🆔 *Código de Socio:* ${loyaltyProfile.pinCode}\n` : '') +
          `\n`
        : '') +
      `_Pedido realizado desde la App Hollywood_`;

    const url = `https://wa.me/${selectedStore?.phone || '584120000000'}?text=${encodeURIComponent(messageText)}`;
    setWhatsappUrl(url);

    if (isClubEnabled) {
      // Deduct reward points if any
      const rewardPointsSpent = cart.reduce((sum, item) => sum + (item.isReward ? (item.pointsCost || 0) : 0), 0);
      if (rewardPointsSpent > 0 && onDeductPoints) {
        await onDeductPoints(rewardPointsSpent);
      }
      // Add points earned from this purchase
      if (pointsToEarn > 0 && onAddPoints) {
        await onAddPoints(pointsToEarn);
      }
      
      if (user) {
        try {
          const docRef = doc(db, 'customers', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const currentPts = docSnap.data().points || 0;
            await updateDoc(docRef, {
              points: Math.max(0, currentPts + pointsToEarn - rewardPointsSpent),
              updatedAt: new Date().toISOString()
            });
          } else {
            await setDoc(docRef, {
              name: user.displayName || name,
              email: user.email || '',
              phone: phone || '',
              points: Math.max(0, pointsToEarn - rewardPointsSpent),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error updating points in Firestore:", error);
        }
      }
    }

    onSubmit({
      docId: isFinalConsumer ? 'V-00000000' : (docNumber.trim() ? `${docType}-${docNumber.trim()}` : 'V-00000000'),
      name,
      phone,
      paymentMethod,
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
    
    // Attempt to open WhatsApp automatically
    // Note: This might be blocked by some browsers due to the async nature
    try {
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to open WhatsApp automatically:', err);
    }

    // We don't close automatically anymore to let the user click the manual button if needed
    // But we can keep a longer timeout if we want to clean up
    /*
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 10000);
    */
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
            className="relative w-full max-w-2xl bg-holly-cream border border-holly-orange/10 shadow-[0_0_100px_rgba(0,0,0,0.2)] rounded-[30px] sm:rounded-[40px] my-2 sm:my-12 overflow-visible"
          >
            {/* Decorative Top Bar */}
            <div className="h-1.5 sm:h-2 bg-holly-orange w-full rounded-t-[30px] sm:rounded-t-[40px]" />

            {success ? (
              <div className="p-6 sm:p-16 text-center space-y-6 sm:space-y-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-24 h-24 sm:w-40 sm:h-40 bg-holly-orange text-holly-white rounded-full flex items-center justify-center mx-auto shadow-[0_15px_30px_rgba(241,183,11,0.4)]"
                >
                  <CheckCircle2 className="w-12 h-12 sm:w-20 sm:h-20" />
                </motion.div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-3xl sm:text-6xl font-display font-bold uppercase text-holly-brown tracking-normal">¡PEDIDO LISTO!</h2>
                  <p className="text-base sm:text-xl text-holly-brown/60 font-sans font-medium uppercase tracking-[0.2em] leading-relaxed">
                    Si no se abrió WhatsApp automáticamente, <br />
                    haz clic en el botón de abajo:
                  </p>
                </div>
                
                <div className="pt-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-4 px-8 py-4 bg-[#25D366] text-white rounded-2xl font-display font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.436h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    CONTINUAR A WHATSAPP
                  </a>
                </div>
                
                <button 
                  onClick={onClose}
                  className="text-holly-brown/40 hover:text-holly-orange font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  VOLVER A LA TIENDA
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-16">
                <div className="flex justify-between items-start mb-6 sm:mb-12">
                  <div className="space-y-1 sm:space-y-2">
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.5em] text-holly-orange">Paso Final</span>
                    <h2 className="text-3xl sm:text-6xl font-display font-bold uppercase text-holly-brown tracking-normal">CHECKOUT</h2>
                  </div>
                  <button onClick={onClose} className="p-1 sm:p-2 text-holly-brown/40 hover:text-holly-orange transition-all hover:rotate-90">
                    <X className="w-6 h-6 sm:w-12 sm:h-12" />
                  </button>
                </div>

                {isClubEnabled && !authLoading && (
                  <div className="mb-8 sm:mb-10 p-4 sm:p-6 rounded-2xl border-2 border-holly-orange/20 bg-holly-orange/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-holly-orange text-white rounded-full flex items-center justify-center shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        {user ? (
                          <>
                            <h3 className="text-sm sm:text-base font-display font-bold uppercase text-holly-brown">
                              Club Hollywood
                            </h3>
                            <p className="text-[10px] sm:text-xs font-medium text-holly-brown/60 uppercase tracking-widest mt-1">
                              Tienes <span className="font-bold text-holly-orange">{userPoints}</span> puntos.
                              Sumarás <span className="font-bold text-holly-orange">+{pointsToEarn}</span> pts en este pedido.
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-sm sm:text-base font-display font-bold uppercase text-holly-brown">
                              Únete al Club Hollywood
                            </h3>
                            <p className="text-[10px] sm:text-xs font-medium text-holly-brown/60 uppercase tracking-widest mt-1">
                              Acumula <span className="font-bold text-holly-orange">{pointsToEarn} puntos</span> con esta compra!
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {!user && (
                      <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2">
                        <button
                          type="button"
                          onClick={handleSignIn}
                          disabled={isSigningIn}
                          className="w-full sm:w-auto px-6 py-3 bg-holly-brown text-white font-display font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-holly-orange transition-colors whitespace-nowrap shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSigningIn && <Loader2 className="w-4 h-4 animate-spin" />}
                          Iniciar Sesión
                        </button>
                        {authError && <span className="text-red-500 text-[10px] sm:text-xs text-center font-medium">{authError}</span>}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="group">
                      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40 mb-2 sm:mb-4 group-focus-within:text-holly-orange transition-colors">Nombre del Cliente</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-0 py-2 sm:py-4 bg-transparent border-b-2 border-holly-orange/10 text-holly-brown focus:outline-none focus:border-holly-orange transition-all text-xl sm:text-2xl font-display font-bold uppercase tracking-widest placeholder:text-holly-brown/10"
                        placeholder="TU NOMBRE AQUÍ"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40 mb-2 sm:mb-4 group-focus-within:text-holly-orange transition-colors">Teléfono de Contacto</label>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-0 py-2 sm:py-4 bg-transparent border-b-2 border-holly-orange/10 text-holly-brown focus:outline-none focus:border-holly-orange transition-all text-xl sm:text-2xl font-display font-bold uppercase tracking-widest placeholder:text-holly-brown/10"
                        placeholder="+58 000 0000000"
                      />
                    </div>

                    {/* Cédula / RIF (Saint ERP Facturación) */}
                    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-holly-orange/5 border border-holly-orange/15">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-holly-brown/80">
                          Cédula / RIF <span className="text-holly-orange font-normal">(Facturación Saint)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFinalConsumer(!isFinalConsumer);
                            if (!isFinalConsumer) setDocNumber('');
                          }}
                          className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all border ${
                            isFinalConsumer
                              ? 'bg-holly-orange text-white border-holly-orange shadow-sm'
                              : 'bg-white text-holly-brown/60 border-holly-brown/20 hover:border-holly-orange'
                          }`}
                        >
                          {isFinalConsumer ? '✓ Consumidor Final' : '¿Consumidor Final?'}
                        </button>
                      </div>

                      {!isFinalConsumer ? (
                        <div className="flex gap-2">
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value as any)}
                            className="bg-white border-2 border-holly-orange/20 rounded-xl px-3 py-2 text-sm sm:text-base font-display font-bold text-holly-brown focus:outline-none focus:border-holly-orange"
                          >
                            <option value="V">V-</option>
                            <option value="E">E-</option>
                            <option value="J">J-</option>
                            <option value="G">G-</option>
                          </select>
                          <input
                            type="text"
                            value={docNumber}
                            onChange={(e) => setDocNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Ej: 18456789"
                            className="flex-1 bg-white border-2 border-holly-orange/20 rounded-xl px-4 py-2 text-base font-display font-bold text-holly-brown focus:outline-none focus:border-holly-orange placeholder:text-holly-brown/20"
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-holly-brown/70 font-sans italic">
                          Se emitirá a nombre de <strong className="font-bold text-holly-orange">Consumidor Final (V-00000000)</strong> en el sistema Saint.
                        </p>
                      )}
                    </div>

                    {/* Método de Pago Previsto (Cierre en WhatsApp) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40">
                          Método de Pago Previsto
                        </label>
                        <span className="text-[9px] font-sans font-medium text-holly-orange bg-holly-orange/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Se cancela por WhatsApp
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {[
                          { id: 'pago_movil', label: '📱 Pago Móvil (Bs)', desc: 'Banesco / Venezuela / etc.' },
                          { id: 'efectivo_usd', label: '💵 Efectivo ($)', desc: 'En tienda o delivery' },
                          { id: 'zelle', label: '🇺🇸 Zelle (USD)', desc: 'Cuenta de la empresa' },
                          { id: 'punto', label: '💳 Punto de Venta', desc: 'En sede física' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all ${
                              paymentMethod === m.id
                                ? 'border-holly-orange bg-holly-orange/10 text-holly-brown shadow-sm'
                                : 'border-holly-brown/10 bg-white/50 text-holly-brown/70 hover:border-holly-orange/30'
                            }`}
                          >
                            <span className="block font-display font-bold text-xs sm:text-sm">{m.label}</span>
                            <span className="block text-[9px] sm:text-[10px] text-holly-brown/50 font-sans mt-0.5">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {mode === 'delivery' && isMaracaiboStore && (
                      <div className="space-y-4 sm:space-y-6">
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40">
                          Tipo de Vehículo para Delivery
                        </label>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setVehicleType('moto')}
                            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center gap-2 sm:gap-3 transition-all ${
                              vehicleType === 'moto'
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-orange/10 text-holly-brown hover:border-holly-orange/40'
                            }`}
                          >
                            <Bike className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-base font-display font-bold uppercase tracking-widest">Moto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVehicleType('carro')}
                            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center gap-2 sm:gap-3 transition-all ${
                              vehicleType === 'carro'
                                ? 'border-holly-orange bg-holly-orange/5 text-holly-orange'
                                : 'border-holly-orange/10 text-holly-brown hover:border-holly-orange/40'
                            }`}
                          >
                            <Car className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-base font-display font-bold uppercase tracking-widest">Carro</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-6 sm:space-y-8">
                      <div className="group">
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40 mb-2 sm:mb-4 group-focus-within:text-holly-orange transition-colors">
                          {mode === 'delivery' ? 'Dirección de Entrega' : 'Sede para Retiro'}
                        </label>
                        {mode === 'delivery' && (
                          <div className="relative group">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-holly-brown/20 group-focus-within:text-holly-orange transition-colors">
                              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <input
                              ref={addressInputRef}
                              required
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full pl-8 sm:pl-10 pr-0 py-2 sm:py-4 bg-transparent border-b-2 border-holly-orange/10 text-holly-brown focus:outline-none focus:border-holly-orange transition-all text-lg sm:text-2xl font-display font-bold uppercase tracking-widest placeholder:text-holly-brown/10 mb-2 sm:mb-4"
                              placeholder="ESCRIBE TU DIRECCIÓN AQUÍ..."
                            />
                            <p className="text-[10px] sm:text-xs text-holly-brown/60 font-medium uppercase tracking-wider mb-4 sm:mb-8">
                              Quieres enviar a otra dirección? Escríbela arriba o mueve el pin en el mapa.
                            </p>
                          </div>
                        )}

                        <div className="space-y-4 sm:space-y-6">
                          {mode === 'delivery' && (
                            <>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <button
                                  type="button"
                                  onClick={handleGetLocation}
                                  className="flex items-center gap-3 sm:gap-4 text-holly-orange hover:text-holly-brown font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs transition-all group"
                                >
                                  <div className="p-1.5 sm:p-2 border border-holly-orange group-hover:bg-holly-orange group-hover:text-holly-white transition-all rounded-lg">
                                    {loading ? (
                                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    ) : (
                                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                  </div>
                                  {location ? 'UBICACIÓN CAPTURADA' : 'USAR MI UBICACIÓN ACTUAL'}
                                </button>
                                
                                {selectedStore && (
                                  <span className="self-start sm:self-auto text-[9px] sm:text-[10px] font-bold text-holly-orange uppercase tracking-widest bg-holly-orange/10 px-2 py-1 rounded-full">
                                    Sede: {selectedStore.name}
                                  </span>
                                )}
                              </div>

                              <div className="h-[350px] sm:h-[500px]">
                                <StoreMap 
                                  userLocation={location} 
                                  selectedStore={selectedStore}
                                  onLocationChange={handleLocationUpdate}
                                  isAddressConfirmed={isAddressConfirmed}
                                />
                              </div>

                              {location && !isAddressConfirmed && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-4 sm:p-5 bg-holly-orange/10 border-2 border-holly-orange rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
                                >
                                  <p className="text-xs sm:text-sm font-bold text-holly-brown text-center sm:text-left uppercase tracking-widest leading-relaxed">
                                    Confirmas esta dirección para la entrega de tu pedido?
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setIsAddressConfirmed(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-holly-orange text-white rounded-xl font-display font-bold uppercase tracking-widest hover:bg-holly-brown transition-colors whitespace-nowrap shadow-md"
                                  >
                                    Confirmar
                                  </button>
                                </motion.div>
                              )}
                            </>
                          )}

                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-holly-brown">
                              Sede Seleccionada
                            </h4>
                            
                            {selectedStore ? (
                              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-holly-orange bg-holly-orange/5 text-left flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 rounded-xl bg-holly-orange text-white shrink-0">
                                  <StoreIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-display font-bold uppercase text-base sm:text-lg truncate">{selectedStore.name}</h4>
                                    {mode === 'delivery' && storeDistances[selectedStore.id] !== undefined && (
                                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-holly-orange shrink-0">
                                        {storeDistances[selectedStore.id].toFixed(1)} km
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] sm:text-xs text-[#85441b] font-medium truncate">{selectedStore.address}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                                No se ha seleccionado ninguna sede. Por favor, regresa al inicio.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 border-t border-holly-orange/10">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-holly-brown/40">
                      Resumen del Pedido
                    </label>
                    <div className="space-y-3 sm:space-y-4 max-h-[200px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-holly-orange/5 border border-holly-orange/10">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-holly-orange">{item.quantity}x</span>
                              <h4 className="font-display font-bold uppercase text-holly-brown text-sm sm:text-base truncate">{item.name}</h4>
                            </div>
                            {item.customization && (
                              <div className="mt-1 space-y-0.5">
                                {item.customization.flavor && (
                                  <p className="text-[9px] sm:text-[10px] text-holly-brown/60 font-medium uppercase tracking-wider">
                                    Sabor: {item.customization.flavor}
                                  </p>
                                )}
                                {item.customization.team && (
                                  <p className="text-[9px] sm:text-[10px] text-[#ec277b] font-medium uppercase tracking-wider">
                                    Team: {item.customization.team}
                                  </p>
                                )}
                                {item.customization.premiumTopping && (
                                  <p className="text-[9px] sm:text-[10px] text-holly-brown font-medium uppercase tracking-wider">
                                    Topping Premium: {item.customization.premiumTopping}
                                  </p>
                                )}
                                {item.customization.magicLayer && (
                                  <p className="text-[9px] sm:text-[10px] text-holly-brown font-medium uppercase tracking-wider">
                                    Capa Mágica: {item.customization.magicLayer}
                                  </p>
                                )}
                                {item.customization.toppings && item.customization.toppings.length > 0 && (
                                  <p className="text-[9px] sm:text-[10px] text-holly-brown/60 font-medium uppercase tracking-wider line-clamp-1">
                                    Toppings: {Object.entries(item.customization.toppings.reduce((acc, curr) => {
                                      acc[curr] = (acc[curr] || 0) + 1;
                                      return acc;
                                    }, {} as Record<string, number>)).map(([name, count]) => `${name} (${count * 20}g)`).join(', ')}
                                  </p>
                                )}
                                {item.customization.extraToppings && item.customization.extraToppings.length > 0 && (
                                  <p className="text-[9px] sm:text-[10px] text-holly-brown/60 font-medium uppercase tracking-wider line-clamp-1">
                                    Extras: {item.customization.extraToppings.map(t => t.flavor ? `${t.name} (${t.flavor})` : t.name).join(', ')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="font-display font-bold text-holly-brown text-sm sm:text-base shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 sm:pt-12 border-t border-holly-orange/10">
                    {mode === 'delivery' && deliveryFee > 0 && (
                      <div className="flex justify-between items-center mb-3 sm:mb-4 text-holly-brown/60">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest">Costo de Envío</span>
                        </div>
                        <span className="text-lg sm:text-xl font-display font-bold">${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end mb-8 sm:mb-12">
                      <span className="text-base sm:text-xl font-sans font-bold uppercase text-holly-brown/40 tracking-[0.3em]">Total a Pagar</span>
                      <span className="text-5xl sm:text-7xl font-display font-bold text-holly-brown">${(total + deliveryFee).toFixed(2)}</span>
                    </div>
                    <button
                      disabled={loading || !selectedStore || (mode === 'delivery' && (!location || !isAddressConfirmed)) || availableStores.length === 0}
                      type="submit"
                      className="w-full py-4 sm:py-6 bg-holly-brown text-white font-sans font-semibold text-[12px] sm:text-[14px] uppercase tracking-[2px] hover:bg-holly-orange disabled:bg-holly-brown/20 disabled:text-holly-brown/40 disabled:cursor-not-allowed transition-all duration-500 shadow-xl flex items-center justify-center gap-4 sm:gap-6 rounded-xl sm:rounded-[15px]"
                    >
                      {loading && <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />}
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
