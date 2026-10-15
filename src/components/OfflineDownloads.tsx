import React from 'react';
import { 
  Download, 
  Trash2, 
  Play, 
  HardDrive, 
  BatteryCharging, 
  WifiOff, 
  FileCheck, 
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { DownloadedItem, BatteryOptimizationSettings, VideoContent } from '../types';
import { soundEffects } from '../services/soundEffects';

interface OfflineDownloadsProps {
  downloads: DownloadedItem[];
  onPlayDownloadedItem: (item: DownloadedItem) => void;
  onRemoveDownload: (id: string) => void;
  batterySettings: BatteryOptimizationSettings;
  onUpdateBatterySettings: (settings: BatteryOptimizationSettings) => void;
}

export const OfflineDownloads: React.FC<OfflineDownloadsProps> = ({
  downloads,
  onPlayDownloadedItem,
  onRemoveDownload,
  batterySettings,
  onUpdateBatterySettings,
}) => {
  const totalBytes = downloads.reduce((acc, curr) => acc + curr.fileSizeBytes, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full bg-zinc-900 border-4 border-zinc-950 p-3 sm:p-5 shadow-[4px_4px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 text-zinc-950 flex items-center justify-center font-pixel text-xs">
              <WifiOff className="w-4 h-4" />
            </div>
            <h2 className="font-pixel text-xs sm:text-sm text-amber-400">
              MODO OFFLINE & BÓVEDA DE DESCARGAS
            </h2>
          </div>
          <p className="font-vt text-zinc-400 text-sm mt-0.5">
            Disfruta de contenido sin conexión con optimización de datos y ahorro de batería.
          </p>
        </div>

        {/* Storage Gauge */}
        <div className="bg-zinc-950 border border-zinc-700 px-3 py-1.5 flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <div>
            <div className="flex items-center justify-between font-pixel text-[8px] text-zinc-400 gap-4">
              <span>ALMACENAMIENTO OFFLINE:</span>
              <span className="text-amber-300">{totalMb} MB / 4.0 GB</span>
            </div>
            <div className="w-40 h-1.5 bg-zinc-800 mt-1 border border-zinc-700">
              <div 
                className="h-full bg-amber-500" 
                style={{ width: `${Math.min(100, (parseFloat(totalMb) / 4000) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battery & Data Saver Presets */}
      <div className="mt-4 p-3 bg-zinc-950 border-2 border-zinc-800">
        <h3 className="font-pixel text-[10px] text-amber-300 mb-2 flex items-center gap-1.5">
          <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
          <span>PERFIL DE CONSUMO DE BATERÍA Y DATOS:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-pixel text-[9px]">
          {/* Battery Saver 8-Bit */}
          <button
            onClick={() => {
              soundEffects.playBeep(440, 0.04);
              onUpdateBatterySettings({
                ...batterySettings,
                mode: 'battery_saver',
                maxFramerate: 30,
                enableCrtBloom: false,
                audioSampleRate: 'eco',
              });
            }}
            className={`p-2.5 border text-left flex flex-col justify-between transition-colors ${
              batterySettings.mode === 'battery_saver'
                ? 'bg-amber-950/60 text-amber-300 border-amber-500 shadow-[2px_2px_0px_#000]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-amber-400 font-bold block mb-1">🔋 AHORRO DE BATERÍA</span>
              <p className="font-vt text-zinc-400 text-xs">
                30 FPS, desactiva post-procesado pesado y reduce el consumo en móviles de gama baja.
              </p>
            </div>
            {batterySettings.mode === 'battery_saver' && (
              <span className="text-emerald-400 mt-2 text-[8px]">✓ ACTIVO</span>
            )}
          </button>

          {/* Ultra Data Saver */}
          <button
            onClick={() => {
              soundEffects.playBeep(520, 0.04);
              onUpdateBatterySettings({
                ...batterySettings,
                mode: 'ultra_data_saver',
                maxFramerate: 30,
                enableCrtBloom: false,
                audioSampleRate: 'eco',
              });
            }}
            className={`p-2.5 border text-left flex flex-col justify-between transition-colors ${
              batterySettings.mode === 'ultra_data_saver'
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500 shadow-[2px_2px_0px_#000]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-cyan-400 font-bold block mb-1">📶 ULTRA AHORRO DATOS</span>
              <p className="font-vt text-zinc-400 text-xs">
                Resolución 360p comprimida, ideal para redes móviles con datos limitados.
              </p>
            </div>
            {batterySettings.mode === 'ultra_data_saver' && (
              <span className="text-cyan-400 mt-2 text-[8px]">✓ ACTIVO</span>
            )}
          </button>

          {/* Turbo Arcade Master */}
          <button
            onClick={() => {
              soundEffects.playBeep(650, 0.04);
              onUpdateBatterySettings({
                ...batterySettings,
                mode: 'turbo_arcade',
                maxFramerate: 60,
                enableCrtBloom: true,
                audioSampleRate: 'full',
              });
            }}
            className={`p-2.5 border text-left flex flex-col justify-between transition-colors ${
              batterySettings.mode === 'turbo_arcade'
                ? 'bg-purple-950/60 text-purple-300 border-purple-500 shadow-[2px_2px_0px_#000]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-purple-400 font-bold block mb-1">⚡ TURBO ARCADE 60FPS</span>
              <p className="font-vt text-zinc-400 text-xs">
                Máxima fidelidad CRT Bloom, audio estéreo 8-bit sin compresión y 1080p.
              </p>
            </div>
            {batterySettings.mode === 'turbo_arcade' && (
              <span className="text-purple-400 mt-2 text-[8px]">✓ ACTIVO</span>
            )}
          </button>
        </div>
      </div>

      {/* Downloaded Items List */}
      <div className="mt-4">
        <h3 className="font-pixel text-[10px] text-zinc-300 mb-2 flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TUS ARCHIVOS GUARDADOS ({downloads.length})</span>
        </h3>

        {downloads.length === 0 ? (
          <div className="text-center py-10 bg-zinc-950 border-2 border-dashed border-zinc-800 p-4">
            <Download className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="font-pixel text-xs text-zinc-400">NO HAY DESCARGAS ACTIVAS</p>
            <p className="font-vt text-zinc-500 text-base mt-1">
              Ve a la pestaña "VOD CINE" y presiona el botón "OFFLINE" para guardar películas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {downloads.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950 border-2 border-zinc-800 hover:border-amber-500 p-3 flex items-center justify-between gap-3 shadow-[3px_3px_0px_#000]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-16 h-12 object-cover border border-zinc-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-pixel text-xs text-amber-300 truncate max-w-[180px] sm:max-w-xs">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 font-vt text-zinc-400 text-xs mt-1">
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{item.quality}</span>
                      <span>•</span>
                      <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(0)} MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEffects.playCoin();
                      onPlayDownloadedItem(item);
                    }}
                    className="px-2.5 py-1.5 bg-amber-500 text-zinc-950 font-pixel text-[9px] hover:bg-amber-400 flex items-center gap-1 pixel-btn"
                    title="Reproducir en modo Offline"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>VER</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playBeep(250, 0.05);
                      onRemoveDownload(item.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-zinc-800"
                    title="Eliminar descarga"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
