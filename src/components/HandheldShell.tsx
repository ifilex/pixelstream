import React from 'react';
import { 
  Gamepad2, 
  Tv, 
  Tablet, 
  Monitor, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Power, 
  Sliders, 
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export type DeviceFrameType = 'frameless' | 'handheld_dmg' | 'arcade_cabinet' | 'retro_tablet' | 'crt_tv';

interface HandheldShellProps {
  children: React.ReactNode;
  frameType: DeviceFrameType;
  onSelectFrame: (frame: DeviceFrameType) => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  showControls?: boolean;
  onToggleControls?: () => void;
}

export const HandheldShell: React.FC<HandheldShellProps> = ({
  children,
  frameType,
  crtEnabled,
}) => {
  // Ultra-embedded frameless is 100% full-bleed inside the container
  if (frameType === 'frameless') {
    return (
      <div className="w-full h-full min-h-0 flex flex-col overflow-hidden rounded-lg">
        {children}
      </div>
    );
  }

  // Streamlined Retro Portátil Shell
  if (frameType === 'handheld_dmg') {
    return (
      <div className="w-full h-full min-h-0 flex flex-col bg-zinc-900 border-2 sm:border-4 border-zinc-950 rounded-2xl p-1.5 sm:p-2 shadow-2xl relative overflow-hidden">
        {/* Top Cartridge Header Strip */}
        <div className="flex items-center justify-between px-2 py-0.5 mb-1 bg-zinc-950/80 rounded border border-zinc-800 text-[8px] font-pixel text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
            <span className="text-zinc-200 font-bold tracking-wider">PIXELBOY ADVANCE HD</span>
          </div>
          <span className="text-amber-400">8-BIT STEREO</span>
        </div>

        {/* Video Canvas Container */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-lg">
          {children}
        </div>
      </div>
    );
  }

  // Streamlined Mini Arcade Shell
  if (frameType === 'arcade_cabinet') {
    return (
      <div className="w-full h-full min-h-0 flex flex-col bg-zinc-900 border-2 sm:border-4 border-red-950 rounded-2xl p-1.5 sm:p-2 shadow-[0_10px_30px_rgba(239,68,68,0.2)] relative overflow-hidden">
        {/* Arcade Marquee Strip */}
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 py-0.5 px-2 rounded border border-black mb-1 text-center shrink-0">
          <h3 className="font-pixel text-[9px] text-black font-extrabold tracking-widest">
            ★ PIXELSTREAM 8-BIT ARCADE ★
          </h3>
        </div>

        {/* Screen */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-lg">
          {children}
        </div>
      </div>
    );
  }

  // Streamlined Tablet Shell
  if (frameType === 'retro_tablet') {
    return (
      <div className="w-full h-full min-h-0 flex flex-col bg-zinc-900 border-2 sm:border-4 border-zinc-800 rounded-2xl p-1.5 sm:p-2 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 pb-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-700" />
          <span className="w-10 h-0.5 bg-zinc-950 rounded-full" />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden rounded-lg">
          {children}
        </div>
      </div>
    );
  }

  // CRT TV Frame
  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-zinc-950 border-2 sm:border-4 border-emerald-950/80 rounded-xl p-1.5 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between px-2 py-0.5 mb-1 bg-zinc-900 rounded border border-emerald-900/60 text-[8px] font-pixel text-emerald-400 shrink-0">
        <span>TRINITRON CRT COLOR MONITOR</span>
        <span>RGB 15kHz</span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden rounded-lg">
        {children}
      </div>
    </div>
  );
};
