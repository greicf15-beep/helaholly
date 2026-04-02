import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
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

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export default function App() {
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  
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
    
    if (selectedCategory === 'soft') {
      // Strictly soft products
      return PRODUCTS.filter(p => p.category === 'soft');
    } else {
      // Strictly gelato products
      // If store is soft, only show packaged gelatos
      if (selectedStore.type === 'soft') {
        return PRODUCTS.filter(p => p.category === 'gelato' && p.isPackaged);
      }
      // If store is gelateria, show all gelatos
      return PRODUCTS.filter(p => p.category === 'gelato');
    }
  }, [selectedCategory, selectedStore]);

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
      <APIProvider apiKey={API_KEY} version="weekly">
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
                  onStoreSelect={(store) => setSelectedStore(store)}
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
                />
                
                <main className="pt-24">
                  <Hero />
                  
                  {/* Wave Separator */}
                  <div className="relative w-full h-24 -mt-12 z-10 overflow-hidden pointer-events-none">
                    <svg 
                      viewBox="0 0 1440 120" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="absolute bottom-0 w-full h-full preserve-3d"
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 80C1200 70 1320 50 1380 40L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                        fill="#fdfcf5"
                      />
                    </svg>
                  </div>

                  <section id="menu-section" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-16">
                        <div className="flex flex-col items-center justify-center gap-4 mb-4">
                          <span className="text-xs font-bold uppercase tracking-[0.4em] text-holly-orange">Nuestra Selección</span>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => setSelectedCategory(null)}
                              className="text-[10px] font-bold uppercase tracking-widest text-holly-brown hover:text-holly-orange border border-holly-orange/20 px-4 py-2 rounded-full transition-colors"
                            >
                              Cambiar categoría
                            </button>
                            <button 
                              onClick={() => setSelectedStore(null)}
                              className="text-[10px] font-bold uppercase tracking-widest text-holly-brown hover:text-holly-orange border border-holly-orange/20 px-4 py-2 rounded-full transition-colors"
                            >
                              Cambiar sede
                            </button>
                          </div>
                        </div>
                        <h2 className="text-6xl font-display font-bold text-holly-brown mb-8 uppercase tracking-normal">
                          {selectedCategory === 'gelato' ? 'GELATO PREMIUM' : 'SOFT SERVE'}
                        </h2>
                        <CategorySelector 
                          selected={selectedCategory} 
                          onSelect={setSelectedCategory} 
                          selectedStore={selectedStore}
                        />
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

                <footer className="bg-holly-brown text-holly-white py-24 border-t border-holly-orange/10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-holly-white/10 pb-16 mb-16">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-holly-orange flex items-center justify-center font-display text-xl rounded-lg">H</div>
                          <h3 className="text-3xl font-display font-bold uppercase tracking-normal">Heladería Hollywood</h3>
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
                    <span className="text-xl">🏠</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedCategory('soft');
                      const el = document.getElementById('menu-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center gap-1 transition-colors ${selectedCategory === 'soft' ? 'text-holly-orange' : 'text-holly-brown/60'}`}
                  >
                    <span className="text-xl">🍦</span>
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
                    <span className="text-xl">🍨</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Gelato</span>
                  </button>
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="flex flex-col items-center gap-1 text-holly-brown/60 hover:text-holly-orange transition-colors relative"
                  >
                    <span className="text-xl">🛒</span>
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
