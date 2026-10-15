import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  Globe, 
  Volume2, 
  Eye, 
  Type, 
  Check
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onSelectLanguage: (lang: string) => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
}) => {
  const [colorFilter, setColorFilter] = useState<'normal' | 'dmg_green' | 'amber_crt'>('normal');
  const [subtitleColor, setSubtitleColor] = useState<'yellow' | 'green' | 'white'>('yellow');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border-4 border-emerald-500 p-5 shadow-[8px_8px_0px_#000] text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 text-zinc-950 flex items-center justify-center font-pixel text-base pixel-box">
              <Sliders className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-emerald-400">
                AJUSTES DE ACCESIBILIDAD & IDIOMA
              </h3>
              <p className="font-vt text-zinc-400 text-xs">Personalización visual y soporte multi-idioma</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playBeep(300, 0.04);
              onClose();
            }}
            className="p-1 text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="mt-4 space-y-4 font-pixel text-[10px]">
          {/* Language Selector */}
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-emerald-300 block mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>IDIOMA DE LA PLATAFORMA (GLOBAL AUDIENCE):</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { code: 'es', label: 'Español' },
                { code: 'en', label: 'English' },
                { code: 'ja', label: '日本語' },
                { code: 'pt', label: 'Português' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    soundEffects.playBeep(520, 0.04);
                    onSelectLanguage(lang.code);
                  }}
                  className={`p-2 border text-center transition-colors ${
                    language === lang.code
                      ? 'bg-emerald-500 text-zinc-950 font-bold border-black'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-emerald-500'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Retro Phosphor Display Filter */}
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-amber-300 block mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>FILTRO DE FÓSFORO CRT & CONTRASTE:</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Color RGB 8-Bit' },
                { id: 'dmg_green', label: 'GameBoy DMG Green' },
                { id: 'amber_crt', label: 'Terminal Ámbar' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundEffects.playBeep(480, 0.04);
                    setColorFilter(f.id as any);
                  }}
                  className={`p-2 border text-center transition-colors ${
                    colorFilter === f.id
                      ? 'bg-amber-500 text-zinc-950 font-bold border-black'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitles Style */}
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-purple-300 block mb-2 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>SUBTÍTULOS PIXEL & ESTILO:</span>
            </span>
            <div className="flex gap-2">
              {[
                { id: 'yellow', label: 'Amarillo Arcade' },
                { id: 'green', label: 'Verde Matrix' },
                { id: 'white', label: 'Blanco Alto Contraste' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    soundEffects.playBeep(560, 0.04);
                    setSubtitleColor(s.id as any);
                  }}
                  className={`flex-1 p-2 border text-center ${
                    subtitleColor === s.id
                      ? 'bg-purple-500 text-zinc-950 font-bold border-black'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 text-zinc-950 font-pixel text-[10px] hover:bg-emerald-400 pixel-btn"
          >
            GUARDAR Y CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
