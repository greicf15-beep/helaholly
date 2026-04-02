import React from 'react';
import { motion } from 'motion/react';

export function Hero() {
  return (
    <section className="relative pt-48 pb-40 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-12 bg-holly-orange" />
            <span className="text-xs font-bold uppercase tracking-[0.6em] text-holly-orange">Sabor Inigualable</span>
            <div className="h-px w-12 bg-holly-orange" />
          </div>
          <h1 className="text-8xl sm:text-[12rem] lg:text-[16rem] font-hollywood font-bold uppercase leading-[0.75] tracking-tight text-holly-brown mb-12">
            EL MEJOR <br />
            <span className="text-holly-orange">HELADO</span>
          </h1>
          <p className="mt-12 max-w-3xl mx-auto text-xl sm:text-3xl text-holly-brown/60 font-sans font-medium leading-relaxed uppercase tracking-[0.2em]">
            Cremosidad y frescura en cada bocado
          </p>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#e1a139' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = document.getElementById('menu-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-16 px-12 py-4 bg-holly-brown text-white font-sans font-semibold text-[11px] uppercase tracking-[1.5px] transition-all duration-500 rounded-[15px] shadow-lg"
          >
            VER MENÚ
          </motion.button>
        </motion.div>
      </div>

      {/* Brand Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-holly-orange/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-holly-orange to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-holly-orange to-transparent" />
      </div>
    </section>
  );
}
