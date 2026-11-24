import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CategorySelector } from './components/CategorySelector';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { SelectionScreen } from './components/SelectionScreen';
import { ProductCustomizer } from './components/ProductCustomizer';
import { useCart } from './hooks/useCart';
import { PRODUCTS, HOLLYWOOD_STORES } from './constants';
import { OrderMode, Category, Product, StoreLocation } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HollywoodRewardsModal } from './components/HollywoodRewardsModal';
import { useLoyalty } from './hooks/useLoyalty';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorUtils';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Home, IceCream, IceCreamBowl, ShoppingCart, Award } from 'lucide-react';
import { logoBase64 } from './logoBase64';
import { RewardItem } from './types';
import { formatItemsForSaint } from './utils/saintUtils';
import { ClubHollywoodProvider, ClubHollywoodEditorToggle, useClubHollywood } from './context/ClubHollywoodContext';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || 'AIzaSyDivyYuJWC0vqWU3wfep26trd9UNceNMpk';

if (!API_KEY) {
  console.warn('GOOGLE_MAPS_PLATFORM_KEY is missing. Please add it to the Secrets panel in AI Studio.');
}

function AppContent() {
  const { isClubEnabled } = useClubHollywood();
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('metodo');
      if (m === 'pickup') return 'in-store';
      if (m === 'delivery') return 'delivery';
    }
    return null;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const { 
    profile, 
    saveProfile, 
    addPoints, 
    deductPoints, 
    signInWithGoogle, 
    signOut, 
    isSigningIn 
  } = useLoyalty(isClubEnabled);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total } = useCart();

  useEffect(() => {
    if (!isClubEnabled) {
      if (isRewardsOpen) setIsRewardsOpen(false);
      cart.filter(item => item.isReward).forEach(item => removeFromCart(item.id, item.customization));
    }
  }, [isClubEnabled, isRewardsOpen, cart, removeFromCart]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRedeemReward = (reward: RewardItem) => {
    addToCart({
      id: `reward-${reward.id}-${Date.now()}`,
      name: `${reward.name} (Club Hollywood)`,
      description: reward.description,
      price: 0,
      category: reward.category === 'soft' ? 'soft' : 'gelato',
      image: reward.image,
      deliveryAvailable: true,
      isReward: true,
      pointsCost: reward.pointsRequired,
      rewardId: reward.id
    });
    setNotification(`¡Recompensa "${reward.name}" añadida gratis!`);
    setIsRewardsOpen(false);
    setIsCartOpen(true);
  };

  const filteredProducts = useMemo(() => {
    if (!selectedCategory || !selectedStore) return [];
    
    let products = PRODUCTS.filter(p => p.category === selectedCategory);

    // Filter by order mode
    if (orderMode === 'in-store') {
      products = products.filter(p => !p.onlyDelivery);
    } else if (orderMode === 'delivery') {
      products = products.filter(p => !p.onlyInStore);
    }

    if (selectedCategory === 'soft') {
      return products;
    } else {
      // Gelato products
      // If store is soft, only show packaged gelatos
      if (selectedStore.type === 'soft') {
        return products.filter(p => p.isPackaged);
      }
      return products;
    }
  }, [selectedCategory, selectedStore, orderMode]);

  const handleCheckoutSubmit = async (data: any) => {
    const path = 'orders';
    let firestoreId: string | undefined;
    const deliveryFee = data.deliveryFee || 0;
    const totalWithDelivery = total + deliveryFee;
    const exchangeRate = 50.0;
    const totalBs = Number((totalWithDelivery * exchangeRate).toFixed(2));
    const saintItems = formatItemsForSaint(cart, deliveryFee);

    try {
      const docRef = await addDoc(collection(db, path), {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization || null
        })),
        total: totalWithDelivery,
        mode: orderMode,
        customerDocId: data.docId || 'V-00000000',
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: data.address || '',
        location: data.location || null,
        selectedStore: data.selectedStore?.name || '',
        storeCode: data.selectedStore?.storeCode || '00000',
        paymentMethod: data.paymentMethod || 'pago_movil',
        vehicleType: data.vehicleType || null,
        deliveryFee,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      firestoreId = docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }

    // Sync with internal API for el sistema administrativo (Saint Enterprise ERP v2.0 Schema)
    try {
      await fetch('/api/sistema/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: firestoreId,
          store: {
            storeCode: data.selectedStore?.storeCode || '00000',
            storeName: data.selectedStore?.name || 'Hollywood Sede 72 (5 de Julio)',
            warehouseCode: data.selectedStore?.warehouseCode || '01B',
          },
          mode: orderMode === 'delivery' ? 'delivery' : 'pickup',
          vehicleType: data.vehicleType || 'moto',
          customer: {
            docId: data.docId || 'V-00000000',
            name: data.name,
            phone: data.phone,
            address: data.address || '',
            location: data.location || null,
          },
          payment: {
            method: data.paymentMethod || 'pago_movil',
            amountUsd: totalWithDelivery,
            amountBs: totalBs,
            exchangeRate,
            notes: 'Pago acordado y validado por el operador en el chat de WhatsApp de la sede',
          },
          items: saintItems,
          financials: {
            subtotalUsd: total,
            deliveryFeeUsd: deliveryFee,
            taxUsd: 0.0,
            totalUsd: totalWithDelivery,
            totalBs,
            exchangeRate,
          },
          subtotal: total,
          deliveryFee,
          total: totalWithDelivery,
          status: 'pending',
          sistemaSync: {
            syncedAt: null,
            saintOrderNumber: null,
            invoiceNumber: null,
            terminalId: null,
          },
        }),
      });
    } catch (apiError) {
      console.warn('Note: Could not sync order to internal server API:', apiError);
    }

    setTimeout(() => {
      clearCart();
    }, 2000);
  };

  return (
    <ErrorBoundary>
      <APIProvider 
        apiKey={API_KEY} 
        version="weekly" 
        libraries={['places', 'geometry', 'routes']}
        authReferrerPolicy="origin"
      >
        <div className="min-h-screen bg-holly-cream font-sans selection:bg-holly-orange selection:text-white">
          <AnimatePresence mode="wait">
            {!selectedStore || !selectedCategory ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen"
              >
                <SelectionScreen 
                  orderMode={orderMode}
                  onOrderModeSelect={(mode) => setOrderMode(mode)}
                  selectedStore={selectedStore}
                  onStoreSelect={(store) => {
                    setSelectedStore(store);
                    clearCart();
                  }}
                  onCategorySelect={(cat) => setSelectedCategory(cat)} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen"
              >
                <Navbar 
                  cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
                  onCartClick={() => setIsCartOpen(true)} 
                  orderMode={orderMode}
                  onChangeMode={() => {
                    setOrderMode(null);
                    setSelectedStore(null);
                    setSelectedCategory(null);
                    clearCart();
                  }}
                  points={isClubEnabled ? profile?.points : undefined}
                  onRewardsClick={isClubEnabled ? () => setIsRewardsOpen(true) : undefined}
                />
                
                <main className="pt-24" style={{ backgroundColor: '#ffffff' }}>
                  <section id="menu-section" className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="mb-12">
                        <div className="grid grid-cols-2 gap-y-2 max-w-4xl mx-auto px-4">
                          {/* Category Title */}
                          <div className="flex flex-col items-start">
                            <span className="text-xl sm:text-2xl font-display font-bold text-holly-brown uppercase tracking-tight">
                              {selectedCategory}
                            </span>
                          </div>

                          {/* Store Title */}
                          <div className="flex flex-col items-end text-right">
                            <span className="text-xl sm:text-2xl font-display font-bold text-holly-brown uppercase tracking-tight">
                              SEDE {selectedStore.name.replace(/Hollywood\s*/i, '')}
                            </span>
                          </div>

                          {/* Category Button */}
                          <div className="flex flex-col items-start">
                            <button 
                              onClick={() => setSelectedCategory(null)}
                              className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-holly-orange hover:bg-holly-orange hover:text-white border border-holly-orange px-4 py-1.5 rounded-full transition-all flex items-center gap-1"
                            >
                              Cambiar categoría
                            </button>
                          </div>

                          {/* Store Button */}
                          <div className="flex flex-col items-end text-right">
                            <button 
                              onClick={() => {
                                setSelectedStore(null);
                                clearCart();
                              }}
                              className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-holly-orange hover:bg-holly-orange hover:text-white border border-holly-orange px-4 py-1.5 rounded-full transition-all flex items-center gap-1"
                            >
                              Cambiar sede
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-12 text-center">
                          <h2 className="text-5xl sm:text-7xl font-display font-bold text-holly-brown mb-8 uppercase tracking-normal">
                            {selectedCategory === 'gelato' ? 'GELATO PREMIUM' : 'SOFT SERVE'}
                          </h2>
                          <CategorySelector 
                            selected={selectedCategory} 
                            onSelect={setSelectedCategory} 
                            selectedStore={selectedStore}
                          />
                        </div>
                      </div>

                      <ProductGrid 
                        products={filteredProducts} 
                        orderMode={orderMode}
                        onAddToCart={(p) => {
                          if (p.isCustomizable) {
                            setCustomizingProduct(p);
                          } else {
                            addToCart(p);
                            setIsCartOpen(true);
                          }
                        }} 
                      />
                    </div>
                  </section>
                </main>

                {customizingProduct && (
                  <ProductCustomizer
                    product={customizingProduct}
                    isOpen={!!customizingProduct}
                    onClose={() => setCustomizingProduct(null)}
                    onConfirm={(customizedItem) => {
                      addToCart(customizedItem);
                      setIsCartOpen(true);
                    }}
                  />
                )}

                {/* Notification Toast */}
                <AnimatePresence>
                  {notification && (
                    <motion.div
                      initial={{ opacity: 0, y: 50, x: '-50%' }}
                      animate={{ opacity: 1, y: 0, x: '-50%' }}
                      exit={{ opacity: 0, y: 50, x: '-50%' }}
                      className="fixed bottom-24 left-1/2 z-[100] bg-holly-brown text-white px-6 py-3 rounded-full shadow-2xl border border-holly-orange/30 flex items-center gap-3 min-w-[280px] justify-center"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-center">{notification}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <footer className="bg-[#f6b40c] text-holly-brown py-12 pb-28 md:pb-12 border-t border-holly-orange/10 flex flex-col items-center justify-center text-center px-4">
                  <img 
                    src={logoBase64} 
                    alt="Heladería Hollywood" 
                    className="h-20 w-auto object-contain mb-3 drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="font-sans font-bold text-[17px] tracking-widest mb-1 text-[#5a2f0f]">
                    Heladería Hollywood
                  </h3>
                  <p className="font-sans font-normal text-[15px] tracking-wider text-[#5a2f0f]">
                    Copyright 2026© Creado y diseñado por Kroma Design
                  </p>
                </footer>

                <Cart
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  items={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onCheckout={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  total={total}
                  userPoints={isClubEnabled ? profile?.points : undefined}
                  onOpenRewards={isClubEnabled ? () => {
                    setIsCartOpen(false);
                    setIsRewardsOpen(true);
                  } : undefined}
                />

                {orderMode && (
                  <Checkout
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    mode={orderMode}
                    total={total}
                    cart={cart}
                    preSelectedStore={selectedStore}
                    onSubmit={handleCheckoutSubmit}
                    loyaltyProfile={isClubEnabled ? profile : null}
                    onAddPoints={isClubEnabled ? addPoints : undefined}
                    onDeductPoints={isClubEnabled ? deductPoints : undefined}
                  />
                )}

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-holly-brown/5 z-50 px-6 py-4 flex justify-between items-center shadow-[0_-10px_30px_rgba(139,69,19,0.05)]">
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedStore(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center gap-1 text-holly-brown/60 hover:text-holly-orange transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedStore?.type === 'gelateria') {
                        setNotification('Soft no disponible en esta sede');
                        return;
                      }
                      setSelectedCategory('soft');
                      const el = document.getElementById('menu-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center gap-1 transition-colors ${selectedCategory === 'soft' ? 'text-holly-orange' : 'text-holly-brown/60'} ${selectedStore?.type === 'gelateria' ? 'opacity-40' : ''}`}
                  >
                    <IceCream className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Soft</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedCategory('gelato');
                      const el = document.getElementById('menu-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center gap-1 transition-colors ${selectedCategory === 'gelato' ? 'text-holly-orange' : 'text-holly-brown/60'}`}
                  >
                    <IceCreamBowl className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Gelato</span>
                  </button>
                  {isClubEnabled && (
                    <button 
                      onClick={() => setIsRewardsOpen(true)}
                      className="flex flex-col items-center gap-1 text-holly-brown/60 hover:text-holly-orange transition-colors relative"
                    >
                      <Award className="w-5 h-5 text-holly-orange" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        {profile ? `${profile.points} pts` : 'Club'}
                      </span>
                    </button>
                  )}
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="flex flex-col items-center gap-1 text-holly-brown/60 hover:text-holly-orange transition-colors relative"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cart</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-holly-orange text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                </div>

                {isClubEnabled && (
                  <HollywoodRewardsModal
                    isOpen={isRewardsOpen}
                    onClose={() => setIsRewardsOpen(false)}
                    profile={profile}
                    onSaveProfile={saveProfile}
                    onSignInWithGoogle={signInWithGoogle}
                    onSignOut={signOut}
                    onRedeemReward={handleRedeemReward}
                    isSigningIn={isSigningIn}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <ClubHollywoodEditorToggle />
        </div>
      </APIProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ClubHollywoodProvider>
      <AppContent />
    </ClubHollywoodProvider>
  );
}
