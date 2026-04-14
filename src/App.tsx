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
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorUtils';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Home, IceCream, IceCreamBowl, ShoppingCart } from 'lucide-react';
import IMAGES_BASE64 from './assets/images.json';

const logoHolly = IMAGES_BASE64['logo_holly.png'];

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

if (!API_KEY) {
  console.warn('GOOGLE_MAPS_PLATFORM_KEY is missing. Please add it to the Secrets panel in AI Studio.');
}

export default function App() {
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('metodo');
    if (m === 'pickup') {
      setOrderMode('in-store');
    } else if (m === 'delivery') {
      setOrderMode('delivery');
    }
    // If no param, we leave it null so SelectionScreen shows the choice
  }, []);

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
    try {
      await addDoc(collection(db, path), {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization || null
        })),
        total,
        mode: orderMode,
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: data.address || '',
        location: data.location || null,
        selectedStore: data.selectedStore?.name || '',
        vehicleType: data.vehicleType || null,
        deliveryFee: data.deliveryFee || 0,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setTimeout(() => {
        clearCart();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
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
                />
                
                <main className="pt-24">
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

                <footer className="bg-holly-brown text-holly-white py-24 border-t border-holly-orange/10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-holly-white/10 pb-16 mb-16">
                      <div className="space-y-6">
                        <div className="flex items-center">
                          <img 
                            src={logoHolly} 
                            alt="Heladería Hollywood" 
                            className="h-16 w-auto object-contain brightness-0 invert"
                          />
                        </div>
                        <p className="text-holly-white/60 font-medium leading-relaxed">
                          Cremosidad y sabor premium en cada bocado. Disfruta de la experiencia Hollywood.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.5em] text-holly-orange mb-8">Sedes Holly</h4>
                        <ul className="space-y-4 text-holly-white/80 font-display text-xl uppercase tracking-widest">
                          <li>Maracaibo</li>
                          <li>Valencia</li>
                          <li>Cabimas</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.5em] text-holly-orange mb-8">Redes Sociales</h4>
                        <ul className="space-y-4 text-holly-white/80 font-display text-xl uppercase tracking-widest">
                          <li><a href="#" className="hover:text-holly-orange transition-colors">Instagram</a></li>
                          <li><a href="#" className="hover:text-holly-orange transition-colors">TikTok</a></li>
                          <li><a href="#" className="hover:text-holly-orange transition-colors">Facebook</a></li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-holly-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
                      <p>© 2026 Heladería Hollywood. Todos los derechos reservados.</p>
                      <p>Premium Ice Cream Experience</p>
                    </div>
                  </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </APIProvider>
    </ErrorBoundary>
  );
}
