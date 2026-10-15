import React, { useState } from 'react';
import { 
  Wifi, 
  Tv, 
  Smartphone, 
  Gamepad2, 
  Monitor, 
  RefreshCw, 
  Plus, 
  CheckCircle, 
  Share2,
  Copy,
  Radio,
  Zap,
  Battery
} from 'lucide-react';
import { ConnectedDevice } from '../types';
import { soundEffects } from '../services/soundEffects';

interface MultiDeviceSyncProps {
  devices: ConnectedDevice[];
  onPairDevice: (name: string, type: ConnectedDevice['type']) => void;
  currentChannelName?: string;
}

export const MultiDeviceSync: React.FC<MultiDeviceSyncProps> = ({
  devices,
  onPairDevice,
  currentChannelName,
}) => {
  const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
  const [newDeviceName, setNewDeviceName] = useState<string>('');
  const [newDeviceType, setNewDeviceType] = useState<ConnectedDevice['type']>('mobile');
  const [syncCode, setSyncCode] = useState<string>('PX-8842');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'crt_tv': return <Tv className="w-5 h-5 text-emerald-400" />;
      case 'gameboy_handheld': return <Gamepad2 className="w-5 h-5 text-amber-400" />;
      case 'retro_tablet': return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'arcade_cabinet': return <Monitor className="w-5 h-5 text-pink-400" />;
      default: return <Smartphone className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleSyncAll = () => {
    soundEffects.playFanfare();
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
    }, 1200);
  };

  const handleCopyCode = () => {
    soundEffects.playBeep(650, 0.05);
    navigator.clipboard?.writeText(syncCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreatePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    soundEffects.playCoin();
    onPairDevice(newDeviceName.trim(), newDeviceType);
    setNewDeviceName('');
    setIsPairingModalOpen(false);
  };

  return (
    <div className="w-full bg-zinc-900 border-4 border-zinc-950 p-3 sm:p-5 shadow-[4px_4px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500 text-zinc-950 flex items-center justify-center font-pixel text-xs">
              SYNC
            </div>
            <h2 className="font-pixel text-xs sm:text-sm text-pink-400">
              SINCRONIZACIÓN EN LA NUBE & MULTIDISPOSITIVO
            </h2>
          </div>
          <p className="font-vt text-zinc-400 text-sm mt-0.5">
            Emisión simultánea sin interrupciones y continuidad de reproducción en tiempo real.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-pixel text-[10px] flex items-center gap-1.5 pixel-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>SINCRONIZAR AHORA</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep(520, 0.04);
              setIsPairingModalOpen(true);
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-pixel text-[10px] border border-zinc-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>VINCULAR PANTALLA</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync State Overview Banner */}
      <div className="mt-3 p-3 bg-zinc-950 border-2 border-pink-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <p className="font-pixel text-[10px] text-emerald-300">
              MATRIZ CLOUD ENLACE ACTIVO (3 NODOS VINCULADOS)
            </p>
            <p className="font-vt text-xs text-zinc-400">
              Canal activo en streaming: <span className="text-amber-400">{currentChannelName || 'Canal 801'}</span>
            </p>
          </div>
        </div>

        {/* Sync Pairing Code */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5">
          <span className="font-pixel text-[9px] text-zinc-400">CÓDIGO SALA:</span>
          <span className="font-pixel text-xs text-pink-400 tracking-wider">{syncCode}</span>
          <button
            onClick={handleCopyCode}
            className="p-1 text-zinc-400 hover:text-white"
            title="Copiar código de sincronización"
          >
            {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className={`bg-zinc-950 border-2 p-3 flex flex-col justify-between shadow-[3px_3px_0px_#000] ${
              dev.isCurrentDevice
                ? 'border-emerald-500 shadow-emerald-950/50'
                : 'border-zinc-800 hover:border-pink-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-700">
                    {getDeviceIcon(dev.type)}
                  </div>
                  <div>
                    <h4 className="font-pixel text-xs text-zinc-200">
                      {dev.name}
                    </h4>
                    <span className="font-vt text-xs text-zinc-500">{dev.location}</span>
                  </div>
                </div>

                {dev.isCurrentDevice ? (
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 font-pixel text-[8px] border border-emerald-800">
                    ESTE DISPOSITIVO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 font-pixel text-[8px] border border-zinc-800">
                    REMOTO
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-2 text-zinc-400 font-pixel text-[9px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ESTADO STREAM:</span>
                  <span className="text-emerald-400">{dev.syncState.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">DIRECCIÓN IP:</span>
                  <span className="font-vt text-sm text-zinc-300">{dev.ip}</span>
                </div>
                {dev.batteryStatus !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">BATERÍA:</span>
                    <span className="text-amber-400 flex items-center gap-1 font-vt text-sm">
                      <Battery className="w-3 h-3" /> {dev.batteryStatus}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between font-pixel text-[8px]">
              <span className="text-zinc-500">{dev.lastActive}</span>
              <button 
                onClick={() => {
                  soundEffects.playBeep(600, 0.04);
                }}
                className="px-2 py-1 bg-zinc-900 hover:bg-pink-950 text-pink-300 border border-zinc-700 hover:border-pink-500"
              >
                PROYECTAR AQUÍ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pair New Screen Modal */}
      {isPairingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border-4 border-pink-500 p-5 shadow-[8px_8px_0px_#000] text-zinc-200">
            <h3 className="font-pixel text-xs sm:text-sm text-pink-400 mb-1">
              VINCULAR NUEVO DISPOSITIVO
            </h3>
            <p className="font-vt text-zinc-400 text-sm mb-4">
              Agrega una consola, pantalla inteligente o móvil a tu red PixelStream.
            </p>

            <form onSubmit={handleCreatePair} className="space-y-3 font-pixel text-[10px]">
              <div>
                <label className="block text-zinc-300 mb-1">NOMBRE DEL DISPOSITIVO:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. GameBoy Advance SP Micro"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-700 p-2 text-emerald-300 font-pixel text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">TIPO DE TERMINAL:</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full bg-zinc-950 border-2 border-zinc-700 p-2 text-zinc-200 font-pixel text-xs focus:outline-none"
                >
                  <option value="crt_tv">Televisor CRT Vintage</option>
                  <option value="gameboy_handheld">Consola Portátil / GameBoy</option>
                  <option value="retro_tablet">Tablet Retro</option>
                  <option value="arcade_cabinet">Mueble Arcade Cabinet</option>
                  <option value="mobile">Teléfono Móvil</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPairingModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 font-pixel text-[9px]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-pink-500 text-zinc-950 font-pixel text-[9px] hover:bg-pink-400 pixel-btn"
                >
                  CONFIRMAR VINCULACIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
