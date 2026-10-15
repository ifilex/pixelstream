import { AIRecommendation, Channel, VideoContent, UserProfile } from '../types';

export class GeminiService {
  /**
   * Fetch AI Recommendations from server
   */
  static async getRecommendations(
    userProfile: UserProfile,
    channels: Channel[],
    vodCatalog: VideoContent[],
    mood?: string
  ): Promise<AIRecommendation[]> {
    try {
      const res = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, channels, vodCatalog, mood }),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      return data.recommendations || [];
    } catch (err) {
      console.warn('Gemini recommendations fetch error, returning fallback', err);
      return [
        {
          id: 'rec-fb-1',
          title: '8-BIT ARCADE TV: Gran Torneo 1989',
          type: 'live',
          channelOrContentId: 'ch-retro-1',
          category: 'retro_gaming',
          badge: 'RETRO TOP PICK',
          reason: 'Basado en tus preferencias por los clásicos y estética 8-bit.',
          matchScore: 97,
          suggestedAt: 'Ahora en Vivo',
        },
        {
          id: 'rec-fb-2',
          title: 'Tears of Steel (VOD)',
          type: 'vod',
          channelOrContentId: 'vod-tears-2',
          category: 'movies_cinema',
          badge: 'CYBERPUNK HIT',
          reason: 'Excelente cine de ciencia ficción con estética cyberpunk futurista.',
          matchScore: 92,
          suggestedAt: 'Bajo Demanda',
        },
      ];
    }
  }

  /**
   * Chat with RetroBot 8000
   */
  static async chatWithRetroBot(message: string): Promise<string> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('Chat network error');
      const data = await res.json();
      return data.reply || '👾 [RETROBOT]: *BEEP* ¡Listo para jugar!';
    } catch {
      return '👾 [RETROBOT]: ¡Hola! Sintoniza el Canal 801 para ver torneos retro de videojuegos o Canal 802 para cine clásico.';
    }
  }

  /**
   * Parse voice commands
   */
  static async parseVoiceCommand(transcript: string): Promise<{
    action: string;
    channelId?: string;
    channelNumber?: number;
    vodId?: string;
    query?: string;
    feedback: string;
  }> {
    try {
      const res = await fetch('/api/gemini/voice-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error('Voice parse error');
      return await res.json();
    } catch {
      return {
        action: 'search',
        query: transcript,
        feedback: `Comando de voz: "${transcript}"`,
      };
    }
  }
}
