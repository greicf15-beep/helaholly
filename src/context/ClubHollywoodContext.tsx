import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Award } from 'lucide-react';
import { CLUB_HOLLYWOOD_PRODUCTION_ENABLED } from '../loyaltyConstants';

const EDITOR_STORAGE_KEY = 'hollywood_editor_club_enabled';

interface ClubHollywoodContextValue {
  isClubEnabled: boolean;
  isEditorEnvironment: boolean;
  toggleClubEnabled: () => void;
  setClubEnabled: (enabled: boolean) => void;
}

function detectEditorEnvironment(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.startsWith('ais-dev-') || host === 'localhost' || host === '127.0.0.1') {
      return true;
    }
  }
  return false;
}

const ClubHollywoodContext = createContext<ClubHollywoodContextValue>({
  isClubEnabled: CLUB_HOLLYWOOD_PRODUCTION_ENABLED,
  isEditorEnvironment: false,
  toggleClubEnabled: () => {},
  setClubEnabled: () => {},
});

export function ClubHollywoodProvider({ children }: { children: React.ReactNode }) {
  const isEditorEnvironment = detectEditorEnvironment();

  const [editorEnabled, setEditorEnabled] = useState<boolean>(() => {
    if (!isEditorEnvironment || typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(EDITOR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isEditorEnvironment || typeof window === 'undefined') return;
    try {
      localStorage.setItem(EDITOR_STORAGE_KEY, editorEnabled ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
  }, [editorEnabled, isEditorEnvironment]);

  const toggleClubEnabled = useCallback(() => {
    if (!isEditorEnvironment) return;
    setEditorEnabled((prev) => !prev);
  }, [isEditorEnvironment]);

  const setClubEnabled = useCallback((enabled: boolean) => {
    if (!isEditorEnvironment) return;
    setEditorEnabled(enabled);
  }, [isEditorEnvironment]);

  const isClubEnabled = CLUB_HOLLYWOOD_PRODUCTION_ENABLED || (isEditorEnvironment && editorEnabled);

  return (
    <ClubHollywoodContext.Provider
      value={{
        isClubEnabled,
        isEditorEnvironment,
        toggleClubEnabled,
        setClubEnabled,
      }}
    >
      {children}
    </ClubHollywoodContext.Provider>
  );
}

export function useClubHollywood() {
  return useContext(ClubHollywoodContext);
}

export function ClubHollywoodEditorToggle() {
  const { isClubEnabled, isEditorEnvironment, toggleClubEnabled } = useClubHollywood();

  if (!isEditorEnvironment || CLUB_HOLLYWOOD_PRODUCTION_ENABLED) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleClubEnabled}
      title="Botón solo visible en el editor para activar/desactivar Club Hollywood"
      className={`fixed bottom-20 md:bottom-5 left-4 z-[95] flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-xl border backdrop-blur-md transition-all active:scale-95 ${
        isClubEnabled
          ? 'bg-[#5a2f0f]/95 border-[#f6b40c] text-white'
          : 'bg-white/95 border-holly-brown/20 text-holly-brown hover:border-holly-orange'
      }`}
    >
      <Award className={`w-4 h-4 shrink-0 ${isClubEnabled ? 'text-[#f6b40c]' : 'text-holly-brown/50'}`} />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider">
          Club Hollywood
        </span>
        <span className={`text-[8px] font-sans uppercase tracking-widest ${isClubEnabled ? 'text-amber-200' : 'text-holly-brown/50'}`}>
          Solo Editor
        </span>
      </div>
      <div
        className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
          isClubEnabled ? 'bg-[#f6b40c] justify-end' : 'bg-holly-brown/20 justify-start'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
      </div>
    </button>
  );
}
