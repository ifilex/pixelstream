import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Volume2, 
  CheckCircle,
  Command
} from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { soundEffects } from '../services/soundEffects';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (actionData: any) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('Presiona el micrófono y di un comando en lenguaje natural...');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      soundEffects.playBeep(650, 0.05);
      // Initialize SpeechRecognition if available
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recog = new SpeechRecognitionClass();
        recog.lang = 'es-ES';
        recog.continuous = false;
        recog.interimResults = true;

        recog.onresult = (event: any) => {
          const current = event.results[0][0].transcript;
          setTranscript(current);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        setRecognitionInstance(recog);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    soundEffects.playBeep(880, 0.08);
    setTranscript('');
    setFeedback('Escuchando tu voz retro... ¡habla ahora!');
    setIsListening(true);

    if (recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch {
        // already started
      }
    } else {
      // Fallback simulation after 2 seconds
      setTimeout(() => {
        const sampleCommands = ['Pon canal 801 arcade', 'Activar scanlines CRT', 'Abrir descargas offline', 'Ver Sintel'];
        const randomCmd = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        setTranscript(randomCmd);
        setIsListening(false);
      }, 2500);
    }
  };

  const handleProcessVoice = async (textToProcess: string = transcript) => {
    if (!textToProcess.trim()) return;
    soundEffects.playZap();
    setFeedback('Procesando comando con IA Gemini...');
    
    try {
      const parsed = await GeminiService.parseVoiceCommand(textToProcess);
      soundEffects.playFanfare();
      setFeedback(parsed.feedback || `Comando ejecutado: ${textToProcess}`);
      
      setTimeout(() => {
        onExecuteAction(parsed);
        onClose();
      }, 1200);
    } catch {
      setFeedback('No se pudo procesar el comando. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 border-4 border-cyan-500 p-5 shadow-[8px_8px_0px_#000] text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 text-zinc-950 flex items-center justify-center font-pixel text-base pixel-box">
              <Mic className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-cyan-400">
                CONTROL DE VOZ RETRO 8-BIT
              </h3>
              <p className="font-vt text-zinc-400 text-xs">Comandos por voz impulsados por Gemini AI</p>
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

        {/* Microphone Button & Visualizer */}
        <div className="py-6 flex flex-col items-center text-center">
          <button
            onClick={isListening ? () => setIsListening(false) : handleStartListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 pixel-box transition-all ${
              isListening
                ? 'bg-red-600 border-white text-white animate-pulse shadow-[0_0_20px_#ef4444]'
                : 'bg-cyan-500 border-black text-zinc-950 hover:bg-cyan-400'
            }`}
          >
            {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
          </button>

          {/* 8-bit Audio Equalizer animation when listening */}
          {isListening && (
            <div className="flex items-end gap-1 h-8 mt-4">
              {[4, 8, 12, 16, 12, 8, 14, 18, 10, 6].map((h, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-cyan-400 animate-pulse"
                  style={{ height: `${h * 1.5}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}

          {/* Transcript Display */}
          <div className="mt-4 w-full bg-zinc-950 border-2 border-zinc-800 p-3 min-h-[60px] flex items-center justify-center text-center">
            <p className="font-pixel text-xs text-cyan-300">
              {transcript ? `"${transcript}"` : '...'}
            </p>
          </div>

          <p className="font-vt text-sm text-zinc-400 mt-2">
            {feedback}
          </p>

          {transcript && !isListening && (
            <button
              onClick={() => handleProcessVoice(transcript)}
              className="mt-3 px-5 py-2 bg-cyan-500 text-zinc-950 font-pixel text-[10px] hover:bg-cyan-400 pixel-btn"
            >
              EJECUTAR COMANDO
            </button>
          )}
        </div>

        {/* Quick Voice Shortcuts */}
        <div className="mt-2 pt-3 border-t border-zinc-800">
          <p className="font-pixel text-[9px] text-zinc-400 mb-2 flex items-center gap-1">
            <Command className="w-3 h-3 text-cyan-400" />
            <span>ATAJOS DE VOZ RÁPIDOS:</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5 font-pixel text-[8px]">
            {[
              'Pon canal 801 arcade',
              'Sintoniza Sci-Fi 802',
              'Activar filtro CRT',
              'Ver descargas offline',
              'Entrar a la Sala AR',
              'Bloquear contenido infantil'
            ].map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(shortcut);
                  handleProcessVoice(shortcut);
                }}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 border border-zinc-800 text-left truncate"
              >
                🎙️ "{shortcut}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
