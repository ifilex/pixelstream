import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Channel, 
  VideoContent, 
  UserProfile, 
  ParentalSettings, 
  BatteryOptimizationSettings, 
  DownloadedItem, 
  ConnectedDevice, 
  NotificationItem 
} from './types';
import { VOD_CATALOG } from './data/channelsData';
import { IPTVOrgService, IPTVOrgCategory, IPTVOrgCountry, VERIFIED_REAL_IPTV_CHANNELS } from './services/iptvOrgService';
import { StorageService } from './services/storageService';
import { soundEffects } from './services/soundEffects';

import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { HandheldShell, DeviceFrameType } from './components/HandheldShell';
import { TouchController } from './components/TouchController';
import { ChannelGuide } from './components/ChannelGuide';
import { OnDemandCatalog } from './components/OnDemandCatalog';
import { AIRecommender } from './components/AIRecommender';
import { OfflineDownloads } from './components/OfflineDownloads';
import { MultiDeviceSync } from './components/MultiDeviceSync';
import { InmersiveRetroRoom } from './components/InmersiveRetroRoom';
import { ParentalControlModal } from './components/ParentalControlModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { NotificationsCenter } from './components/NotificationsCenter';
import { SecurityEncryptionModal } from './components/SecurityEncryptionModal';
import { AccessibilitySettings } from './components/AccessibilitySettings';

import { 
  Tv, 
  Film, 
  Sparkles, 
  Download, 
  Wifi, 
  Gamepad2, 
  Tablet, 
  Glasses,
  Zap,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Monitor,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'live_tv' | 'vod' | 'ai_recommendations' | 'downloads' | 'devices' | 'ar_room' | 'controller'>('live_tv');

  // Channels & VOD State
  const [channels, setChannels] = useState<Channel[]>(IPTVOrgService.getInitialChannels());
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(channels[0] || null);
  const [currentVod, setCurrentVod] = useState<VideoContent | null>(null);
  const [isLoadingIptv, setIsLoadingIptv] = useState<boolean>(false);

  // Device Shell Frame & Theater Mode - Default to 'frameless' for sleek, embedded, maximum screen view
  const [frameType, setFrameType] = useState<DeviceFrameType>('frameless');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  // Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>(StorageService.getProfiles());
  const [activeProfile, setActiveProfile] = useState<UserProfile>(StorageService.getActiveProfile());

  // Parental & Battery Settings
  const [parentalSettings, setParentalSettings] = useState<ParentalSettings>(StorageService.getParentalSettings());
  const [batterySettings, setBatterySettings] = useState<BatteryOptimizationSettings>(StorageService.getBatterySettings());

  // Offline Downloads & Connected Devices
  const [downloads, setDownloads] = useState<DownloadedItem[]>(StorageService.getDownloads());
  const [devices, setDevices] = useState<ConnectedDevice[]>(StorageService.getConnectedDevices());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [language, setLanguage] = useState<string>(StorageService.getLanguage());

  // Visual & Sound Toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEffects.isEnabled());
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false);

  // Modal States
  const [isParentalModalOpen, setIsParentalModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState<boolean>(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isBatteryModalOpen, setIsBatteryModalOpen] = useState<boolean>(false);

  // Unread notifications count
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  // Channel navigation helpers
  const handleNextChannel = () => {
    if (channels.length === 0) return;
    soundEffects.playBeep(520, 0.04);
    if (!currentChannel) {
      setCurrentChannel(channels[0]);
      setCurrentVod(null);
      return;
    }
    const currentIdx = channels.findIndex(c => c.id === currentChannel.id);
    const nextIdx = (currentIdx + 1) % channels.length;
    setCurrentChannel(channels[nextIdx]);
    setCurrentVod(null);
  };

  const handlePrevChannel = () => {
    if (channels.length === 0) return;
    soundEffects.playBeep(420, 0.04);
    if (!currentChannel) {
      setCurrentChannel(channels[0]);
      setCurrentVod(null);
      return;
    }
    const currentIdx = channels.findIndex(c => c.id === currentChannel.id);
    const prevIdx = (currentIdx - 1 + channels.length) % channels.length;
    setCurrentChannel(channels[prevIdx]);
    setCurrentVod(null);
  };

  const handleSelectChannelNumber = (num: number) => {
    const found = channels.find(c => c.number === num);
    if (found) {
      setCurrentChannel(found);
      setCurrentVod(null);
      soundEffects.playCoin();
    }
  };

  const handleSelectChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    setCurrentVod(null);
    soundEffects.playBeep(550, 0.04);
  };

  const handlePlayVod = (vod: VideoContent) => {
    setCurrentVod(vod);
    setCurrentChannel(null);
    soundEffects.playFanfare();
  };

  const handleTurboZap = () => {
    soundEffects.playZap();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4']
    });
    if (channels.length > 0) {
      const randomIdx = Math.floor(Math.random() * channels.length);
      setCurrentChannel(channels[randomIdx]);
      setCurrentVod(null);
    }
  };

  // Load category channels from IPTV-org
  const handleLoadIptvCategory = async (cat: IPTVOrgCategory) => {
    if (cat.id === 'all') {
      setChannels(VERIFIED_REAL_IPTV_CHANNELS);
      return;
    }
    setIsLoadingIptv(true);
    try {
      const fetched = await IPTVOrgService.fetchPlaylist(cat.m3uUrl, cat.name);
      setChannels(fetched);
      if (fetched.length > 0) {
        setCurrentChannel(fetched[0]);
      }
    } catch (err) {
      console.warn('Error loading IPTV category:', err);
    } finally {
      setIsLoadingIptv(false);
    }
  };

  // Load country channels from IPTV-org
  const handleLoadIptvCountry = async (country: IPTVOrgCountry) => {
    setIsLoadingIptv(true);
    try {
      const fetched = await IPTVOrgService.fetchPlaylist(country.m3uUrl, country.name);
      setChannels(fetched);
      if (fetched.length > 0) {
        setCurrentChannel(fetched[0]);
      }
    } catch (err) {
      console.warn('Error loading IPTV country:', err);
    } finally {
      setIsLoadingIptv(false);
    }
  };

  // Load Custom M3U URL
  const handleLoadCustomM3U = async (url: string) => {
    setIsLoadingIptv(true);
    try {
      const fetched = await IPTVOrgService.fetchPlaylist(url, 'Custom Playlist');
      setChannels(fetched);
      if (fetched.length > 0) {
        setCurrentChannel(fetched[0]);
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (err) {
      console.warn('Error loading custom M3U:', err);
    } finally {
      setIsLoadingIptv(false);
    }
  };

  const handlePlayDownloadedItem = (item: DownloadedItem) => {
    const matchedVod = VOD_CATALOG.find(v => v.id === item.contentId);
    if (matchedVod) {
      handlePlayVod(matchedVod);
    } else {
      setCurrentVod({
        id: item.contentId,
        title: item.title,
        year: 2024,
        duration: item.duration,
        durationSeconds: 600,
        category: item.category,
        rating: 'G',
        thumbnail: item.thumbnail,
        videoUrl: item.videoUrl,
        description: 'Archivo local reproducido desde la bóveda de almacenamiento offline.',
        license: 'Creative Commons CC-BY',
        tags: ['Offline', 'Cached'],
        views: 1,
        fileSizeBytes: item.fileSizeBytes,
        qualityOptions: [],
      });
      setCurrentChannel(null);
    }
  };

  const handleDownloadVod = (vod: VideoContent, qualityLabel: string = 'CRT Standard (720p)') => {
    StorageService.addDownload(vod, qualityLabel);
    setDownloads(StorageService.getDownloads());
  };

  const handleRemoveDownload = (id: string) => {
    StorageService.removeDownload(id);
    setDownloads(StorageService.getDownloads());
  };

  const handleToggleFavorite = (channelId: string) => {
    const favs = activeProfile.favorites.includes(channelId)
      ? activeProfile.favorites.filter(id => id !== channelId)
      : [...activeProfile.favorites, channelId];
    
    const updated = { ...activeProfile, favorites: favs };
    setActiveProfile(updated);
    StorageService.updateProfile(updated);
  };

  const handleSelectProfile = (prof: UserProfile) => {
    setActiveProfile(prof);
    StorageService.setActiveProfileId(prof.id);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#10b981', '#f59e0b', '#06b6d4']
    });
  };

  const handleSaveParental = (settings: ParentalSettings) => {
    setParentalSettings(settings);
    StorageService.saveParentalSettings(settings);
  };

  const handleUpdateBatterySettings = (settings: BatteryOptimizationSettings) => {
    setBatterySettings(settings);
    StorageService.saveBatterySettings(settings);
  };

  const handlePairDevice = (name: string, type: ConnectedDevice['type']) => {
    StorageService.pairNewDevice(name, type);
    setDevices(StorageService.getConnectedDevices());
  };

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
  };

  const handleToggleSound = () => {
    const newState = soundEffects.toggleSound();
    setSoundEnabled(newState);
  };

  const handleExecuteVoiceAction = (actionData: any) => {
    if (actionData.action === 'change_channel' && actionData.channelId) {
      const target = channels.find(c => c.id === actionData.channelId || c.number === actionData.channelNumber);
      if (target) handleSelectChannel(target);
    } else if (actionData.action === 'open_vod' && actionData.vodId) {
      const targetVod = VOD_CATALOG.find(v => v.id === actionData.vodId);
      if (targetVod) handlePlayVod(targetVod);
    } else if (actionData.action === 'toggle_crt') {
      setCrtEnabled(prev => !prev);
    } else if (actionData.action === 'toggle_sound') {
      handleToggleSound();
    } else if (actionData.action === 'open_offline') {
      setActiveTab('downloads');
    } else if (actionData.action === 'open_parental') {
      setIsParentalModalOpen(true);
    } else if (actionData.action === 'open_sync') {
      setActiveTab('devices');
    } else if (actionData.action === 'open_ar_room') {
      setActiveTab('ar_room');
    }
  };

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col bg-zinc-950 text-zinc-100 font-sans select-none ${crtEnabled ? 'crt-vignette' : ''}`}>
      {/* Sleek Top Studio Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        parentalSettings={parentalSettings}
        onOpenParentalModal={() => setIsParentalModalOpen(true)}
        batterySettings={batterySettings}
        onOpenBatteryModal={() => setIsBatteryModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenSecurityModal={() => setIsSecurityOpen(true)}
        onOpenAccessibilityModal={() => setIsAccessibilityOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(prev => !prev)}
        currentChannelNumber={currentChannel?.number}
        onTurboZap={handleTurboZap}
      />

      {/* Main Cockpit Stage (Zero Page Scroll) */}
      <main className="flex-1 min-h-0 w-full p-1.5 sm:p-2 overflow-hidden">
        {activeTab === 'ar_room' ? (
          <div className="w-full h-full overflow-hidden rounded-xl border border-zinc-800">
            <InmersiveRetroRoom
              currentChannel={currentChannel}
              currentVod={currentVod}
              onNextChannel={handleNextChannel}
              onPrevChannel={handlePrevChannel}
            />
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden">
            {/* Left Pane: Embedded Video Player Theater & Quick Tools */}
            <section className={`${theaterMode ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-8'} flex flex-col min-h-0 h-full overflow-hidden bg-zinc-950 rounded-xl border border-zinc-800 p-1.5 shadow-2xl transition-all duration-300`}>
              {/* Top Frame Skin Selector & Theater Toggle */}
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-800/80 text-[8px] font-pixel text-zinc-400 shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
                  <span className="text-zinc-500 hidden sm:inline">VISTA:</span>
                  <button
                    onClick={() => setFrameType('frameless')}
                    className={`px-1.5 py-0.5 rounded border transition-all ${
                      frameType === 'frameless' ? 'bg-purple-500 text-zinc-950 font-bold border-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    EMBEBIDO (MAX)
                  </button>
                  <button
                    onClick={() => setFrameType('handheld_dmg')}
                    className={`px-1.5 py-0.5 rounded border transition-all ${
                      frameType === 'handheld_dmg' ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    PORTÁTIL
                  </button>
                  <button
                    onClick={() => setFrameType('retro_tablet')}
                    className={`px-1.5 py-0.5 rounded border transition-all hidden sm:block ${
                      frameType === 'retro_tablet' ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    TABLET
                  </button>
                  <button
                    onClick={() => setFrameType('arcade_cabinet')}
                    className={`px-1.5 py-0.5 rounded border transition-all hidden md:block ${
                      frameType === 'arcade_cabinet' ? 'bg-red-500 text-zinc-950 font-bold border-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    ARCADE
                  </button>
                  <button
                    onClick={() => setFrameType('crt_tv')}
                    className={`px-1.5 py-0.5 rounded border transition-all hidden md:block ${
                      frameType === 'crt_tv' ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    CRT TV
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTheaterMode(prev => !prev)}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded font-pixel text-[8px] flex items-center gap-1 transition-all"
                    title={theaterMode ? 'Mostrar Panel Lateral' : 'Modo Cine / Ampliar Video'}
                  >
                    {theaterMode ? <Minimize2 className="w-3 h-3 text-amber-400" /> : <Maximize2 className="w-3 h-3 text-cyan-400" />}
                    <span>{theaterMode ? 'REDUCIR' : 'MAXIMIZAR'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Video Stage */}
              <div className="flex-1 min-h-0 w-full overflow-hidden relative">
                <HandheldShell
                  frameType={frameType}
                  onSelectFrame={(f) => setFrameType(f)}
                  crtEnabled={crtEnabled}
                  onToggleCrt={() => setCrtEnabled(prev => !prev)}
                >
                  <VideoPlayer
                    currentChannel={currentChannel}
                    currentVod={currentVod}
                    onNextChannel={handleNextChannel}
                    onPrevChannel={handlePrevChannel}
                    onSelectChannelNumber={handleSelectChannelNumber}
                    parentalSettings={parentalSettings}
                    batterySettings={batterySettings}
                    crtEnabled={crtEnabled}
                    onDownloadVod={handleDownloadVod}
                  />
                </HandheldShell>
              </div>

              {/* Bottom Quick-Zap Strip & Live Status */}
              <div className="mt-1 pt-1 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-1 shrink-0 bg-zinc-900/40 px-2 py-1 rounded-lg">
                {/* Channel Zappers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevChannel}
                    className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded font-pixel text-[8px] flex items-center gap-0.5"
                    title="Canal Anterior"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span>CH-</span>
                  </button>
                  <button
                    onClick={handleNextChannel}
                    className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded font-pixel text-[8px] flex items-center gap-0.5"
                    title="Canal Siguiente"
                  >
                    <span>CH+</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleTurboZap}
                    className="px-2 py-0.5 bg-gradient-to-r from-red-600 to-amber-500 text-zinc-950 font-pixel text-[8px] font-bold rounded flex items-center gap-1 shadow"
                  >
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    <span>ZAP</span>
                  </button>
                </div>

                {/* Live Channel Info Ticker */}
                <div className="flex items-center gap-2 min-w-0 flex-1 px-1">
                  {currentChannel ? (
                    <div className="font-vt text-xs truncate text-zinc-300">
                      <span className="text-emerald-400 font-bold mr-1">[{currentChannel.number}] {currentChannel.name}:</span>
                      <span className="text-zinc-400">{currentChannel.currentShow.title}</span>
                    </div>
                  ) : currentVod ? (
                    <div className="font-vt text-xs truncate text-cyan-300">
                      <span className="font-bold mr-1">[VOD]:</span>
                      <span>{currentVod.title} ({currentVod.year})</span>
                    </div>
                  ) : (
                    <div className="font-vt text-xs text-zinc-500">SINTONIZADOR IPTV LISTO</div>
                  )}
                </div>

                {/* Popular Quick Zap Pills */}
                <div className="hidden sm:flex items-center gap-1">
                  {channels.slice(0, 5).map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChannel(ch)}
                      className={`px-1.5 py-0.5 rounded font-pixel text-[7px] border transition-all ${
                        currentChannel?.id === ch.id
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {ch.number}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Right Pane: Multi-Tab Studio Deck (Only when not in full theater mode) */}
            {!theaterMode && (
              <section className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 h-full overflow-hidden bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl">
                {/* Dock Header Tabs */}
                <div className="p-1 bg-zinc-900 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto scrollbar-thin shrink-0">
                  <button
                    onClick={() => {
                      soundEffects.playBeep(500, 0.04);
                      setActiveTab('live_tv');
                    }}
                    className={`px-2 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 border transition-all whitespace-nowrap ${
                      activeTab === 'live_tv'
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-[0_0_6px_#10b981]'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Tv className="w-3 h-3" />
                    <span>CANALES ({channels.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playBeep(540, 0.04);
                      setActiveTab('vod');
                    }}
                    className={`px-2 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 border transition-all whitespace-nowrap ${
                      activeTab === 'vod'
                        ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-[0_0_6px_#06b6d4]'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    <span>CINE ({VOD_CATALOG.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playBeep(580, 0.04);
                      setActiveTab('controller');
                    }}
                    className={`px-2 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 border transition-all whitespace-nowrap ${
                      activeTab === 'controller'
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_6px_#f59e0b]'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Gamepad2 className="w-3 h-3" />
                    <span>MANDO</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playBeep(600, 0.04);
                      setActiveTab('ai_recommendations');
                    }}
                    className={`px-2 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 border transition-all whitespace-nowrap ${
                      activeTab === 'ai_recommendations'
                        ? 'bg-purple-500 text-zinc-950 border-purple-400 font-bold shadow-[0_0_6px_#a855f7]'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
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
                    className={`px-2 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 border transition-all whitespace-nowrap ${
                      activeTab === 'downloads'
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_6px_#f59e0b]'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>BÓVEDA ({downloads.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playBeep(680, 0.04);
                      setActiveTab('devices');
                    }}
                    className={`px-2 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 border transition-all whitespace-nowrap ${
                      activeTab === 'devices'
                        ? 'bg-blue-500 text-zinc-950 border-blue-400 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Wifi className="w-3 h-3" />
                    <span>SYNC</span>
                  </button>
                </div>

                {/* Dock Body (Internally Scrollable View Area) */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {activeTab === 'live_tv' && (
                    <ChannelGuide
                      channels={channels}
                      selectedChannel={currentChannel}
                      onSelectChannel={handleSelectChannel}
                      activeProfile={activeProfile}
                      onToggleFavorite={handleToggleFavorite}
                      parentalSettings={parentalSettings}
                      onLoadIptvCategory={handleLoadIptvCategory}
                      onLoadIptvCountry={handleLoadIptvCountry}
                      onLoadCustomM3U={handleLoadCustomM3U}
                      isLoadingIptv={isLoadingIptv}
                    />
                  )}

                  {activeTab === 'vod' && (
                    <OnDemandCatalog
                      onPlayVod={handlePlayVod}
                      onDownloadVod={handleDownloadVod}
                      activeProfile={activeProfile}
                      parentalSettings={parentalSettings}
                      downloadedItems={downloads}
                    />
                  )}

                  {activeTab === 'controller' && (
                    <TouchController
                      onUp={handleNextChannel}
                      onDown={handlePrevChannel}
                      onLeft={() => {}}
                      onRight={() => {}}
                      onA={() => {
                        const video = document.querySelector('video');
                        if (video) {
                          if (video.paused) video.play();
                          else video.pause();
                        }
                      }}
                      onB={() => {
                        const video = document.querySelector('video');
                        if (video) video.muted = !video.muted;
                      }}
                      onSelect={() => setActiveTab('live_tv')}
                      onStart={() => {
                        const video = document.querySelector('video');
                        if (video) {
                          if (video.paused) video.play();
                          else video.pause();
                        }
                      }}
                      onTurboZap={handleTurboZap}
                      onSelectChannelNumber={handleSelectChannelNumber}
                    />
                  )}

                  {activeTab === 'ai_recommendations' && (
                    <AIRecommender
                      userProfile={activeProfile}
                      channels={channels}
                      vodCatalog={VOD_CATALOG}
                      onPlayChannel={handleSelectChannel}
                      onPlayVod={handlePlayVod}
                    />
                  )}

                  {activeTab === 'downloads' && (
                    <OfflineDownloads
                      downloads={downloads}
                      onPlayDownloadedItem={handlePlayDownloadedItem}
                      onRemoveDownload={handleRemoveDownload}
                      batterySettings={batterySettings}
                      onUpdateBatterySettings={handleUpdateBatterySettings}
                    />
                  )}

                  {activeTab === 'devices' && (
                    <MultiDeviceSync
                      devices={devices}
                      onPairDevice={handlePairDevice}
                      currentChannelName={currentChannel?.name}
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <ParentalControlModal
        isOpen={isParentalModalOpen}
        onClose={() => setIsParentalModalOpen(false)}
        settings={parentalSettings}
        onSaveSettings={handleSaveParental}
      />

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteAction={handleExecuteVoiceAction}
      />

      <NotificationsCenter
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onSelectTarget={(targetId) => {
          const ch = channels.find(c => c.id === targetId);
          if (ch) handleSelectChannel(ch);
        }}
      />

      <SecurityEncryptionModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <AccessibilitySettings
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        language={language}
        onSelectLanguage={(lang) => {
          setLanguage(lang);
          StorageService.setLanguage(lang);
        }}
      />

      {/* Battery Optimization Modal */}
      {isBatteryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border-2 border-amber-500 p-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] rounded-xl">
            <h3 className="font-pixel text-xs sm:text-sm text-amber-400 mb-1">
              GESTIÓN DE ENERGÍA Y RENDIMIENTO
            </h3>
            <p className="font-vt text-zinc-400 text-xs mb-3">
              Optimización dinámica de cuadros por segundo, efectos visuales y búfer de red.
            </p>

            <div className="space-y-2 font-pixel text-[9px]">
              {[
                { id: 'battery_saver', label: '🔋 Ahorro de Batería (30 FPS / Eco)', desc: 'Reduce el calentamiento y consumo en smartphones.' },
                { id: 'ultra_data_saver', label: '📶 Ultra Ahorro de Datos (360p)', desc: 'Máxima compresión de ancho de banda para redes móviles.' },
                { id: 'turbo_arcade', label: '⚡ Turbo Arcade (60 FPS / Bloom)', desc: 'Efectos CRT completos y máxima tasa de refresco.' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundEffects.playBeep(520, 0.04);
                    handleUpdateBatterySettings({
                      ...batterySettings,
                      mode: p.id as any,
                      maxFramerate: p.id === 'turbo_arcade' ? 60 : 30,
                      enableCrtBloom: p.id === 'turbo_arcade',
                    });
                    setIsBatteryModalOpen(false);
                  }}
                  className={`w-full p-2 border text-left transition-colors rounded ${
                    batterySettings.mode === p.id
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-[0_0_8px_#f59e0b]'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-400'
                  }`}
                >
                  <span className="block">{p.label}</span>
                  <span className="font-vt text-xs text-zinc-400 block mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsBatteryModalOpen(false)}
                className="px-3 py-1 bg-zinc-800 text-zinc-300 font-pixel text-[9px] rounded"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
