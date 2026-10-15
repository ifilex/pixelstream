import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Download, 
  Clock, 
  Eye, 
  Tag, 
  ShieldCheck, 
  Sparkles,
  Search,
  Check,
  Info
} from 'lucide-react';
import { VideoContent, UserProfile, ParentalSettings, DownloadedItem } from '../types';
import { VOD_CATALOG, CATEGORY_NAMES } from '../data/channelsData';
import { soundEffects } from '../services/soundEffects';

interface OnDemandCatalogProps {
  onPlayVod: (vod: VideoContent) => void;
  onDownloadVod: (vod: VideoContent, qualityLabel: string) => void;
  activeProfile: UserProfile;
  parentalSettings: ParentalSettings;
  downloadedItems: DownloadedItem[];
}

export const OnDemandCatalog: React.FC<OnDemandCatalogProps> = ({
  onPlayVod,
  onDownloadVod,
  activeProfile,
  parentalSettings,
  downloadedItems,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVodForDetails, setSelectedVodForDetails] = useState<VideoContent | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredVods = VOD_CATALOG.filter(vod => {
    // Parental filter
    if (parentalSettings.enabled && parentalSettings.hideAdultChannels && vod.rating === '18+') {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && vod.category !== selectedCategory) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        vod.title.toLowerCase().includes(q) ||
        vod.description.toLowerCase().includes(q) ||
        vod.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDownload = (vod: VideoContent, quality: string) => {
    soundEffects.playFanfare();
    onDownloadVod(vod, quality);
    setDownloadSuccessId(vod.id);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 2500);
  };

  const categories = [
    { id: 'all', name: 'TODO EL CATÁLOGO' },
    { id: 'movies', name: 'PELÍCULAS' },
    { id: 'series', name: 'SERIES & RETRO' },
    { id: 'animation', name: 'ANIMACIÓN' },
    { id: 'documentary', name: 'DOCUMENTALES' },
    { id: 'shorts', name: 'CORTOMETRAJES' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Top Header & Search */}
      <div className="p-2.5 bg-zinc-900/95 border-b border-zinc-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 text-zinc-950 flex items-center justify-center font-pixel text-[10px] font-bold rounded">
              VOD
            </div>
            <div>
              <h2 className="font-pixel text-[11px] sm:text-xs text-cyan-400 leading-tight">
                CINE Y SERIES BAJO DEMANDA ({filteredVods.length})
              </h2>
              <p className="font-vt text-[11px] text-zinc-400 hidden sm:block">
                Obras maestras de dominio público y licencias Creative Commons CC-BY
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded font-pixel text-[8px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> LEGAL
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Buscar título, sinopsis o etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-cyan-500 pl-8 pr-3 py-1 font-pixel text-[9px] text-cyan-300 placeholder-zinc-600 focus:outline-none rounded"
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

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playBeep(520, 0.04);
                setSelectedCategory(cat.id);
              }}
              className={`px-2 py-0.5 rounded font-pixel text-[8px] whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-[0_0_6px_#06b6d4]'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of VOD Movies with Internal Scroll */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-2">
        {filteredVods.length === 0 ? (
          <div className="py-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <Film className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
            <p className="font-pixel text-[10px] text-zinc-400 mb-1">NO SE ENCONTRARON PELÍCULAS</p>
            <p className="font-vt text-xs text-zinc-500">
              Prueba cambiando la categoría o borrando el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredVods.map((vod) => {
              const isDownloaded = downloadedItems.some(d => d.contentId === vod.id);
              const isSuccess = downloadSuccessId === vod.id;

              return (
                <div
                  key={vod.id}
                  className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col justify-between transition-all group"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onPlayVod(vod)}>
                    <img
                      src={vod.thumbnail}
                      alt={vod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center shadow-[0_0_12px_#06b6d4] scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 font-pixel text-[7px]">
                      <span className="px-1.5 py-0.5 bg-zinc-950/90 text-cyan-300 rounded border border-zinc-700">
                        {vod.year}
                      </span>
                      <span className="px-1.5 py-0.5 bg-zinc-950/90 text-amber-400 rounded border border-zinc-700">
                        {vod.rating}
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-zinc-950/90 text-zinc-300 font-pixel text-[7px] rounded border border-zinc-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{vod.duration}</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        onClick={() => onPlayVod(vod)}
                        className="font-pixel text-[10px] text-zinc-100 group-hover:text-cyan-300 transition-colors cursor-pointer truncate"
                      >
                        {vod.title}
                      </h3>
                      <p className="font-vt text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                        {vod.description}
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            soundEffects.playBeep(600, 0.05);
                            onPlayVod(vod);
                          }}
                          className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-pixel text-[8px] font-bold rounded flex items-center gap-1 shadow-[0_0_6px_#06b6d4]"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>REPRODUCIR</span>
                        </button>

                        <button
                          onClick={() => handleDownload(vod, 'CRT Standard (720p)')}
                          className={`p-1 rounded border font-pixel text-[8px] flex items-center gap-1 transition-all ${
                            isSuccess
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold'
                              : isDownloaded
                              ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                              : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                          }`}
                          title="Descargar para ver sin conexión"
                        >
                          {isSuccess ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedVodForDetails(vod)}
                        className="p-1 text-zinc-500 hover:text-cyan-400 rounded"
                        title="Ver Ficha Técnica"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedVodForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-zinc-900 border-2 border-cyan-500 rounded-xl max-w-md w-full p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-pixel text-xs text-cyan-400">
                {selectedVodForDetails.title} ({selectedVodForDetails.year})
              </h3>
              <button
                onClick={() => setSelectedVodForDetails(null)}
                className="font-pixel text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2">
              <img
                src={selectedVodForDetails.thumbnail}
                alt={selectedVodForDetails.title}
                className="w-full h-36 object-cover rounded-lg border border-zinc-800"
                referrerPolicy="no-referrer"
              />
              <p className="font-vt text-sm text-zinc-300">
                {selectedVodForDetails.description}
              </p>
              <div className="flex flex-wrap gap-1 font-pixel text-[8px] text-zinc-500">
                <span>Duración: {selectedVodForDetails.duration}</span>
                <span>•</span>
                <span>Licencia: {selectedVodForDetails.license}</span>
                <span>•</span>
                <span>Calificación: {selectedVodForDetails.rating}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedVodForDetails(null)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 font-pixel text-[9px] rounded"
              >
                CERRAR
              </button>
              <button
                onClick={() => {
                  soundEffects.playBeep(600, 0.05);
                  onPlayVod(selectedVodForDetails);
                  setSelectedVodForDetails(null);
                }}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-pixel text-[9px] font-bold rounded flex items-center gap-1 shadow-[0_0_8px_#06b6d4]"
              >
                <Play className="w-3 h-3 fill-current" /> REPRODUCIR AHORA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
