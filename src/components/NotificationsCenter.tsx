import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Tv, 
  ShieldCheck, 
  Wifi, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { NotificationItem } from '../types';
import { soundEffects } from '../services/soundEffects';

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectTarget?: (targetId: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectTarget,
}) => {
  if (!isOpen) return null;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'premiere': return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'live_event': return <Tv className="w-4 h-4 text-emerald-400" />;
      case 'parental': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'device_sync': return <Wifi className="w-4 h-4 text-pink-400" />;
      default: return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border-4 border-yellow-500 p-4 sm:p-5 shadow-[8px_8px_0px_#000] text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 text-zinc-950 flex items-center justify-center font-pixel text-base pixel-box">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-yellow-400">
                CENTRO DE NOTIFICACIONES & ESTRENOS
              </h3>
              <p className="font-vt text-zinc-400 text-xs">Alertas de programación, directos y sincronización</p>
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

        {/* Action Bar */}
        <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 font-pixel text-[9px]">
          <span className="text-zinc-400">TOTAL: {notifications.length} AVISOS</span>
          <button
            onClick={() => {
              soundEffects.playBeep(520, 0.04);
              onMarkAllRead();
            }}
            className="text-emerald-400 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>MARCAR COMO LEÍDAS</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.targetId && onSelectTarget) {
                  soundEffects.playZap();
                  onSelectTarget(n.targetId);
                  onClose();
                }
              }}
              className={`p-3 border-2 transition-all cursor-pointer ${
                n.isRead
                  ? 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
                  : 'bg-zinc-950 border-yellow-500/80 text-zinc-200 shadow-[2px_2px_0px_#000]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-zinc-900 border border-zinc-700 shrink-0">
                  {getNotifIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-pixel text-xs text-yellow-300">
                      {n.title}
                    </h4>
                    <span className="font-vt text-xs text-zinc-500">{n.time}</span>
                  </div>
                  <p className="font-vt text-zinc-300 text-sm mt-1">
                    {n.message}
                  </p>
                  {n.targetId && (
                    <span className="inline-block mt-1 font-pixel text-[8px] text-emerald-400 underline">
                      ▶ IR AL PROGRAMA
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
