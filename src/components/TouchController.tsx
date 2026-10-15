import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Tv, 
  Volume2, 
  VolumeX, 
  Radio, 
  Play, 
  Pause,
  RotateCcw,
  Sparkles,
  Hash
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface TouchControllerProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onA: () => void;
  onB: () => void;
  onSelect: () => void;
  onStart: () => void;
  onTurboZap: () => void;
  onSelectChannelNumber?: (num: number) => void;
  isPlaying?: boolean;
  isMuted?: boolean;
}

export const TouchController: React.FC<TouchControllerProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onA,
  onB,
  onSelect,
  onStart,
  onTurboZap,
  onSelectChannelNumber,
  isPlaying = true,
  isMuted = false,
}) => {
  const [numInput, setNumInput] = useState<string>('');

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch (_) {}
    }
  };

  const handleNumPress = (digit: string) => {
    triggerHaptic();
    soundEffects.playBeep(400 + parseInt(digit, 10) * 30, 0.04);
    const updated = (numInput + digit).slice(-3);
    setNumInput(updated);

    if (onSelectChannelNumber) {
      const parsed = parseInt(updated, 10);
      if (!isNaN(parsed)) {
        onSelectChannelNumber(parsed);
      }
    }
  };

  const handleNumClear = () => {
    soundEffects.playBeep(300, 0.05);
    setNumInput('');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-zinc-950/95 border-2 border-zinc-800 p-3 rounded-xl select-none touch-manipulation">
      {/* Top Controller Brand Stripe */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[9px] font-pixel text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
          <span className="text-zinc-400">MANDO ARCADE 8-BIT • TURBO PAD</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span>{numInput ? `CH INTRO: [ ${numInput} ]` : 'DIGITAL TOUCH ENGINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 my-auto">
        {/* Left: 8-Bit D-Pad Cross */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[8px] font-pixel text-zinc-400 mb-1">CANAL (CH) & VOL</div>
          <div className="relative w-32 h-32 bg-zinc-900 rounded-full border-4 border-zinc-950 p-2 flex items-center justify-center shadow-inner">
            {/* D-Pad Center Cross Background */}
            <div className="absolute w-24 h-8 bg-zinc-800 rounded-sm" />
            <div className="absolute w-8 h-24 bg-zinc-800 rounded-sm" />

            {/* UP Button (Next Channel) */}
            <button
              onClick={() => {
                triggerHaptic();
                soundEffects.playBeep(520, 0.05);
                onUp();
              }}
              aria-label="Canal Siguiente"
              className="absolute top-1.5 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-zinc-200 active:text-white rounded-t-md flex flex-col items-center justify-center border-t-2 border-x-2 border-zinc-950 shadow active:translate-y-0.5 transition-all"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-[6px] font-pixel">CH+</span>
            </button>

            {/* DOWN Button (Prev Channel) */}
            <button
              onClick={() => {
                triggerHaptic();
                soundEffects.playBeep(420, 0.05);
                onDown();
              }}
              aria-label="Canal Anterior"
              className="absolute bottom-1.5 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-zinc-200 active:text-white rounded-b-md flex flex-col items-center justify-center border-b-2 border-x-2 border-zinc-950 shadow active:translate-y-0.5 transition-all"
            >
              <span className="text-[6px] font-pixel">CH-</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* LEFT Button (Vol Down) */}
            <button
              onClick={() => {
                triggerHaptic();
                soundEffects.playBeep(380, 0.05);
                onLeft();
              }}
              aria-label="Bajar Volumen"
              className="absolute left-1.5 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 text-zinc-200 active:text-white rounded-l-md flex flex-col items-center justify-center border-l-2 border-y-2 border-zinc-950 shadow active:translate-x-0.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[5px] font-pixel">VOL-</span>
            </button>

            {/* RIGHT Button (Vol Up) */}
            <button
              onClick={() => {
                triggerHaptic();
                soundEffects.playBeep(480, 0.05);
                onRight();
              }}
              aria-label="Subir Volumen"
              className="absolute right-1.5 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 text-zinc-200 active:text-white rounded-r-md flex flex-col items-center justify-center border-r-2 border-y-2 border-zinc-950 shadow active:translate-x-0.5 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-[5px] font-pixel">VOL+</span>
            </button>

            {/* Center Pivot */}
            <div className="relative w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 shadow-inner" />
          </div>
        </div>

        {/* Center: System & Turbo Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Turbo Zap Button */}
          <button
            onClick={() => {
              triggerHaptic();
              onTurboZap();
            }}
            className="w-full max-w-[180px] bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 active:scale-95 text-zinc-950 font-pixel text-[9px] py-2 px-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-center gap-1.5 font-bold tracking-wider"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-bounce" />
            <span>TURBO ZAP ALEATORIO</span>
          </button>

          {/* Select & Start Pill Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  triggerHaptic();
                  soundEffects.playBeep(330, 0.06);
                  onSelect();
                }}
                className="w-12 h-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 rounded-full border-2 border-black shadow-[0_2px_0_#000] -rotate-12 active:translate-y-0.5"
              />
              <span className="font-pixel text-[7px] text-zinc-400 mt-0.5">SELECT (EPG)</span>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  triggerHaptic();
                  soundEffects.playBeep(660, 0.06);
                  onStart();
                }}
                className="w-12 h-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 rounded-full border-2 border-black shadow-[0_2px_0_#000] -rotate-12 active:translate-y-0.5"
              />
              <span className="font-pixel text-[7px] text-zinc-400 mt-0.5">START (PLAY)</span>
            </div>
          </div>
        </div>

        {/* Right: Arcade A / B Action Buttons */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[8px] font-pixel text-zinc-400 mb-1">ACCIONES A / B</div>
          <div className="relative w-32 h-32 bg-zinc-900 rounded-full border-4 border-zinc-950 p-2 flex items-center justify-center shadow-inner">
            {/* Diagonal Button Array */}
            <div className="flex items-center gap-3 rotate-[-25deg]">
              {/* Button B (Mute/OSD) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    triggerHaptic();
                    soundEffects.playBeep(350, 0.08);
                    onB();
                  }}
                  className={`w-10 h-10 rounded-full border-3 border-black font-pixel text-xs text-white flex items-center justify-center shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all ${
                    isMuted ? 'bg-amber-600' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  B
                </button>
                <span className="font-pixel text-[6px] text-zinc-400 mt-1 rotate-[25deg]">
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </span>
              </div>

              {/* Button A (Play/Pause/OK) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    triggerHaptic();
                    soundEffects.playBeep(700, 0.08);
                    onA();
                  }}
                  className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 border-3 border-black font-pixel text-xs text-zinc-950 flex items-center justify-center shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  A
                </button>
                <span className="font-pixel text-[6px] text-zinc-400 mt-1 rotate-[25deg]">
                  {isPlaying ? 'PAUSA' : 'PLAY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Direct NumPad Channel Selector */}
      <div className="pt-2 border-t border-zinc-800">
        <div className="text-[8px] font-pixel text-zinc-500 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-emerald-400" />
            MARCADOR DIRECTO DE CANAL:
          </span>
          {numInput && (
            <button
              onClick={handleNumClear}
              className="text-[7px] text-amber-400 hover:text-amber-300 font-pixel"
            >
              BORRAR ({numInput})
            </button>
          )}
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleNumPress(digit)}
              className="py-1 bg-zinc-900 hover:bg-emerald-600 hover:text-zinc-950 active:bg-emerald-400 text-zinc-200 border border-zinc-700 rounded font-pixel text-[9px] font-bold transition-colors"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleNumClear}
            className="py-1 bg-zinc-800 hover:bg-red-600 text-zinc-300 border border-zinc-700 rounded font-pixel text-[8px]"
          >
            CLR
          </button>
        </div>
      </div>
    </div>
  );
};
