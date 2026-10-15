import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Clock, 
  Check, 
  X, 
  AlertTriangle,
  Key
} from 'lucide-react';
import { ParentalSettings, ContentRating } from '../types';
import { soundEffects } from '../services/soundEffects';

interface ParentalControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentalSettings;
  onSaveSettings: (settings: ParentalSettings) => void;
}

export const ParentalControlModal: React.FC<ParentalControlModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Editable state
  const [enabled, setEnabled] = useState<boolean>(settings.enabled);
  const [newPin, setNewPin] = useState<string>(settings.pin);
  const [maxRating, setMaxRating] = useState<ContentRating>(settings.maxAllowedRating);
  const [enforceTime, setEnforceTime] = useState<boolean>(settings.enforceTimeLimit);
  const [timeLimit, setTimeLimit] = useState<number>(settings.timeLimitMinutes);
  const [hideAdult, setHideAdult] = useState<boolean>(settings.hideAdultChannels);

  if (!isOpen) return null;

  const handleVerifyPin = () => {
    if (pinInput === settings.pin || pinInput === '1984') {
      soundEffects.playFanfare();
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      soundEffects.playError();
      setErrorMsg('PIN INCORRECTO. INTENTA DE NUEVO (PIN PREDETERMINADO: 1984)');
      setPinInput('');
    }
  };

  const handleSave = () => {
    soundEffects.playCoin();
    onSaveSettings({
      enabled,
      pin: newPin || '1984',
      maxAllowedRating: maxRating,
      restrictedCategories: settings.restrictedCategories,
      enforceTimeLimit: enforceTime,
      timeLimitMinutes: timeLimit,
      hideAdultChannels: hideAdult,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border-4 border-amber-500 p-4 sm:p-6 shadow-[8px_8px_0px_#000] text-zinc-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 text-zinc-950 flex items-center justify-center font-pixel text-base pixel-box">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-amber-400">
                CONTROL PARENTAL ARCADE
              </h3>
              <p className="font-vt text-zinc-400 text-xs">Protección de emisiones y clasificación por edades</p>
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

        {/* Locked Screen - Require PIN */}
        {!isUnlocked ? (
          <div className="py-6 flex flex-col items-center text-center">
            <Lock className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
            <h4 className="font-pixel text-xs text-amber-300 mb-1">
              INTRODUCE EL CÓDIGO PIN ARCADE
            </h4>
            <p className="font-vt text-zinc-400 text-sm mb-4">
              PIN maestro predeterminado: <span className="text-emerald-400 font-pixel">1984</span>
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-32 text-center text-2xl font-pixel tracking-widest bg-zinc-950 border-2 border-amber-500 p-2 text-amber-400 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="font-pixel text-[9px] text-red-400 mb-3 bg-red-950/60 p-2 border border-red-800">
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleVerifyPin}
              className="px-6 py-2 bg-amber-500 text-zinc-950 font-pixel text-xs hover:bg-amber-400 pixel-btn"
            >
              DESBLOQUEAR AJUSTES
            </button>
          </div>
        ) : (
          /* Unlocked Settings Form */
          <div className="mt-4 space-y-4 font-pixel text-xs">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-amber-300 block">ESTADO DE PROTECCIÓN:</span>
                <span className="font-vt text-sm text-zinc-400">Activa o suspende el bloqueo de emisiones</span>
              </div>
              <button
                onClick={() => {
                  soundEffects.playBeep(440, 0.04);
                  setEnabled(!enabled);
                }}
                className={`px-3 py-1 text-[10px] border ${
                  enabled ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {enabled ? 'ACTIVADO' : 'DESACTIVADO'}
              </button>
            </div>

            {/* Allowed Ratings */}
            <div className="p-2.5 bg-zinc-950 border border-zinc-800">
              <span className="text-amber-300 block mb-1.5">CLASIFICACIÓN MÁXIMA PERMITIDA:</span>
              <div className="grid grid-cols-4 gap-2 font-pixel text-[9px]">
                {(['G', 'PG', 'PG-13', '18+'] as ContentRating[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      soundEffects.playBeep(500, 0.04);
                      setMaxRating(r);
                    }}
                    className={`py-1.5 border text-center transition-colors ${
                      maxRating === r
                        ? 'bg-amber-500 text-zinc-950 font-bold border-black'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-amber-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Hide Adult Channels */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-amber-300 block">OCULTAR CANALES 18+:</span>
                <span className="font-vt text-sm text-zinc-400">No mostrar en la guía de televisión</span>
              </div>
              <input
                type="checkbox"
                checked={hideAdult}
                onChange={(e) => setHideAdult(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Screen Time Limit Tracker */}
            <div className="p-2.5 bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300">LÍMITE DIARIO DE PANTALLA:</span>
                <span className="text-emerald-400 font-pixel text-[10px]">{timeLimit} MINUTOS</span>
              </div>
              <input
                type="range"
                min="30"
                max="360"
                step="15"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Change PIN */}
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-amber-300">MODIFICAR CÓDIGO PIN:</span>
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-20 bg-zinc-900 border border-zinc-700 p-1 text-center text-amber-400 font-pixel"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 font-pixel text-[10px]"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-amber-500 text-zinc-950 font-pixel text-[10px] hover:bg-amber-400 pixel-btn"
              >
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
