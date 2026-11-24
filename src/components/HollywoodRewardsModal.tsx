import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Award, 
  QrCode, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  Gift, 
  Calendar, 
  Phone, 
  User as UserIcon, 
  Mail, 
  ShoppingBag, 
  Info, 
  Lock,
  LogOut,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerProfile, RewardItem } from '../types';
import { REWARDS_CATALOG, LOYALTY_TIERS, POINTS_PER_DOLLAR } from '../loyaltyConstants';
import { logoBase64 } from '../logoBase64';
import { HollywoodStar } from './HollywoodStar';

interface HollywoodRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile | null;
  onSaveProfile: (data: { name: string; phone: string; birthDate: string; email?: string }) => Promise<any>;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onRedeemReward: (reward: RewardItem) => void;
  isSigningIn: boolean;
}

type Step = 'welcome' | 'birthdate' | 'phone_name' | 'dashboard' | 'info';

export function HollywoodRewardsModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onSignInWithGoogle,
  onSignOut,
  onRedeemReward,
  isSigningIn
}: HollywoodRewardsModalProps) {
  // If user already has a registered profile with phone, start at dashboard; else start at welcome
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    return profile?.phone ? 'dashboard' : 'welcome';
  });

  const [activeTab, setActiveTab] = useState<'rewards' | 'how_it_works' | 'profile'>('rewards');
  const [activeTierFilter, setActiveTierFilter] = useState<string>('all');
  
  // Registration form states
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phonePrefix, setPhonePrefix] = useState('+58');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone?.replace(/^(\+58|\+57)\s*/, '') || '');
  const [birthDate, setBirthDate] = useState(profile?.birthDate || '');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [acceptMarketing, setAcceptMarketing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);

  // Sync state if profile changes
  React.useEffect(() => {
    if (profile?.phone && currentStep !== 'dashboard' && currentStep !== 'info') {
      setCurrentStep('dashboard');
    }
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.email) setEmail(profile.email);
      if (profile.birthDate) setBirthDate(profile.birthDate);
      if (profile.phone) {
        if (profile.phone.startsWith('+57')) {
          setPhonePrefix('+57');
          setPhoneNumber(profile.phone.replace('+57', '').trim());
        } else {
          setPhonePrefix('+58');
          setPhoneNumber(profile.phone.replace('+58', '').trim());
        }
      }
    }
  }, [profile]);

  if (!isOpen) return null;

  const currentPoints = profile?.points || 0;
  const currentTierInfo = LOYALTY_TIERS[profile?.tier || 'Bronce'] || LOYALTY_TIERS['Bronce'];

  // Next reward calculation
  const sortedRewards = [...REWARDS_CATALOG].sort((a, b) => a.pointsRequired - b.pointsRequired);
  const nextReward = sortedRewards.find(r => r.pointsRequired > currentPoints) || sortedRewards[sortedRewards.length - 1];
  const pointsToNext = Math.max(0, nextReward.pointsRequired - currentPoints);
  const progressPercent = Math.min(100, Math.round((currentPoints / nextReward.pointsRequired) * 100));

  const handleNextFromBirthdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    setCurrentStep('phone_name');
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) return;
    setIsSubmitting(true);
    try {
      const fullPhone = `${phonePrefix} ${phoneNumber.trim()}`;
      await onSaveProfile({
        name: name.trim(),
        phone: fullPhone,
        birthDate,
        email: email.trim()
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setCurrentStep('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemClick = (reward: RewardItem) => {
    if (currentPoints < reward.pointsRequired) return;
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#e1a139', '#8B4513', '#f6b40c', '#ffffff']
    });
    onRedeemReward(reward);
    setRedemptionSuccess(`¡Canjeaste exitosamente: ${reward.name}! Se agregó a tu pedido con costo $0.00.`);
    setTimeout(() => {
      setRedemptionSuccess(null);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#5a2f0f]/60 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col border border-holly-orange/20 z-10"
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-white border-b border-holly-orange/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={logoBase64} 
              alt="Heladería Hollywood" 
              className="h-8 sm:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-4 w-[1px] bg-holly-brown/20" />
            <div className="flex items-center gap-1.5">
              <HollywoodStar className="w-4 h-4 text-holly-orange fill-holly-orange" />
              <span className="font-display font-bold text-xs sm:text-sm text-holly-brown tracking-wider uppercase">
                Club Recompensas Hollywood
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-holly-brown/50 hover:text-holly-orange hover:bg-holly-cream rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Content based on currentStep */}
        <div className="flex-1 overflow-y-auto">
          {/* STEP 1: WELCOME & SOCIAL LOGIN */}
          {currentStep === 'welcome' && (
            <div className="p-6 sm:p-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#f6b40c]/20 via-[#e1a139]/30 to-amber-100 flex items-center justify-center border-2 border-holly-orange/30 shadow-inner">
                  <Award className="w-10 h-10 sm:w-12 sm:h-12 text-holly-orange" />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-holly-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow">
                  Club Holly
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-bold text-holly-brown tracking-tight mb-2 uppercase">
                Te damos la bienvenida al Club Hollywood
              </h2>
              <p className="text-xs sm:text-sm text-holly-brown/70 font-sans max-w-md mx-auto mb-8 leading-relaxed">
                El modelo de fidelización y recompensas más dulce. Cuanto más disfrutes de nuestros helados, más puntos acumulas para canjear barquillas, tinas y toppings gratis.
              </p>

              {/* Action Buttons */}
              <div className="w-full max-w-sm space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    await onSignInWithGoogle();
                    setCurrentStep('birthdate');
                  }}
                  disabled={isSigningIn}
                  className="w-full py-3.5 px-4 bg-white border-2 border-holly-brown/15 hover:border-holly-orange hover:bg-holly-cream/40 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm group active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-sans font-bold text-xs sm:text-sm text-holly-brown group-hover:text-holly-orange tracking-wide">
                    {isSigningIn ? 'Iniciando sesión...' : 'Continuar con Google'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('birthdate')}
                  className="w-full py-3.5 px-4 bg-holly-brown text-white hover:bg-holly-orange rounded-2xl flex items-center justify-center gap-2 font-sans font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-[0.99]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Continuar con Registro Rápido</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('dashboard')}
                  className="w-full py-2.5 text-holly-brown/60 hover:text-holly-orange font-sans font-semibold text-xs tracking-wider transition-colors flex items-center justify-center gap-1"
                >
                  <span>Explorar recompensas como invitado</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Perks highlight */}
              <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm mx-auto pt-6 border-t border-holly-brown/10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-holly-orange mb-1">
                    <Gift className="w-4 h-4 text-holly-orange" />
                  </div>
                  <span className="text-[10px] font-bold text-holly-brown uppercase">Cumpleaños</span>
                  <span className="text-[9px] text-holly-brown/60">Helado de regalo</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-holly-orange mb-1">
                    <QrCode className="w-4 h-4 text-holly-orange" />
                  </div>
                  <span className="text-[10px] font-bold text-holly-brown uppercase">Código 4 Dígitos</span>
                  <span className="text-[9px] text-holly-brown/60">Canje en tienda física</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIRTHDATE CONFIRMATION */}
          {currentStep === 'birthdate' && (
            <div className="p-6 sm:p-10 max-w-lg mx-auto">
              <button
                onClick={() => setCurrentStep('welcome')}
                className="flex items-center gap-1 text-holly-brown/60 hover:text-holly-orange text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-holly-orange text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-holly-brown/50 uppercase tracking-widest">Paso 1 de 2</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-holly-brown tracking-tight mb-2 uppercase">
                Confirma tu fecha de cumpleaños
              </h2>
              <p className="text-xs sm:text-sm text-holly-brown/70 font-sans mb-6">
                Ingresa tu fecha de nacimiento para enviarte una barquilla de regalo de bienvenida en tu día especial y acceder a recompensas infinitas de película.
              </p>

              <form onSubmit={handleNextFromBirthdate} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-holly-brown/70 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-3 bg-holly-cream/50 border border-holly-orange/20 rounded-xl font-sans text-sm text-holly-brown focus:outline-none focus:border-holly-orange"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-holly-brown/70 mb-1">
                    Fecha de Nacimiento (DD/MM/AAAA) *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-3 bg-holly-cream/50 border border-holly-orange/20 rounded-xl font-sans text-sm text-holly-brown focus:outline-none focus:border-holly-orange"
                    />
                    <Calendar className="w-5 h-5 text-holly-orange absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-left">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                      className="mt-1 w-4 h-4 text-holly-orange rounded border-holly-orange/30 focus:ring-holly-orange"
                    />
                    <span className="text-[11px] text-holly-brown/70 leading-snug">
                      Al continuar, acepto los <span className="text-holly-orange font-bold underline">Términos y Condiciones</span> del Club Recompensas Hollywood.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-left">
                    <input
                      type="checkbox"
                      checked={acceptMarketing}
                      onChange={(e) => setAcceptMarketing(e.target.checked)}
                      className="mt-1 w-4 h-4 text-holly-orange rounded border-holly-orange/30 focus:ring-holly-orange"
                    />
                    <span className="text-[11px] text-holly-brown/70 leading-snug">
                      Quiero recibir notificaciones de promociones exclusivas, dobles puntos y mi helado de cumpleaños.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!birthDate || !acceptTerms}
                  className="w-full py-3.5 bg-holly-orange hover:bg-[#d6932b] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Continuar
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: NAME & PHONE NUMBER (McDonald's flow) */}
          {currentStep === 'phone_name' && (
            <div className="p-6 sm:p-10 max-w-lg mx-auto">
              <button
                onClick={() => setCurrentStep('birthdate')}
                className="flex items-center gap-1 text-holly-brown/60 hover:text-holly-orange text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="w-6 h-6 rounded-full bg-holly-orange text-white text-xs font-bold flex items-center justify-center">2</span>
                </div>
                <span className="text-xs font-bold text-holly-brown/50 uppercase tracking-widest">Paso 2 de 2</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-holly-brown tracking-tight mb-2 uppercase">
                Nombre y Número de Teléfono
              </h2>
              <p className="text-xs sm:text-sm text-holly-brown/70 font-sans mb-6">
                Con el fin de asegurar que solo tú tengas acceso a tu cuenta y puedas acumular puntos en mostrador con solo dictar tu número telefónico.
              </p>

              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-holly-brown/70 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Greimary Urribarri"
                      className="w-full px-4 py-3 bg-holly-cream/50 border border-holly-orange/20 rounded-xl font-sans text-sm text-holly-brown focus:outline-none focus:border-holly-orange"
                    />
                    <UserIcon className="w-4 h-4 text-holly-brown/40 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-holly-brown/70 mb-1">
                    Número de Teléfono Celular *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className="w-24 px-2 py-3 bg-white border border-holly-orange/20 rounded-xl font-sans font-bold text-sm text-holly-brown focus:outline-none focus:border-holly-orange"
                    >
                      <option value="+58">+58 (VE)</option>
                      <option value="+57">+57 (CO)</option>
                      <option value="+1">+1 (US)</option>
                    </select>

                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ej. 412 1234567"
                        className="w-full px-4 py-3 bg-holly-cream/50 border border-holly-orange/20 rounded-xl font-sans text-sm text-holly-brown focus:outline-none focus:border-holly-orange"
                      />
                      <Phone className="w-4 h-4 text-holly-brown/40 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <span className="text-[10px] text-holly-brown/50 mt-1 block">
                    Dictarás este número en el mostrador para acreditar tus compras físicas.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !phoneNumber.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-holly-orange to-[#f6b40c] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? 'Guardando perfil...' : 'Activar Mi Cuenta Club Hollywood'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: MAIN DASHBOARD & REWARDS CATALOG */}
          {currentStep === 'dashboard' && (
            <div className="p-4 sm:p-8 space-y-6">
              {/* Notification Banner */}
              {redemptionSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{redemptionSuccess}</span>
                </motion.div>
              )}

              {/* Digital Loyalty Card */}
              <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#5a2f0f] via-[#7a3e14] to-[#8B4513] text-white p-6 sm:p-8 shadow-xl border border-[#f6b40c]/40">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#f6b40c]/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/20 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  {/* Left: User & Points */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f6b40c] to-amber-200 text-[#5a2f0f] flex items-center justify-center font-display font-bold text-xl shadow-md border border-white/20">
                        {profile?.name?.charAt(0).toUpperCase() || 'H'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight uppercase">
                            {profile?.name || 'Socio Hollywood'}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-[#f6b40c] text-[#5a2f0f]">
                            {currentTierInfo.badgeText}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-200/80 font-sans">
                          {profile?.phone || 'Registra tu teléfono para canjear en tienda'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/80 block">
                        Saldo de Puntos Hollywood
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-display font-bold text-white tracking-normal">
                          {currentPoints}
                        </span>
                        <span className="text-sm font-sans font-bold text-[#f6b40c] uppercase tracking-widest">
                          PUNTOS
                        </span>
                      </div>
                    </div>

                    {/* Progress to next reward */}
                    <div className="space-y-1.5 max-w-sm">
                      <div className="flex justify-between text-[10px] text-amber-200">
                        <span>Próximo premio: <strong className="text-white">{nextReward.name}</strong></span>
                        <span>{currentPoints} / {nextReward.pointsRequired} pts</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div 
                          className="h-full bg-gradient-to-r from-[#f6b40c] to-amber-300 rounded-full transition-all duration-700" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      {pointsToNext > 0 ? (
                        <p className="text-[9px] text-amber-200/70">
                          Te faltan <strong className="text-white">{pointsToNext} pts</strong> para tu helado gratis.
                        </p>
                      ) : (
                        <p className="text-[9px] text-emerald-300 font-bold">
                          ¡Ya puedes canjear este producto sin costo!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: In-Store 4-Digit Code (McDonald's Colombia style) */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center sm:min-w-[190px] shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-200 mb-1 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" />
                      Código en Tienda
                    </span>
                    <div className="text-3xl font-display font-bold text-[#f6b40c] tracking-[0.25em] bg-black/30 px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">
                      {profile?.pinCode || '8421'}
                    </div>
                    <span className="text-[8px] text-white/70 max-w-[160px] mt-1.5 leading-tight">
                      Muestra este código o dicta tu teléfono al cajero antes de pedir.
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-holly-brown/10 pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'rewards'
                        ? 'bg-holly-brown text-white shadow-sm'
                        : 'text-holly-brown/60 hover:text-holly-orange hover:bg-holly-cream'
                    }`}
                  >
                    Recompensas
                  </button>
                  <button
                    onClick={() => setActiveTab('how_it_works')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'how_it_works'
                        ? 'bg-holly-brown text-white shadow-sm'
                        : 'text-holly-brown/60 hover:text-holly-orange hover:bg-holly-cream'
                    }`}
                  >
                    ¿Cómo Funciona?
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'profile'
                        ? 'bg-holly-brown text-white shadow-sm'
                        : 'text-holly-brown/60 hover:text-holly-orange hover:bg-holly-cream'
                    }`}
                  >
                    Mi Perfil
                  </button>
                </div>

                {!profile?.phone && (
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="text-[10px] font-bold text-holly-orange uppercase tracking-wider hover:underline"
                  >
                    Completar registro
                  </button>
                )}
              </div>

              {/* TAB 1: REWARDS CATALOG */}
              {activeTab === 'rewards' && (
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {['all', 'topping', 'soft', 'gelato', 'especial'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveTierFilter(cat)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                          activeTierFilter === cat
                            ? 'bg-holly-orange text-white border-holly-orange'
                            : 'bg-white text-holly-brown/60 border-holly-brown/15 hover:border-holly-orange'
                        }`}
                      >
                        {cat === 'all' ? 'Todos' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Rewards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {REWARDS_CATALOG
                      .filter(r => activeTierFilter === 'all' || r.category === activeTierFilter)
                      .map((reward) => {
                        const canRedeem = currentPoints >= reward.pointsRequired;
                        const missing = reward.pointsRequired - currentPoints;

                        return (
                          <div
                            key={reward.id}
                            className={`p-3.5 rounded-2xl border transition-all duration-300 flex gap-3.5 bg-white ${
                              canRedeem
                                ? 'border-[#f6b40c] shadow-md hover:shadow-lg'
                                : 'border-holly-brown/10 opacity-75'
                            }`}
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-holly-cream shrink-0 border border-holly-orange/15 relative">
                              <img
                                src={reward.image}
                                alt={reward.name}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-holly-brown/80 backdrop-blur-sm text-[#f6b40c] text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                                {reward.pointsRequired} pts
                              </span>
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="font-display font-bold text-xs sm:text-sm text-holly-brown truncate">
                                    {reward.name}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-holly-brown/60 font-sans line-clamp-2 leading-tight mt-0.5">
                                  {reward.description}
                                </p>
                              </div>

                              <div className="pt-2 flex items-center justify-between">
                                {canRedeem ? (
                                  <button
                                    onClick={() => handleRedeemClick(reward)}
                                    className="w-full py-1.5 px-3 bg-gradient-to-r from-holly-orange to-[#f6b40c] hover:opacity-95 text-white font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                  >
                                    <Gift className="w-3.5 h-3.5" />
                                    <span>Canjear por {reward.pointsRequired} pts</span>
                                  </button>
                                ) : (
                                  <div className="w-full flex items-center justify-between text-[10px]">
                                    <span className="text-holly-brown/40 font-medium">
                                      Faltan {missing} pts
                                    </span>
                                    <span className="px-2 py-0.5 bg-holly-cream text-holly-brown/50 rounded-full font-bold text-[9px] uppercase">
                                      Bloqueado
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 2: HOW IT WORKS */}
              {activeTab === 'how_it_works' && (
                <div className="p-4 sm:p-6 bg-holly-cream/40 rounded-2xl border border-holly-orange/15 space-y-5 text-left">
                  <h3 className="font-display font-bold text-base sm:text-lg text-holly-brown uppercase tracking-tight">
                    Reglas del Club Recompensas Hollywood
                  </h3>

                  <div className="space-y-4 text-xs text-holly-brown/80 font-sans leading-relaxed">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-holly-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <strong className="text-holly-brown font-bold block text-sm">Acumulación de Puntos</strong>
                        Recibes <strong>30 puntos Hollywood por cada $1.00 USD gastado</strong> (según la tabla oficial de productos Soft y Gelato).
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-holly-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <strong className="text-holly-brown font-bold block text-sm">Compras en Tienda Física & Kiosco</strong>
                        Presenta tu código de 4 dígitos o dicta tu número telefónico registrado al cajero antes de realizar el pago. Los puntos se sumarán de inmediato a tu balance.
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-holly-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <strong className="text-holly-brown font-bold block text-sm">Canje en Pedidos Web & Delivery</strong>
                        Selecciona cualquier recompensa alcanzada en esta pantalla o en tu carrito. Se agregará a tu orden con <strong>precio $0.00</strong> y se deducirán los puntos de tu saldo al completar la orden.
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-holly-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <strong className="text-holly-brown font-bold block text-sm">Regalo de Cumpleaños</strong>
                        Durante el mes de tu fecha de cumpleaños registrada, podrás reclamar una barquilla Soft o Gelato 1 porción gratis como cortesía de Heladería Hollywood.
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-holly-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        5
                      </div>
                      <div>
                        <strong className="text-holly-brown font-bold block text-sm">Vigencia de los Puntos</strong>
                        Tus puntos tienen una vigencia de 180 días (6 meses) a partir del momento en que los ganas.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROFILE & ACCOUNT */}
              {activeTab === 'profile' && (
                <div className="p-4 sm:p-6 bg-white rounded-2xl border border-holly-orange/20 space-y-5 text-left">
                  <h3 className="font-display font-bold text-base sm:text-lg text-holly-brown uppercase tracking-tight">
                    Datos de tu Cuenta de Recompensas
                  </h3>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between py-2 border-b border-holly-brown/10">
                      <span className="text-holly-brown/60">Nombre:</span>
                      <strong className="text-holly-brown">{profile?.name || 'No especificado'}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-holly-brown/10">
                      <span className="text-holly-brown/60">Teléfono para tienda:</span>
                      <strong className="text-holly-brown">{profile?.phone || 'No registrado'}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-holly-brown/10">
                      <span className="text-holly-brown/60">Cumpleaños:</span>
                      <strong className="text-holly-brown">{profile?.birthDate || 'No registrado'}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-holly-brown/10">
                      <span className="text-holly-brown/60">Correo electrónico:</span>
                      <strong className="text-holly-brown">{profile?.email || 'Invitado'}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-holly-brown/10">
                      <span className="text-holly-brown/60">Nivel de Socio:</span>
                      <strong className="text-holly-orange font-bold uppercase">{currentTierInfo.name}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-holly-brown/10">
                      <span className="text-holly-brown/60">PIN de 4 Dígitos en Tienda:</span>
                      <strong className="font-display text-base text-[#5a2f0f]">{profile?.pinCode || '8421'}</strong>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setCurrentStep('phone_name')}
                      className="px-4 py-2 bg-holly-cream hover:bg-holly-cream/80 text-holly-brown border border-holly-orange/30 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Editar Teléfono o Nombre
                    </button>

                    <button
                      onClick={async () => {
                        await onSignOut();
                        setCurrentStep('welcome');
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
