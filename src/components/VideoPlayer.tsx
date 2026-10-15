import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Tv, 
  ChevronRight, 
  ChevronLeft, 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  Download,
  Info,
  Clock,
  Layers,
  Zap,
  RotateCcw,
  Sliders,
  Smartphone,
  Hash,
  Cast,
  X
} from 'lucide-react';
import { Channel, VideoContent, ParentalSettings, BatteryOptimizationSettings } from '../types';
import { soundEffects } from '../services/soundEffects';

interface VideoPlayerProps {
  currentChannel: Channel | null;
  currentVod: VideoContent | null;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onSelectChannelNumber: (num: number) => void;
  parentalSettings: ParentalSettings;
  batterySettings: BatteryOptimizationSettings;
  crtEnabled: boolean;
  onDownloadVod?: (vod: VideoContent) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentChannel,
  currentVod,
  onNextChannel,
  onPrevChannel,
  onSelectChannelNumber,
  parentalSettings,
  batterySettings,
  crtEnabled,
  onDownloadVod,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | 'fit'>('16:9');
  const [isZapping, setIsZapping] = useState<boolean>(false);
  
  // OSD Info Hud: automatically hides after 3.5 seconds on channel change
  const [showInfoHud, setShowInfoHud] = useState<boolean>(true);
  const [showNumPad, setShowNumPad] = useState<boolean>(false);
  const [typedChannelNum, setTypedChannelNum] = useState<string>('');
  const [isLockedByParental, setIsLockedByParental] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<'live' | 'buffering' | 'error' | 'reconnecting'>('live');
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);
  const [showControlsOverlay, setShowControlsOverlay] = useState<boolean>(true);

  // Touch gesture tracking
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const lastTapTime = useRef<number>(0);

  const currentStreamUrl = currentVod ? currentVod.videoUrl : currentChannel?.streamUrl || '';
  const currentTitle = currentVod ? currentVod.title : currentChannel ? currentChannel.currentShow.title : 'PixelStream IPTV';
  const currentChannelName = currentChannel ? currentChannel.name : currentVod ? currentVod.title : 'PixelStream';
  const currentCategory = currentVod ? currentVod.category : currentChannel?.category || 'retro_gaming';
  const currentRating = currentVod ? currentVod.rating : currentChannel?.rating || 'G';

  // Check parental rating lockdown
  useEffect(() => {
    const itemRating = currentChannel ? currentChannel.rating : currentVod ? currentVod.rating : 'G';
    const ratingHierarchy: Record<string, number> = { 'G': 1, 'PG': 2, 'PG-13': 3, '18+': 4 };
    const maxRatingVal = ratingHierarchy[parentalSettings.maxAllowedRating] || 3;
    const currentRatingVal = ratingHierarchy[itemRating] || 1;

    if (parentalSettings.enabled && currentRatingVal > maxRatingVal) {
      setIsLockedByParental(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      setIsLockedByParental(false);
    }
  }, [currentChannel, currentVod, parentalSettings]);

  // Channel switch static zap sound & AUTO-HIDE OSD info HUD in max 3.5 seconds
  useEffect(() => {
    setIsZapping(true);
    setStreamStatus('buffering');
    setShowInfoHud(true);
    soundEffects.playZap();

    // Clear any existing timer
    if (hudTimerRef.current) {
      clearTimeout(hudTimerRef.current);
    }

    // Static zapping effect duration
    const zapTimer = setTimeout(() => {
      setIsZapping(false);
    }, 300);

    // Auto-hide channel OSD badge after 3.5 seconds (max 5s requirement)
    hudTimerRef.current = setTimeout(() => {
      setShowInfoHud(false);
    }, 3500);

    return () => {
      clearTimeout(zapTimer);
      if (hudTimerRef.current) {
        clearTimeout(hudTimerRef.current);
      }
    };
  }, [currentChannel?.id, currentVod?.id]);

  // Setup HLS.js or native playback for .m3u8 live feeds
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStreamUrl || isLockedByParental) return;

    // Clean up previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = currentStreamUrl.includes('.m3u8') || currentStreamUrl.includes('manifest');

    if (isHlsStream) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxBufferLength: 20,
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 2,
        });

        hlsRef.current = hls;
        hls.loadSource(currentStreamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStreamStatus('live');
          video.play().catch(() => {
            setIsPlaying(false);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setStreamStatus('reconnecting');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setStreamStatus('reconnecting');
                hls.recoverMediaError();
                break;
              default:
                setStreamStatus('error');
                if (currentChannel?.backupStreamUrl && video.src !== currentChannel.backupStreamUrl) {
                  video.src = currentChannel.backupStreamUrl;
                  video.play().catch(() => {});
                }
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari iOS / Mac
        video.src = currentStreamUrl;
        video.addEventListener('loadedmetadata', () => {
          setStreamStatus('live');
          video.play().catch(() => {
            setIsPlaying(false);
          });
        });
      } else {
        video.src = currentStreamUrl;
      }
    } else {
      video.src = currentStreamUrl;
      video.load();
      video.play().catch(() => {
        setIsPlaying(false);
      });
      setStreamStatus('live');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStreamUrl, isLockedByParental, currentChannel?.backupStreamUrl]);

  // Touch Gesture handlers on video container
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const now = Date.now();
      // Double tap detector
      if (now - lastTapTime.current < 300 && distance < 20) {
        toggleFullscreen();
        showFeedback('PANTALLA COMPLETA');
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      // Swipe Gestures
      if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < 0) {
          onNextChannel();
          showFeedback('CANAL SIGUIENTE ▲');
        } else {
          onPrevChannel();
          showFeedback('CANAL ANTERIOR ▼');
        }
      } else if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          changeVolumeBy(0.15);
          showFeedback('VOLUMEN + 🔊');
        } else {
          changeVolumeBy(-0.15);
          showFeedback('VOLUMEN - 🔉');
        }
      }
    }
  };

  const showFeedback = (text: string) => {
    setTouchFeedback(text);
    setTimeout(() => {
      setTouchFeedback(null);
    }, 1000);
  };

  const changeVolumeBy = (delta: number) => {
    const newVol = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    soundEffects.playBeep(440, 0.05);
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    soundEffects.playBeep(330, 0.05);
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    soundEffects.playBeep(600, 0.05);
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // PiP (Picture-in-Picture)
  const togglePiP = async () => {
    soundEffects.playBeep(550, 0.05);
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (_) {}
  };

  // Trigger HUD on user interaction
  const triggerBriefHud = () => {
    setShowInfoHud(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setShowInfoHud(false);
    }, 3500);
  };

  // Channel Numpad submit
  const handleNumPadDigit = (digit: string) => {
    soundEffects.playBeep(300 + parseInt(digit || '0') * 40, 0.04);
    if (typedChannelNum.length < 3) {
      const next = typedChannelNum + digit;
      setTypedChannelNum(next);
      if (next.length === 3) {
        onSelectChannelNumber(parseInt(next));
        setTypedChannelNum('');
        setShowNumPad(false);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-0 flex flex-col bg-black rounded-lg overflow-hidden relative group select-none shadow-2xl border border-zinc-800/80"
      onClick={triggerBriefHud}
    >
      {/* Video Screen Area - Maximized & Embedded */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full flex-1 min-h-0 bg-black overflow-hidden flex items-center justify-center ${
          crtEnabled ? 'crt-overlay crt-screen-flicker' : ''
        }`}
      >
        {/* Static Zapping Noise when changing channels */}
        {isZapping && (
          <div className="absolute inset-0 z-30 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-3">
            <div className="font-pixel text-emerald-400 text-xs sm:text-sm animate-pulse mb-1">
              * SINTONIZANDO SEÑAL *
            </div>
            <p className="font-vt text-zinc-400 text-xs">
              {currentChannel ? `CANAL ${currentChannel.number}: ${currentChannel.name}` : currentVod?.title}
            </p>
            <div className="w-24 h-1.5 bg-zinc-800 border border-emerald-500 mt-2 overflow-hidden rounded">
              <div className="w-full h-full bg-emerald-500 animate-[pulse_0.15s_infinite]" />
            </div>
          </div>
        )}

        {/* Parental Rating Lock Screen */}
        {isLockedByParental ? (
          <div className="absolute inset-0 z-30 bg-zinc-950 flex flex-col items-center justify-center text-center p-4 border-2 border-red-900/50">
            <div className="w-10 h-10 bg-red-950 text-red-500 flex items-center justify-center rounded-lg border border-red-600 mb-2 animate-bounce">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-xs text-red-400 mb-1">
              [ CONTENIDO BLOQUEADO ]
            </h3>
            <p className="font-vt text-zinc-300 text-xs max-w-sm mb-3">
              Clasificación <span className="text-amber-400 font-bold">{currentRating}</span> (Máx permitido: {parentalSettings.maxAllowedRating}).
            </p>
            <div className="font-pixel text-[8px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              DESBLOQUEA EN EL ICONO DE ESCUDO SUPERIOR (PIN 1984)
            </div>
          </div>
        ) : (
          /* Real Video Stream */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className={`w-full h-full ${aspectRatio === 'fit' ? 'object-contain' : aspectRatio === '4:3' ? 'aspect-[4/3] object-contain' : 'object-cover'}`}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setStreamStatus('buffering')}
            onPlaying={() => setStreamStatus('live')}
          />
        )}

        {/* Touch Gesture On-Screen Feedback Badge */}
        {touchFeedback && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-zinc-950/90 border border-emerald-400 text-emerald-300 px-3 py-1.5 font-pixel text-[10px] rounded shadow-2xl animate-bounce">
            {touchFeedback}
          </div>
        )}

        {/* STREAMLINE CHANNEL INFO OSD - AUTO-HIDES IN 3.5s (Non-blocking & Compact) */}
        {showInfoHud && !isZapping && !isLockedByParental && (
          <div className="absolute top-2 left-2 z-30 transition-all duration-300 pointer-events-auto animate-fadeIn">
            <div className="bg-zinc-950/85 backdrop-blur-md border border-emerald-500/70 p-2 sm:p-2.5 text-emerald-300 max-w-[280px] sm:max-w-sm shadow-[0_4px_20px_rgba(0,0,0,0.8)] rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-pixel text-[9px] sm:text-[10px] text-emerald-400 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                  <span className="font-bold text-amber-300 shrink-0">
                    {currentChannel ? `CH ${currentChannel.number}` : 'VOD'}
                  </span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-100 truncate font-semibold">
                    {currentChannel ? currentChannel.name : currentVod?.title}
                  </span>
                </div>
                
                {/* Instant dismiss button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfoHud(false);
                  }}
                  className="text-zinc-500 hover:text-zinc-200 p-0.5"
                  title="Cerrar info"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {currentChannel && currentChannel.currentShow?.title && (
                <p className="font-vt text-zinc-300 text-xs mt-0.5 line-clamp-1">
                  {currentChannel.currentShow.title}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-1 font-pixel text-[7px] sm:text-[8px] text-zinc-400">
                <span className="text-cyan-400">{currentChannel ? currentChannel.resolution : 'HD'}</span>
                <span>•</span>
                <span className="text-amber-400">{currentRating}</span>
                <span>•</span>
                <span className="text-zinc-500">IPTV-ORG</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Channel Numpad Modal */}
        {showNumPad && (
          <div className="absolute inset-0 z-40 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
            <div className="bg-zinc-900 border-2 border-amber-500/70 p-3 rounded-xl max-w-xs w-full shadow-2xl">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-700 mb-2">
                <span className="font-pixel text-[9px] text-amber-400">SINTONIZAR NÚMERO DE CANAL</span>
                <button
                  onClick={() => setShowNumPad(false)}
                  className="text-zinc-500 hover:text-white font-pixel text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="bg-black border border-emerald-500/50 p-1.5 text-center font-pixel text-base text-emerald-300 mb-2.5 rounded">
                CANAL: {typedChannelNum || '___'}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'OK'].map((btn) => (
                  <button
                    key={btn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (btn === 'CLR') setTypedChannelNum('');
                      else if (btn === 'OK') {
                        if (typedChannelNum) onSelectChannelNumber(parseInt(typedChannelNum));
                        setShowNumPad(false);
                        setTypedChannelNum('');
                      } else {
                        handleNumPadDigit(btn);
                      }
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 text-white font-pixel text-xs py-2 rounded border border-zinc-700 active:scale-95 transition-all"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Compact Playback Bottom Bar */}
      <div className="bg-zinc-950/95 border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-between gap-1.5 shrink-0 z-20">
        {/* Left: Play/Pause, Channel navigation, Volume */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-pixel text-[9px] rounded flex items-center gap-1 font-bold shadow-[0_0_6px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
            title={isPlaying ? 'Pausa' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline text-[8px]">{isPlaying ? 'PAUSA' : 'PLAY'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playBeep(450, 0.04);
              onPrevChannel();
            }}
            title="Canal Anterior (Swipe Down)"
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-pixel text-[8px] rounded border border-zinc-700 flex items-center gap-0.5 active:scale-95"
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="hidden md:inline">CH-</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playBeep(520, 0.04);
              onNextChannel();
            }}
            title="Canal Siguiente (Swipe Up)"
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-pixel text-[8px] rounded border border-zinc-700 flex items-center gap-0.5 active:scale-95"
          >
            <span className="hidden md:inline">CH+</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-1 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }} 
              className="text-zinc-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
              className="w-12 sm:w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Center Live Ticker (Compact) */}
        <div className="hidden lg:flex items-center gap-1.5 text-zinc-400 font-vt text-xs truncate max-w-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${streamStatus === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-emerald-300 font-bold truncate">
            {currentChannel ? `[${currentChannel.number}] ${currentChannel.name}` : currentVod?.title}
          </span>
        </div>

        {/* Right: Aspect, Numpad, OSD, PiP, Fullscreen */}
        <div className="flex items-center gap-1">
          {/* Numpad toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playBeep(500, 0.04);
              setShowNumPad(!showNumPad);
            }}
            title="Teclado Numérico Directo"
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-pixel text-[8px] rounded border border-zinc-700 flex items-center gap-1"
          >
            <Hash className="w-3 h-3" />
            <span className="hidden sm:inline">NUM</span>
          </button>

          {/* Aspect Ratio */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playBeep(480, 0.04);
              setAspectRatio(prev => prev === '16:9' ? '4:3' : prev === '4:3' ? 'fit' : '16:9');
            }}
            title="Relación de Aspecto (16:9 / 4:3 / Ajuste)"
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-pixel text-[8px] rounded border border-zinc-700 hidden sm:block"
          >
            {aspectRatio.toUpperCase()}
          </button>

          {/* OSD Info Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playBeep(400, 0.04);
              setShowInfoHud(!showInfoHud);
            }}
            title="Mostrar / Ocultar Info de Canal"
            className={`p-1 rounded border text-[8px] font-pixel transition-colors ${
              showInfoHud ? 'bg-emerald-950 border-emerald-600 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Info className="w-3 h-3" />
          </button>

          {/* PiP */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePiP();
            }}
            title="Picture-in-Picture"
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-pixel text-[8px] rounded border border-zinc-800 hidden sm:flex items-center"
          >
            <Cast className="w-3 h-3" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            title="Pantalla Completa"
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-pixel text-[8px] rounded border border-zinc-700 flex items-center"
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
