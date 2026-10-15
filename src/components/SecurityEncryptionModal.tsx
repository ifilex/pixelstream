import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  Cpu, 
  CheckCircle, 
  X,
  FileCode,
  EyeOff
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface SecurityEncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityEncryptionModal: React.FC<SecurityEncryptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tokenAudit] = useState<string>('0x8F9A_RETRO_GCM_256_ACTIVE');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border-4 border-emerald-500 p-5 shadow-[8px_8px_0px_#000] text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 text-zinc-950 flex items-center justify-center font-pixel text-base pixel-box">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-emerald-400">
                PIXEL-VAULT: CIFRADO E2EE & PRIVACIDAD
              </h3>
              <p className="font-vt text-zinc-400 text-xs">Protección de datos y túneles de transmisión segura</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playBeep(300, 0.04);
              onClose();
            }}
            className="p-1 text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Parameters Details */}
        <div className="mt-4 space-y-3 font-pixel text-[10px]">
          {/* E2EE Active */}
          <div className="p-3 bg-zinc-950 border border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-emerald-300 block">CIFRADO EXTREMO A EXTREMO:</span>
                <span className="font-vt text-xs text-zinc-400">AES-256-GCM + Handshake Criptográfico Retro</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600">
              ACTIVO
            </span>
          </div>

          {/* Zero Logs & Privacy */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-cyan-300 block">POLÍTICA ZERO-TELEMETRY:</span>
                <span className="font-vt text-xs text-zinc-400">Tus hábitos de visualización no se venden a terceros</span>
              </div>
            </div>
            <span className="text-emerald-400">100% PRIVADO</span>
          </div>

          {/* Legal Compliance */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-amber-300 block">ESTADO LEGAL & LICENCIAS:</span>
                <span className="font-vt text-xs text-zinc-400">Creative Commons CC-BY + Dominio Público Oficial</span>
              </div>
            </div>
            <span className="text-amber-300">CERTIFICADO</span>
          </div>

          {/* Session Token */}
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 block mb-1">TOKEN DE SESIÓN CRIPTOGRÁFICO:</span>
            <div className="bg-zinc-900 p-2 border border-zinc-700 font-vt text-sm text-emerald-400 truncate">
              {tokenAudit} • NODE_HASH: 9a7b-8c2f-e811
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 text-zinc-950 font-pixel text-[10px] hover:bg-emerald-400 pixel-btn"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};
