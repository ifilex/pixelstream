import React, { useState, useEffect, useRef } from 'react';
import { 
  Glasses, 
  Lightbulb, 
  Tv, 
  Volume2, 
  VolumeX, 
  Radio, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Channel, VideoContent } from '../types';
import { soundEffects } from '../services/soundEffects';

interface InmersiveRetroRoomProps {
  currentChannel: Channel | null;
  currentVod: VideoContent | null;
  onNextChannel: () => void;
  onPrevChannel: () => void;
}

export const InmersiveRetroRoom: React.FC<InmersiveRetroRoomProps> = ({
  currentChannel,
  currentVod,
  onNextChannel,
  onPrevChannel,
}) => {
  const [lightsMode, setLightsMode] = useState<'neon_arcade' | 'warm_vintage' | 'dark_cinema'>('neon_arcade');
  const [ambientAudioOn, setAmbientAudioOn] = useState<boolean>(false);
  const [isTvOn, setIsTvOn] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStreamUrl = currentVod ? currentVod.videoUrl : currentChannel?.streamUrl || '';
  const currentTitle = currentVod ? currentVod.title : currentChannel ? currentChannel.name : 'PixelStream TV';

  const toggleLights = () => {
    soundEffects.playBeep(600, 0.05);
    setLightsMode(prev => {
      if (prev === 'neon_arcade') return 'warm_vintage';
      if (prev === 'warm_vintage') return 'dark_cinema';
      return 'neon_arcade';
    });
  };

  return (
    <div className="w-full bg-zinc-950 border-4 border-zinc-950 p-3 sm:p-5 shadow-[4px_4px_0px_#000] relative overflow-hidden">
      {/* Header & AR Room Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-800 relative z-20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-400 text-zinc-950 flex items-center justify-center font-pixel text-xs">
              <Glasses className="w-4 h-4" />
            </div>
            <h2 className="font-pixel text-xs sm:text-sm text-emerald-400">
              SALA RETRO ARCADE INMERSIVA (AR 8-BIT)
            </h2>
          </div>
          <p className="font-vt text-zinc-400 text-sm mt-0.5">
            Experiencia inmersiva en habitación retro de los 80s con televisor de tubo CRT y ambientación neón.
          </p>
        </div>

        {/* Room Controls */}
        <div className="flex items-center gap-2">
          {/* Lights Switch */}
          <button
            onClick={toggleLights}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-2 border-amber-700 font-pixel text-[9px] flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>LUZ: {lightsMode.replace('_', ' ').toUpperCase()}</span>
          </button>

          {/* TV Power */}
          <button
            onClick={() => {
              soundEffects.playZap();
              setIsTvOn(!isTvOn);
            }}
            className={`px-3 py-1.5 font-pixel text-[9px] border-2 ${
              isTvOn
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : 'bg-red-950 text-red-400 border-red-800'
            }`}
          >
            TV: {isTvOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 3D Isometric / Thematic 80s Living Room Canvas */}
      <div 
        className={`mt-4 relative min-h-[480px] sm:min-h-[580px] rounded-xl overflow-hidden border-4 border-black transition-colors duration-500 flex items-center justify-center ${
          lightsMode === 'neon_arcade'
            ? 'bg-gradient-to-b from-indigo-950 via-purple-950 to-zinc-950'
            : lightsMode === 'warm_vintage'
            ? 'bg-gradient-to-b from-amber-950/80 via-yellow-950/40 to-zinc-950'
            : 'bg-zinc-950'
        }`}
      >
        {/* Retro Wallpaper Grid & Wall Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Ambient Neon Wall Lamps */}
        {lightsMode === 'neon_arcade' && (
          <>
            <div className="absolute top-10 left-10 w-40 h-40 bg-pink-500/20 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-10 right-10 w-40 h-40 bg-cyan-500/20 blur-3xl pointer-events-none rounded-full" />
          </>
        )}

        {/* Wall Posters */}
        <div className="absolute top-6 left-6 hidden sm:block w-20 h-28 bg-zinc-900 border-2 border-pink-500 shadow-[2px_2px_0px_#000] p-1 text-center font-pixel text-[6px] text-pink-400 rotate-[-4deg]">
          <div className="w-full h-16 bg-pink-950 flex items-center justify-center text-xl mb-1">
            👾
          </div>
          <span>SPACE INVADERS '78</span>
        </div>

        <div className="absolute top-6 right-6 hidden sm:block w-20 h-28 bg-zinc-900 border-2 border-cyan-500 shadow-[2px_2px_0px_#000] p-1 text-center font-pixel text-[6px] text-cyan-400 rotate-[4deg]">
          <div className="w-full h-16 bg-cyan-950 flex items-center justify-center text-xl mb-1">
            🕹️
          </div>
          <span>CYBER RUNNER 1988</span>
        </div>

        {/* The Central CRT Wooden/Plastic TV Console */}
        <div className="relative z-10 w-full max-w-xl mx-auto p-4 sm:p-6 flex flex-col items-center">
          {/* Television Chassis */}
          <div className="w-full bg-stone-900 border-[10px] sm:border-[16px] border-amber-950 rounded-2xl p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_3px_5px_rgba(255,255,255,0.15)] relative">
            {/* Screen Glass Curve Container */}
            <div className="relative aspect-[4/3] w-full bg-black rounded-xl overflow-hidden border-4 border-zinc-950 crt-overlay crt-screen-flicker">
              {isTvOn ? (
                <video
                  ref={videoRef}
                  src={currentStreamUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-center">
                  <div className="w-4 h-4 rounded-full bg-zinc-800 mb-2" />
                  <span className="font-pixel text-[10px] text-zinc-700">STANDBY</span>
                </div>
              )}

              {/* In-Screen Channel Stamp */}
              {isTvOn && (
                <div className="absolute top-3 left-3 bg-zinc-950/80 px-2 py-1 border border-emerald-600 font-pixel text-[9px] text-emerald-400">
                  {currentChannel ? `CH ${currentChannel.number}` : 'VOD CINEMA'}
                </div>
              )}
            </div>

            {/* TV Front Panel Knobs & Speaker Grille */}
            <div className="mt-3 flex items-center justify-between px-2 pt-2 border-t-2 border-amber-950/60 font-pixel text-[9px] text-zinc-400">
              <div className="flex items-center gap-3">
                {/* Vintage Dials */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-[7px] text-zinc-300">
                    VOL
                  </div>
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-[7px] text-zinc-300">
                    TUNE
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="w-12 h-1 bg-zinc-800 rounded-full" />
                  <span className="w-12 h-1 bg-zinc-800 rounded-full" />
                  <span className="w-12 h-1 bg-zinc-800 rounded-full" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-vt text-sm text-amber-300">TRINITRON-COLOR</span>
              </div>
            </div>
          </div>

          {/* Retro TV Table Wooden Stand */}
          <div className="w-3/4 h-8 bg-amber-950 border-t-4 border-amber-900 mx-auto shadow-2xl flex justify-between px-6">
            <div className="w-4 h-12 bg-amber-950 -mt-1 shadow-lg" />
            <div className="w-4 h-12 bg-amber-950 -mt-1 shadow-lg" />
          </div>

          {/* Interactive Vintage Remote Control On Floor */}
          <div className="mt-4 bg-zinc-900 border-2 border-zinc-700 p-2 rounded shadow-lg flex items-center gap-2 font-pixel text-[9px]">
            <span className="text-zinc-500 font-vt text-sm">MANDO A DISTANCIA:</span>
            <button
              onClick={() => {
                soundEffects.playZap();
                onPrevChannel();
              }}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600"
            >
              ◀ CH -
            </button>
            <button
              onClick={() => {
                soundEffects.playZap();
                onNextChannel();
              }}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600"
            >
              CH + ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
