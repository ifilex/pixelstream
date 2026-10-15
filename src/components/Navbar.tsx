import React from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Shield, 
  ShieldAlert, 
  Wifi, 
  Mic, 
  Bell, 
  BatteryMedium, 
  Glasses, 
  Download, 
  Lock, 
  Sparkles, 
  Film,
  Gamepad2,
  Zap,
  Globe2
} from 'lucide-react';
import { UserProfile, ParentalSettings, BatteryOptimizationSettings } from '../types';
import { soundEffects } from '../services/soundEffects';

interface NavbarProps {
  activeTab: 'live_tv' | 'vod' | 'ai_recommendations' | 'downloads' | 'devices' | 'ar_room' | 'controller';
  setActiveTab: (tab: 'live_tv' | 'vod' | 'ai_recommendations' | 'downloads' | 'devices' | 'ar_room' | 'controller') => void;
  activeProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (prof: UserProfile) => void;
  parentalSettings: ParentalSettings;
  onOpenParentalModal: () => void;
  batterySettings: BatteryOptimizationSettings;
  onOpenBatteryModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenNotifications: () => void;
  onOpenSecurityModal: () => void;
  onOpenAccessibilityModal: () => void;
  unreadNotifsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  currentChannelNumber?: number;
  onTurboZap: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeProfile,
  profiles,
  onSelectProfile,
  parentalSettings,
  onOpenParentalModal,
  batterySettings,
  onOpenBatteryModal,
  onOpenVoiceModal,
  onOpenNotifications,
  onOpenSecurityModal,
  onOpenAccessibilityModal,
  unreadNotifsCount,
  soundEnabled,
  onToggleSound,
  crtEnabled,
  onToggleCrt,
  currentChannelNumber,
  onTurboZap
}) => {
  return (
    <header className="shrink-0 z-40 bg-zinc-950 border-b-2 border-emerald-950 px-2 sm:px-3 py-1.5 text-emerald-400">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Brand & Live Channel Marker */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              soundEffects.playCoin();
              setActiveTab('live_tv');
            }}
            className="flex items-center gap-1.5 group text-left"
          >
            <div className="w-7 h-7 bg-emerald-500 text-zinc-950 font-pixel text-xs flex items-center justify-center rounded border border-black group-hover:bg-emerald-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-pixel text-xs sm:text-sm tracking-wider text-emerald-300">
                  PIXEL<span className="text-amber-400">STREAM</span>
                </span>
                <span className="px-1 py-0.2 bg-emerald-950 text-emerald-400 font-pixel text-[8px] border border-emerald-800 rounded">
                  8-BIT
                </span>
              </div>
              <p className="font-vt text-[10px] text-zinc-400 leading-tight hidden sm:block">
                IPTV LEGAL COCKPIT • {currentChannelNumber ? `CANAL ${currentChannelNumber}` : 'ONLINE'}
              </p>
            </div>
          </button>
        </div>

        {/* Studio Center Quick-Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin py-0.5">
          <button
            onClick={() => {
              soundEffects.playBeep(520, 0.04);
              setActiveTab('live_tv');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'live_tv'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-[0_0_6px_#10b981]'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>CANALES</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(560, 0.04);
              setActiveTab('vod');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'vod'
                ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-[0_0_6px_#06b6d4]'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>CINE & VOD</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(580, 0.04);
              setActiveTab('controller');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'controller'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_6px_#f59e0b]'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Gamepad2 className="w-3 h-3" />
            <span className="hidden sm:inline">MANDO</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(600, 0.04);
              setActiveTab('ai_recommendations');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'ai_recommendations'
                ? 'bg-purple-500 text-zinc-950 border-purple-400 font-bold shadow-[0_0_6px_#a855f7]'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>IA</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(640, 0.04);
              setActiveTab('downloads');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'downloads'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_6px_#f59e0b]'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">BÓVEDA</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(680, 0.04);
              setActiveTab('devices');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] hidden md:flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'devices'
                ? 'bg-blue-500 text-zinc-950 border-blue-400 font-bold'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>SYNC</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(720, 0.04);
              setActiveTab('ar_room');
            }}
            className={`px-2 py-1 rounded font-pixel text-[9px] sm:text-[10px] hidden lg:flex items-center gap-1 border transition-all whitespace-nowrap ${
              activeTab === 'ar_room'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <Glasses className="w-3 h-3" />
            <span>SALA RETRO</span>
          </button>
        </div>

        {/* Right Quick Controls & Modals Trigger Bar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Turbo Zap Button */}
          <button
            onClick={onTurboZap}
            title="Turbo Zap: Sintoniza canal aleatorio"
            className="px-2 py-1 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 rounded font-pixel text-[9px] font-bold flex items-center gap-1 shadow-[0_0_6px_#ef4444] active:scale-95 transition-all"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">TURBO ZAP</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar Efectos 8-Bit' : 'Activar Sonido 8-Bit'}
            className={`p-1 rounded border transition-colors ${
              soundEnabled 
                ? 'bg-zinc-900 border-emerald-600 text-emerald-400' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={onToggleCrt}
            title="Efecto CRT Trinitron"
            className={`px-1.5 py-1 rounded border font-pixel text-[8px] hidden sm:block ${
              crtEnabled
                ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            CRT: {crtEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Parental Modal Button */}
          <button
            onClick={onOpenParentalModal}
            title="Control Parental & Filtro 18+"
            className={`p-1 rounded border ${
              parentalSettings.enabled
                ? 'bg-red-950/80 border-red-500 text-red-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-400'
            }`}
          >
            {parentalSettings.enabled ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
          </button>

          {/* Voice Assistant Button */}
          <button
            onClick={onOpenVoiceModal}
            title="Control por Voz & Comandos IA"
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-purple-400 hover:border-purple-500"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Battery Optimization Modal */}
          <button
            onClick={onOpenBatteryModal}
            title="Gestión de Batería y FPS"
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 hover:border-amber-500 hidden sm:block"
          >
            <BatteryMedium className="w-3.5 h-3.5" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            title="Centro de Notificaciones y Estrenos"
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 relative"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-zinc-950 font-pixel text-[7px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Profile Switcher */}
          <select
            value={activeProfile.id}
            onChange={(e) => {
              const selected = profiles.find(p => p.id === e.target.value);
              if (selected) onSelectProfile(selected);
            }}
            aria-label="Perfil de usuario"
            className="bg-zinc-900 border border-zinc-700 text-emerald-300 font-pixel text-[8px] sm:text-[9px] py-1 px-1.5 rounded focus:outline-none focus:border-emerald-500"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.avatar} {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
