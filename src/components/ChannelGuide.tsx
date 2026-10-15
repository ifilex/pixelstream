import React, { useState } from 'react';
import { 
  Tv, 
  Star, 
  Search, 
  Clock, 
  CheckCircle2, 
  Play, 
  Globe2, 
  Plus, 
  Download, 
  Info, 
  Sparkles,
  Layers,
  Radio,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Channel, ChannelCategory, UserProfile, ParentalSettings } from '../types';
import { CATEGORY_NAMES } from '../data/channelsData';
import { soundEffects } from '../services/soundEffects';
import { IPTV_CATEGORIES, IPTV_COUNTRIES, IPTVOrgCategory, IPTVOrgCountry } from '../services/iptvOrgService';

interface ChannelGuideProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  activeProfile: UserProfile;
  onToggleFavorite: (channelId: string) => void;
  parentalSettings: ParentalSettings;
  onLoadIptvCategory?: (cat: IPTVOrgCategory) => void;
  onLoadIptvCountry?: (country: IPTVOrgCountry) => void;
  onLoadCustomM3U?: (url: string) => void;
  isLoadingIptv?: boolean;
}

export const ChannelGuide: React.FC<ChannelGuideProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  activeProfile,
  onToggleFavorite,
  parentalSettings,
  onLoadIptvCategory,
  onLoadIptvCountry,
  onLoadCustomM3U,
  isLoadingIptv = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('global');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'compact' | 'grid'>('compact');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [showCustomM3UModal, setShowCustomM3UModal] = useState<boolean>(false);
  const [customM3UInput, setCustomM3UInput] = useState<string>('');
  const [detailedChannel, setDetailedChannel] = useState<Channel | null>(null);

  // Filter channels based on category, search query, favorites, and parental settings
  const filteredChannels = channels.filter(ch => {
    // Parental filter
    if (parentalSettings.enabled && parentalSettings.hideAdultChannels && ch.rating === '18+') {
      return false;
    }
    // Favorites only filter
    if (onlyFavorites && !activeProfile.favorites.includes(ch.id)) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && ch.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.currentShow.title.toLowerCase().includes(q) ||
        ch.number.toString().includes(q) ||
        ch.tagline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customM3UInput.trim() && onLoadCustomM3U) {
      onLoadCustomM3U(customM3UInput.trim());
      setShowCustomM3UModal(false);
      setCustomM3UInput('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Top Search & Filter Bar */}
      <div className="p-2.5 bg-zinc-900/95 border-b border-zinc-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 text-zinc-950 flex items-center justify-center font-pixel text-[10px] font-bold rounded">
              EPG
            </div>
            <div>
              <h2 className="font-pixel text-[11px] sm:text-xs text-emerald-400 leading-tight">
                CANALES EN DIRECTO ({filteredChannels.length}/{channels.length})
              </h2>
              <p className="font-vt text-[11px] text-zinc-400 hidden sm:block">
                Señales públicas HD sincronizadas con iptv-org
              </p>
            </div>
          </div>

          {/* Action Buttons: Favs, M3U, View Mode */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEffects.playBeep(500, 0.04);
                setOnlyFavorites(prev => !prev);
              }}
              className={`px-2 py-1 rounded font-pixel text-[9px] flex items-center gap-1 border transition-all ${
                onlyFavorites
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_8px_#f59e0b]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
              title="Filtrar por Favoritos"
            >
              <Star className="w-3 h-3" fill={onlyFavorites ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">FAVS</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playBeep(600, 0.05);
                setShowCustomM3UModal(true);
              }}
              title="Importar Playlist M3U"
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 rounded flex items-center gap-1 font-pixel text-[9px] whitespace-nowrap active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>M3U</span>
            </button>

            <div className="flex items-center bg-zinc-950 p-0.5 rounded border border-zinc-800">
              <button
                onClick={() => {
                  soundEffects.playBeep(400, 0.03);
                  setViewMode('compact');
                }}
                className={`px-1.5 py-0.5 rounded font-pixel text-[8px] ${
                  viewMode === 'compact' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-500'
                }`}
                title="Vista Compacta"
              >
                LISTA
              </button>
              <button
                onClick={() => {
                  soundEffects.playBeep(400, 0.03);
                  setViewMode('grid');
                }}
                className={`px-1.5 py-0.5 rounded font-pixel text-[8px] ${
                  viewMode === 'grid' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-500'
                }`}
                title="Vista Cuadrícula"
              >
                GRID
              </button>
            </div>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Buscar canal, programa, número o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 pl-8 pr-3 py-1 font-pixel text-[9px] text-emerald-300 placeholder-zinc-600 focus:outline-none rounded"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1 text-[10px] text-zinc-400 hover:text-zinc-100 font-pixel"
            >
              ✕
            </button>
          )}
        </div>

        {/* Country Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin py-0.5">
          <span className="font-pixel text-[8px] text-zinc-500 mr-0.5 flex items-center gap-0.5 shrink-0">
            <Globe2 className="w-3 h-3 text-cyan-400" />
            PAÍS:
          </span>
          {IPTV_COUNTRIES.map((ct) => (
            <button
              key={ct.code}
              onClick={() => {
                soundEffects.playBeep(450, 0.04);
                setSelectedCountryCode(ct.code);
                if (onLoadIptvCountry) onLoadIptvCountry(ct);
              }}
              className={`px-1.5 py-0.5 rounded font-pixel text-[8px] flex items-center gap-1 whitespace-nowrap border transition-all shrink-0 ${
                selectedCountryCode === ct.code
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.4)] font-bold'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <span>{ct.flag}</span>
              <span>{ct.name}</span>
            </button>
          ))}
        </div>

        {/* Category Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin py-0.5">
          {IPTV_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playBeep(500, 0.04);
                setSelectedCategory(cat.id);
                if (onLoadIptvCategory) onLoadIptvCategory(cat);
              }}
              className={`px-2 py-0.5 font-pixel text-[8px] uppercase rounded border transition-all whitespace-nowrap flex items-center gap-1 shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-[0_0_6px_#10b981]'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Channels List Area with Internal Smooth Scroll (Zero Outer Scroll) */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
        {isLoadingIptv && (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
            <div className="font-pixel text-[9px] text-emerald-400 animate-pulse">
              DESCARGANDO Y ANALIZANDO CANALES IPTV...
            </div>
          </div>
        )}

        {!isLoadingIptv && filteredChannels.length === 0 && (
          <div className="py-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <Tv className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
            <p className="font-pixel text-[10px] text-zinc-400 mb-1">NO SE ENCONTRARON CANALES</p>
            <p className="font-vt text-xs text-zinc-500">
              Prueba cambiando los filtros de país o categoría en la barra superior.
            </p>
          </div>
        )}

        {!isLoadingIptv && viewMode === 'compact' && (
          <div className="space-y-1">
            {filteredChannels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              const isFav = activeProfile.favorites.includes(channel.id);

              return (
                <div
                  key={channel.id}
                  onClick={() => {
                    soundEffects.playBeep(580, 0.05);
                    onSelectChannel(channel);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  {/* Left: Number, Logo, Name, Current Show */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`px-1.5 py-0.5 rounded font-pixel text-[9px] font-bold border shrink-0 ${
                      isSelected ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-zinc-950 text-emerald-400 border-zinc-700'
                    }`}>
                      {channel.number}
                    </span>

                    <span className="text-sm shrink-0">{channel.logo}</span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-pixel text-[10px] text-zinc-100 truncate group-hover:text-emerald-300">
                          {channel.name}
                        </span>
                        {channel.isLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
                        )}
                      </div>
                      <div className="font-vt text-[12px] text-zinc-400 truncate flex items-center gap-1">
                        <span className="text-emerald-400 font-semibold">{channel.currentShow.title}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{channel.tagline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quality tag, Favorite button, Info Button, Tune Button */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="hidden sm:inline-block px-1 py-0.5 bg-zinc-950 border border-zinc-800 rounded font-pixel text-[7px] text-zinc-400">
                      {channel.resolution?.split(' ')[0] || '1080p'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playBeep(650, 0.05);
                        onToggleFavorite(channel.id);
                      }}
                      className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                        isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                      title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <Star className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playBeep(450, 0.03);
                        setDetailedChannel(channel);
                      }}
                      className="p-1 text-zinc-500 hover:text-cyan-400 rounded hover:bg-zinc-800"
                      title="Ver Detalles EPG"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.playBeep(600, 0.05);
                        onSelectChannel(channel);
                      }}
                      className={`px-2 py-1 rounded font-pixel text-[8px] flex items-center gap-0.5 border ${
                        isSelected 
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold'
                          : 'bg-zinc-800 hover:bg-emerald-600 hover:text-white border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>{isSelected ? 'AL AIRE' : 'VER'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoadingIptv && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredChannels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              const isFav = activeProfile.favorites.includes(channel.id);

              return (
                <div
                  key={channel.id}
                  onClick={() => {
                    soundEffects.playBeep(580, 0.05);
                    onSelectChannel(channel);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-zinc-950 border border-zinc-700 px-1.5 py-0.5 rounded font-pixel text-[8px] text-emerald-400 font-bold">
                          CH {channel.number}
                        </span>
                        <span className="text-sm">{channel.logo}</span>
                        <span className="font-pixel text-[9px] text-zinc-100 truncate max-w-[120px]">
                          {channel.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playBeep(650, 0.05);
                            onToggleFavorite(channel.id);
                          }}
                          className={`p-0.5 rounded hover:bg-zinc-800 ${
                            isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                          }`}
                        >
                          <Star className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                        <span className="bg-zinc-950 border border-zinc-800 px-1 py-0.5 rounded font-pixel text-[7px] text-amber-400">
                          {channel.rating}
                        </span>
                      </div>
                    </div>

                    <div className="font-vt text-xs text-emerald-300 font-bold truncate mb-0.5">
                      {channel.currentShow.title}
                    </div>
                    <p className="font-vt text-[11px] text-zinc-400 line-clamp-2">
                      {channel.currentShow.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[8px] font-pixel text-zinc-500">
                    <span>{channel.resolution}</span>
                    <span className="text-emerald-400">{channel.bitrate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EPG Show Details Modal */}
      {detailedChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-zinc-900 border-2 border-emerald-500 rounded-xl max-w-lg w-full p-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{detailedChannel.logo}</span>
                <div>
                  <h3 className="font-pixel text-xs text-emerald-400">
                    {detailedChannel.name} • CANAL {detailedChannel.number}
                  </h3>
                  <p className="font-vt text-xs text-zinc-400">{detailedChannel.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailedChannel(null)}
                className="font-pixel text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded border border-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="font-pixel text-[9px] text-emerald-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> EMISIÓN ACTUAL
                </div>
                <div className="font-vt text-base text-zinc-100 font-bold">
                  {detailedChannel.currentShow.title}
                </div>
                <p className="font-vt text-sm text-zinc-300 mt-1">
                  {detailedChannel.currentShow.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[9px] font-pixel text-zinc-500">
                  <span>Género: {detailedChannel.currentShow.genre}</span>
                  <span>Calificación: {detailedChannel.rating}</span>
                </div>
              </div>

              <div>
                <div className="font-pixel text-[9px] text-zinc-400 mb-1">GUÍA DE PROGRAMACIÓN (EPG)</div>
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                  {detailedChannel.schedule.map((sch, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-zinc-950/70 border border-zinc-800 rounded font-vt text-xs">
                      <span className="text-emerald-400">{sch.time}</span>
                      <span className="text-zinc-200">{sch.title}</span>
                      <span className="text-zinc-500">{sch.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setDetailedChannel(null)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-pixel text-[9px]"
              >
                CERRAR
              </button>
              <button
                onClick={() => {
                  soundEffects.playBeep(600, 0.05);
                  onSelectChannel(detailedChannel);
                  setDetailedChannel(null);
                }}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded font-pixel text-[9px] flex items-center gap-1 shadow-[0_0_8px_#10b981]"
              >
                <Play className="w-3 h-3" /> SINTONIZAR AHORA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom M3U Modal */}
      {showCustomM3UModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-zinc-900 border-2 border-cyan-500 rounded-xl max-w-md w-full p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-pixel text-xs text-cyan-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> IMPORTAR PLAYLIST M3U / IPTV
              </h3>
              <button
                onClick={() => setShowCustomM3UModal(false)}
                className="font-pixel text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded border border-zinc-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="py-3 space-y-3">
              <p className="font-vt text-xs text-zinc-300">
                Pega la URL de cualquier lista M3U pública (como las de github.com/iptv-org/iptv) para extraer todos los canales en vivo automáticamente:
              </p>

              <input
                type="url"
                required
                placeholder="https://iptv-org.github.io/iptv/countries/es.m3u"
                value={customM3UInput}
                onChange={(e) => setCustomM3UInput(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-500 p-2 font-pixel text-[10px] text-cyan-300 placeholder-zinc-600 focus:outline-none rounded"
              />

              {/* Quick Presets */}
              <div>
                <div className="font-pixel text-[8px] text-zinc-500 mb-1.5">PRESETS OFICIALES IPTV-ORG:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: '🇪🇸 España', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' },
                    { name: '🇲🇽 México', url: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
                    { name: '🇦🇷 Argentina', url: 'https://iptv-org.github.io/iptv/countries/ar.m3u' },
                    { name: '🍿 Animación', url: 'https://iptv-org.github.io/iptv/categories/animation.m3u' },
                    { name: '🎬 Películas', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
                    { name: '🔬 Documentales', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setCustomM3UInput(preset.url)}
                      className="px-2 py-1 bg-zinc-950 border border-zinc-800 hover:border-cyan-400 rounded font-pixel text-[8px] text-zinc-300"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCustomM3UModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-pixel text-[9px]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded font-pixel text-[9px] flex items-center gap-1 shadow-[0_0_8px_#06b6d4]"
                >
                  <Download className="w-3 h-3" /> IMPORTAR TODO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
