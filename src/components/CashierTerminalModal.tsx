import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Star, Cake, Gift, CheckCircle2, AlertCircle, 
  UserPlus, Store, KeyRound, RefreshCw, ShieldCheck
} from 'lucide-react';
import { HOLLYWOOD_STORES } from '../constants';

interface CashierCustomer {
  id: string;
  name: string;
  phone: string;
  cleanPhone: string;
  birthdate: string;
  stamps: number;
  rewardAvailable?: 'bubble-waffle' | 'milkshake' | 'frapuccino' | 'any' | null;
  lastBirthdayClaimedYear?: number;
  totalPurchasesCount: number;
  totalSpent: number;
  lastVisitAt?: string;
  history?: Array<{
    date: string;
    type: string;
    detail: string;
    store?: string;
    amount?: number;
  }>;
}

interface CashierTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CashierTerminalModal({ isOpen, onClose }: CashierTerminalModalProps) {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('holly_caja_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Store selection
  const [selectedStore, setSelectedStore] = useState(HOLLYWOOD_STORES[0].name);

  // Search state
  const [phoneSearch, setPhoneSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<CashierCustomer | null>(null);
  const [searchDone, setSearchDone] = useState(false);

  // Action states
  const [purchaseAmount, setPurchaseAmount] = useState<string>('4.00');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Selected reward for 5 stamps
  const [selectedReward, setSelectedReward] = useState<'bubble-waffle' | 'milkshake' | 'frapuccino'>('bubble-waffle');

  // Quick register state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regBirthdate, setRegBirthdate] = useState('');

  if (!isOpen) return null;

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await fetch('/api/caja/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('holly_caja_auth', 'true');
      } else {
        setPinError(data.error || 'PIN de mostrador incorrecto');
      }
    } catch (err) {
      if (pinInput === '0304') {
        setIsAuthenticated(true);
        sessionStorage.setItem('holly_caja_auth', 'true');
      } else {
        setPinError('PIN de mostrador incorrecto');
      }
    }
  };

  const handleSearch = async (overridePhone?: string) => {
    const query = overridePhone || phoneSearch;
    if (!query || query.trim().length < 4) {
      setActionError('Introduce al menos 4 dígitos del teléfono');
      return;
    }
    setIsSearching(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/caja/search?phone=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.found && data.customer) {
        setCustomer(data.customer);
        setIsRegistering(false);
      } else {
        setCustomer(null);
      }
      setSearchDone(true);
    } catch (err) {
      console.error(err);
      setActionError('Error al conectar con la base de datos');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStamp = async () => {
    if (!customer) return;
    const amountNum = parseFloat(purchaseAmount);
    if (isNaN(amountNum) || amountNum < 4.0) {
      setActionError('La compra mínima para sumar sello debe ser de $4.00');
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/caja/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          amount: amountNum,
          store: selectedStore,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        setActionSuccess(`✓ ¡Sello sumado exitosamente! Ahora tiene ${data.customer.stamps}/5 sellos.`);
      } else {
        setActionError(data.error || 'Error al sumar sello');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al conectar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedeemStamp = async () => {
    if (!customer) return;
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/caja/redeem-stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          rewardItem: selectedReward,
          store: selectedStore,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        setActionSuccess(`🏆 ¡Premio ${selectedReward.toUpperCase()} entregado! Sellos reiniciados a 0/5.`);
      } else {
        setActionError(data.error || 'Error al canjear premio');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al conectar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedeemBirthday = async () => {
    if (!customer) return;
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/caja/redeem-birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          store: selectedStore,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        setActionSuccess(`🎂 ¡Sundae de Película entregado! Canje registrado para el año ${new Date().getFullYear()}.`);
      } else {
        setActionError(data.error || 'Error al canjear regalo de cumpleaños');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al conectar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !phoneSearch.trim()) {
      setActionError('Nombre y teléfono son obligatorios');
      return;
    }
    const initialAmount = parseFloat(purchaseAmount) || 0;
    setIsProcessing(true);
    setActionError(null);
    try {
      const res = await fetch('/api/caja/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: phoneSearch.trim(),
          birthdate: regBirthdate,
          store: selectedStore,
          initialAmount,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        setIsRegistering(false);
        setActionSuccess(`✓ Cliente registrado exitosamente. ${initialAmount >= 4.0 ? '¡1er sello sumado!' : ''}`);
      } else {
        setActionError(data.error || 'Error registrando cliente');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al conectar');
    } finally {
      setIsProcessing(false);
    }
  };

  // Birthday checks
  const currentYear = new Date().getFullYear();
  const isBirthdayEligible = customer?.birthdate ? (() => {
    const parts = customer.birthdate.split('-');
    if (parts.length < 3) return false;
    const bMonth = parseInt(parts[1], 10) - 1;
    const currentMonth = new Date().getMonth();
    const alreadyClaimed = customer.lastBirthdayClaimedYear === currentYear;
    return bMonth === currentMonth && !alreadyClaimed;
  })() : false;

  const isBirthdayAlreadyClaimed = customer?.lastBirthdayClaimedYear === currentYear;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl bg-[#fdfcf7] text-[#4a2e16] rounded-3xl shadow-2xl border-2 border-[#e6dcbf] overflow-hidden flex flex-col max-h-[94vh]"
        >
          {/* Top Bar Header */}
          <div className="px-6 py-4 bg-[#f8f5ea] border-b border-[#e8dfc7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e1a139] text-[#2c1808] flex items-center justify-center font-black shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-widest font-extrabold text-[#965c19] uppercase">Terminal de Mostrador</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    MÉTODO 1: BÚSQUEDA POR TELÉFONO
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-hollywood tracking-wide text-[#3b200b] uppercase mt-0.5">
                  CAJA VIP • HELADERÍA HOLLYWOOD
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#7a573b] hover:text-[#3b200b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If NOT authenticated with PIN */}
          {!isAuthenticated ? (
            <div className="p-8 text-center max-w-md mx-auto my-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#f4ebcb] border-2 border-[#e1a139]/50 text-[#b37718] flex items-center justify-center mx-auto">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-hollywood text-[#3b200b] uppercase">Ingresa el PIN de Mostrador</h3>
                <p className="text-xs text-[#755943] mt-1">
                  Acceso exclusivo para el personal de caja de Heladería Hollywood.
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-4">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 px-4 rounded-2xl bg-[#f5f0e3] border-2 border-[#d9ccae] text-[#3b200b] focus:outline-none focus:border-[#e1a139]"
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs text-rose-600 font-bold">{pinError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#e1a139] hover:bg-[#d4942d] text-[#2c1808] font-bold text-sm tracking-wider uppercase transition-all shadow-md active:scale-[0.99]"
                >
                  Entrar al Sistema de Caja
                </button>
              </form>
            </div>
          ) : (
            /* Main Cashier View */
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Sede selector & search phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-extrabold text-[#704d2c] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#b37718]" /> Sede Actual:
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-xs font-bold text-[#3b200b] focus:outline-none focus:border-[#e1a139]"
                  >
                    {HOLLYWOOD_STORES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-extrabold text-[#704d2c] uppercase tracking-wider block mb-1.5">
                    Teléfono del Cliente (Dictado en Caja):
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ej: 0414-9876543 o 0424..."
                        className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-[#3b200b] text-sm font-mono placeholder:text-stone-400 focus:outline-none focus:border-[#e1a139]"
                      />
                      <Search className="w-4 h-4 text-[#b37718] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      onClick={() => handleSearch()}
                      disabled={isSearching}
                      className="px-5 py-2.5 rounded-xl bg-[#e1a139] hover:bg-[#d4942d] text-[#2c1808] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Buscar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status messages */}
              {actionSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* SEARCH RESULT: CUSTOMER FOUND */}
              {customer && (
                <div className="p-5 rounded-2xl bg-[#f8f5ea] border-2 border-[#e1a139]/40 shadow-sm space-y-5">
                  {/* Customer Info Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#e6ddc5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-hollywood text-[#3b200b] uppercase tracking-wide">{customer.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e1a139]/20 text-[#854b0c] border border-[#e1a139]/40">
                          CLIENTE VIP
                        </span>
                      </div>
                      <p className="text-xs text-[#705036] font-mono mt-0.5">
                        📞 {customer.phone} {customer.birthdate ? `• 🎂 Cumple: ${customer.birthdate.split('-').reverse().join('/')}` : '• Cumpleaños no registrado'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#805f43] font-bold uppercase tracking-widest block">Sellos Acumulados</span>
                      <strong className="text-3xl font-mono font-black text-[#a66a12]">
                        {customer.stamps} / 5
                      </strong>
                    </div>
                  </div>

                  {/* Stamp Visualization */}
                  <div className="grid grid-cols-5 gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((index) => {
                      const isStamped = customer.stamps >= index;
                      const isFifth = index === 5;
                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                            isStamped
                              ? 'bg-[#e1a139] border-[#c78b27] text-[#2c1808] font-black shadow-sm'
                              : 'bg-[#f0ebd9] border-dashed border-[#d9ccae] text-[#856c58]'
                          }`}
                        >
                          {isStamped ? (
                            <Star className="w-7 h-7 fill-[#2c1808] text-[#2c1808]" />
                          ) : isFifth ? (
                            <Gift className="w-6 h-6 text-[#a66a12]/70" />
                          ) : (
                            <span className="text-base font-bold text-[#856c58]">{index}</span>
                          )}
                          <span className={`text-[9px] font-bold mt-1 ${isStamped ? 'text-[#2c1808]' : 'text-[#856c58]'}`}>
                            {isFifth ? 'Premio' : `Sello ${index}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* PERK 1: BIRTHDAY PERK ALERT IF ELIGIBLE */}
                  {isBirthdayEligible && (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                          🎂
                        </div>
                        <div>
                          <strong className="text-sm font-bold text-rose-950 block">
                            ¡Regalo de Cumpleaños Disponible!
                          </strong>
                          <span className="text-xs text-rose-800 block">
                            Tiene 1 Sundae de Película 100% GRATIS por su cumpleaños ({customer.birthdate}).
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleRedeemBirthday}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Entregar Sundae Gratis</span>
                      </button>
                    </div>
                  )}

                  {isBirthdayAlreadyClaimed && (
                    <div className="p-2.5 rounded-xl bg-[#eee7d3] border border-[#d9ccae] text-[11px] text-[#705036] flex items-center justify-between">
                      <span>🎂 Regalo de Cumpleaños de este año:</span>
                      <span className="text-[#3b200b] font-bold">Ya canjeado en {customer.lastBirthdayClaimedYear}</span>
                    </div>
                  )}

                  {/* PERK 2: 5 STAMPS REWARD IF UNLOCKED */}
                  {(customer.stamps >= 5 || customer.rewardAvailable) && (
                    <div className="p-4 rounded-2xl bg-[#fff8e7] border-2 border-[#e1a139] space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 text-[#854b0c]">
                        <Star className="w-5 h-5 fill-[#e1a139] text-[#e1a139]" />
                        <strong className="text-sm font-extrabold">¡Completó sus 5 Sellos! Selecciona el premio entregado:</strong>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReward('bubble-waffle')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                            selectedReward === 'bubble-waffle'
                              ? 'bg-[#e1a139] text-[#2c1808] border-[#c78b27] shadow-sm'
                              : 'bg-[#f5f0e3] text-[#4a2e16] border-[#d9ccae] hover:border-[#e1a139]'
                          }`}
                        >
                          🧇 Bubble Waffle
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedReward('milkshake')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                            selectedReward === 'milkshake'
                              ? 'bg-[#e1a139] text-[#2c1808] border-[#c78b27] shadow-sm'
                              : 'bg-[#f5f0e3] text-[#4a2e16] border-[#d9ccae] hover:border-[#e1a139]'
                          }`}
                        >
                          🥤 Milkshake
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedReward('frapuccino')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                            selectedReward === 'frapuccino'
                              ? 'bg-[#e1a139] text-[#2c1808] border-[#c78b27] shadow-sm'
                              : 'bg-[#f5f0e3] text-[#4a2e16] border-[#d9ccae] hover:border-[#e1a139]'
                          }`}
                        >
                          ☕ Frappuccino
                        </button>
                      </div>

                      <button
                        onClick={handleRedeemStamp}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-[#e1a139] hover:bg-[#d4942d] text-[#2c1808] font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Entregar {selectedReward.toUpperCase()} Gratis y Reiniciar a 0</span>
                      </button>
                    </div>
                  )}

                  {/* STANDARD ACTION: SUMAR SELLO POR COMPRA */}
                  {customer.stamps < 5 && (
                    <div className="pt-3 border-t border-[#e6ddc5] space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-extrabold text-[#3b200b] block">Registrar Compra Actual:</span>
                          <span className="text-[11px] text-[#705036] block">Monto mínimo para sumar sello: $4.00</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#705036] font-bold">$</span>
                            <input
                              type="number"
                              step="0.50"
                              min="4.00"
                              value={purchaseAmount}
                              onChange={(e) => setPurchaseAmount(e.target.value)}
                              className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-[#3b200b] font-mono text-sm font-bold focus:outline-none focus:border-[#e1a139]"
                            />
                          </div>

                          <button
                            onClick={handleAddStamp}
                            disabled={isProcessing || parseFloat(purchaseAmount) < 4.0}
                            className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-[#e1a139] hover:bg-[#d4942d] text-[#2c1808] font-black text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4 fill-[#2c1808]" />
                            <span>+1 Sello en Mostrador</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEARCH RESULT: CUSTOMER NOT FOUND */}
              {searchDone && !customer && !isRegistering && (
                <div className="p-6 rounded-2xl bg-[#f8f5ea] border border-[#d9ccae] text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#eee7d3] text-[#705036] flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#3b200b]">No se encontró cliente con el teléfono: {phoneSearch}</h3>
                    <p className="text-xs text-[#705036] mt-1 max-w-sm mx-auto">
                      ¿Es la primera vez que compra? Puedes registrarlo en 5 segundos para que empiece a acumular sellos hoy mismo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setRegName('');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-[#e1a139] hover:bg-[#d4942d] text-[#2c1808] font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrar Nuevo Cliente VIP</span>
                  </button>
                </div>
              )}

              {/* QUICK REGISTRATION FORM */}
              {isRegistering && (
                <form onSubmit={handleQuickRegister} className="p-5 rounded-2xl bg-[#f8f5ea] border border-[#e1a139]/50 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e6ddc5]">
                    <div className="flex items-center gap-2 text-[#854b0c]">
                      <UserPlus className="w-5 h-5" />
                      <h4 className="font-hollywood text-sm uppercase">Registro Rápido en Caja (5 segundos)</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs text-[#705036] hover:text-[#3b200b]"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-[#704d2c] block mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Andrés González"
                        className="w-full py-2 px-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-sm text-[#3b200b] focus:outline-none focus:border-[#e1a139]"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-[#704d2c] block mb-1">Teléfono WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        placeholder="0414..."
                        className="w-full py-2 px-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-sm text-[#3b200b] focus:outline-none focus:border-[#e1a139]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-[#704d2c] block mb-1">Fecha de Cumpleaños</label>
                      <input
                        type="date"
                        value={regBirthdate}
                        onChange={(e) => setRegBirthdate(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-sm text-[#3b200b] focus:outline-none focus:border-rose-400"
                      />
                      <span className="text-[10px] text-[#705036] mt-0.5 block">Para su helado gratis de cumpleaños</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-[#704d2c] block mb-1">Monto Compra Actual ($)</label>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-[#f5f0e3] border border-[#d9ccae] text-sm text-[#3b200b] font-mono focus:outline-none focus:border-[#e1a139]"
                      />
                      <span className="text-[10px] text-[#705036] mt-0.5 block">Si es ≥ $4.00 ya suma su 1er sello</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-[#e1a139] hover:bg-[#d4942d] text-[#2c1808] font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Cliente y Sumar Sello</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="px-6 py-3 bg-[#f5f0e3] border-t border-[#e8dfc7] flex items-center justify-between text-[11px] text-[#705036]">
            <span className="font-semibold">Regla de Oro: Compra mínima de $4.00 suma 1 sello</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
