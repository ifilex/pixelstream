import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Send, 
  RefreshCw, 
  Play, 
  Zap, 
  Heart, 
  Cpu, 
  Flame,
  MessageSquare
} from 'lucide-react';
import { AIRecommendation, Channel, VideoContent, UserProfile } from '../types';
import { GeminiService } from '../services/geminiService';
import { soundEffects } from '../services/soundEffects';

interface AIRecommenderProps {
  userProfile: UserProfile;
  channels: Channel[];
  vodCatalog: VideoContent[];
  onPlayChannel: (channel: Channel) => void;
  onPlayVod: (vod: VideoContent) => void;
}

export const AIRecommender: React.FC<AIRecommenderProps> = ({
  userProfile,
  channels,
  vodCatalog,
  onPlayChannel,
  onPlayVod,
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string>('Nostalgia Arcade 8-bit');
  
  // Chat with RetroBot 8000
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: '👾 [RETROBOT 8000]: ¡BEEP BOOP! Soy tu guía inteligente con IA Gemini. Dime qué te apetece ver hoy o elige un modo de sintonización.' }
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  const MOOD_OPTIONS = [
    { label: '🕹️ Nostalgia Arcade 8-bit', value: 'Nostalgia Arcade 8-bit' },
    { label: '🚀 Cyberpunk & Sci-Fi 80s', value: 'Cyberpunk & Sci-Fi 80s' },
    { label: '📻 Chiptune Relax & Lo-Fi', value: 'Chiptune Relax & Lo-Fi' },
    { label: '🍿 Dibujos Clásicos Animados', value: 'Dibujos Clásicos Animados' },
    { label: '🛰️ Cosmos & Ciencia', value: 'Cosmos & Ciencia' },
  ];

  const fetchRecommendations = async (mood: string = selectedMood) => {
    setIsLoadingRecs(true);
    soundEffects.playBeep(600, 0.05);
    try {
      const recs = await GeminiService.getRecommendations(userProfile, channels, vodCatalog, mood);
      setRecommendations(recs);
    } catch {
      // fallback handled in service
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedMood]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isBotThinking) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    soundEffects.playBeep(450, 0.03);

    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsBotThinking(true);

    try {
      const botResponse = await GeminiService.chatWithRetroBot(userText);
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      soundEffects.playCoin();
    } catch {
      setChatMessages(prev => [
        ...prev, 
        { sender: 'bot', text: '🤖 [SISTEMA]: Te recomiendo explorar los canales de noticias o películas en el catálogo retro.' }
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handlePlayRecommended = (rec: AIRecommendation) => {
    soundEffects.playBeep(600, 0.05);
    if (rec.type === 'live') {
      const ch = channels.find(c => c.id === rec.channelOrContentId);
      if (ch) onPlayChannel(ch);
    } else {
      const vod = vodCatalog.find(v => v.id === rec.channelOrContentId);
      if (vod) onPlayVod(vod);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-2.5 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 text-zinc-950 flex items-center justify-center font-pixel text-[10px] font-bold rounded">
            IA
          </div>
          <div>
            <h2 className="font-pixel text-[11px] sm:text-xs text-purple-400 leading-tight">
              RECOMENDADOR INTELIGENTE GEMINI 3.7
            </h2>
            <p className="font-vt text-[11px] text-zinc-400 hidden sm:block">
              Predicción de gustos y generación de programación personalizada
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchRecommendations(selectedMood)}
          disabled={isLoadingRecs}
          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-purple-400 border border-zinc-700 rounded font-pixel text-[8px] flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingRecs ? 'animate-spin' : ''}`} />
          <span>RENOVAR</span>
        </button>
      </div>

      {/* Mood Selectors */}
      <div className="p-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center gap-1 overflow-x-auto scrollbar-thin shrink-0">
        <span className="font-pixel text-[8px] text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
          <Flame className="w-3 h-3 text-amber-400" />
          MOOD:
        </span>
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelectedMood(m.value)}
            className={`px-2 py-0.5 rounded font-pixel text-[8px] border transition-all whitespace-nowrap shrink-0 ${
              selectedMood === m.value
                ? 'bg-purple-950 text-purple-300 border-purple-400 font-bold shadow-[0_0_6px_rgba(168,85,247,0.4)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Internal Scroll Container */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-3">
        {/* Recommended Cards */}
        <div>
          <div className="flex items-center gap-1 text-[9px] font-pixel text-purple-400 mb-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>SELECCIÓN PERSONALIZADA PARA {userProfile.name.toUpperCase()}:</span>
          </div>

          {isLoadingRecs ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="font-pixel text-[9px] text-purple-400 animate-pulse">
                ANALIZANDO HISTORIAL Y GENERANDO RECOMENDACIONES...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => handlePlayRecommended(rec)}
                  className="bg-zinc-900/70 border border-zinc-800 hover:border-purple-500 p-2.5 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded font-pixel text-[7px] font-bold">
                        {rec.matchScore}% MATCH
                      </span>
                      <span className="font-pixel text-[7px] text-zinc-500">
                        {rec.type === 'live' ? '📺 CANAL EN VIVO' : '🎬 VOD'}
                      </span>
                    </div>

                    <h4 className="font-pixel text-[10px] text-zinc-100 group-hover:text-purple-300 truncate">
                      {rec.title}
                    </h4>
                    <p className="font-vt text-xs text-purple-300/80 italic mt-0.5">
                      "{rec.reason}"
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="font-pixel text-[7px] text-zinc-500">
                      TAG: {rec.badge || 'DESTACADO'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayRecommended(rec);
                      }}
                      className="px-2 py-0.5 bg-purple-500 hover:bg-purple-400 text-zinc-950 font-pixel text-[8px] font-bold rounded flex items-center gap-1"
                    >
                      <Play className="w-2 h-2 fill-current" /> SINTONIZAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RetroBot 8000 Mini Chat */}
        <div className="bg-zinc-900/90 border border-purple-950/80 p-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-[9px] font-pixel text-purple-400">
            <Bot className="w-3.5 h-3.5" />
            <span>RETROBOT 8000 • CHAT INTELIGENTE DE PROGRAMACIÓN</span>
          </div>

          <div className="my-2 space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin p-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg font-vt text-xs leading-tight ${
                  msg.sender === 'user'
                    ? 'bg-purple-950/60 border border-purple-800 text-purple-200 ml-4'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300 mr-4'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isBotThinking && (
              <div className="p-2 bg-zinc-950 rounded border border-zinc-800 font-pixel text-[8px] text-purple-400 animate-pulse">
                RETROBOT ESTÁ ESCRIBIENDO...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Pregúntale a RetroBot: ¿Qué película me recomiendas para relajarme?"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-purple-500 px-2 py-1 font-pixel text-[9px] text-purple-300 placeholder-zinc-600 focus:outline-none rounded"
            />
            <button
              type="submit"
              disabled={isBotThinking}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold font-pixel text-[9px] rounded flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
