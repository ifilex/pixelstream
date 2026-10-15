import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const PORT = 3000;

// Initialize Gemini Client lazily or safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Content Recommendations Endpoint
  app.post('/api/gemini/recommendations', async (req, res) => {
    try {
      const { userProfile, channels, vodCatalog, mood } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback intelligent curated heuristic if API key is not yet set
        return res.json({
          recommendations: [
            {
              id: 'rec-1',
              title: '8-BIT ARCADE TV: Torneo Speedrun 1989',
              type: 'live',
              channelOrContentId: 'ch-retro-1',
              category: 'retro_gaming',
              badge: '98% MATCH RETRO',
              reason: 'Basado en tu pasión por los clásicos de 8-bit y videojuegos de plataforma.',
              matchScore: 98,
              suggestedAt: 'En directo ahora',
            },
            {
              id: 'rec-2',
              title: 'Tears of Steel: Amsterdam Cyberpunk',
              type: 'vod',
              channelOrContentId: 'vod-tears-2',
              category: 'movies_cinema',
              badge: 'CYBERPUNK PICK',
              reason: 'Coincide con tu gusto por la ciencia ficción clásica y robótica futurista.',
              matchScore: 94,
              suggestedAt: 'Bajo Demanda',
            },
            {
              id: 'rec-3',
              title: 'Chiptune Symphony: FM Synthesis',
              type: 'vod',
              channelOrContentId: 'vod-synth-6',
              category: 'chiptune_music',
              badge: 'CHIPTUNE VIBE',
              reason: 'Excelente música nostálgica con sintetizadores de 8-bits.',
              matchScore: 91,
              suggestedAt: 'Bajo Demanda',
            }
          ]
        });
      }

      const prompt = `Act as the 8-bit Retro AI Recommendation Engine for a legal IPTV & VOD platform called PixelStream.
User Profile:
- Name: ${userProfile?.name || 'Player 1'}
- Is Kids Profile: ${userProfile?.isKids ? 'YES' : 'NO'}
- Preferred Genres: ${JSON.stringify(userProfile?.preferredGenres || [])}
- Watch History: ${JSON.stringify(userProfile?.watchHistory || [])}
- Selected Mood/Filter: ${mood || 'retro nostalgia'}

Available Live Channels:
${JSON.stringify(channels?.map((c: any) => ({ id: c.id, name: c.name, category: c.category, currentShow: c.currentShow?.title, rating: c.rating })) || [])}

Available On-Demand VODs:
${JSON.stringify(vodCatalog?.map((v: any) => ({ id: v.id, title: v.title, category: v.category, rating: v.rating, tags: v.tags })) || [])}

Provide 3 to 4 personalized recommendations in structured JSON format matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, description: "'live' or 'vod'" },
                    channelOrContentId: { type: Type.STRING },
                    category: { type: Type.STRING },
                    badge: { type: Type.STRING },
                    reason: { type: Type.STRING, description: "Nostalgic 8-bit styled explanation in Spanish" },
                    matchScore: { type: Type.NUMBER },
                    suggestedAt: { type: Type.STRING },
                  },
                  required: ['id', 'title', 'type', 'channelOrContentId', 'badge', 'reason', 'matchScore'],
                },
              },
            },
            required: ['recommendations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error generating recommendations:', err);
      // Return safe fallback
      return res.json({
        recommendations: [
          {
            id: 'rec-fallback-1',
            title: '8-BIT ARCADE TV',
            type: 'live',
            channelOrContentId: 'ch-retro-1',
            category: 'retro_gaming',
            badge: 'ESTRENO RETRO',
            reason: 'Recomendado por alta sintonía en la comunidad PixelStream.',
            matchScore: 95,
            suggestedAt: 'Ahora',
          }
        ]
      });
    }
  });

  // AI Retro Concierge Chat Endpoint ("RetroBot 8000")
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `🤖 [RETROBOT 8000]: ¡BEEP BOOP! He procesado tu comando "${message}". Te sugiero sintonizar el Canal 801 (8-BIT ARCADE TV) para speedruns o Canal 802 (RETRO SCI-FI) para clásicos espaciales.`
        });
      }

      const systemPrompt = `You are RetroBot 8000, an enthusiastic, nostalgic 8-bit arcade TV assistant and EPG guide expert for the legal IPTV platform "PixelStream 8-Bit".
Speak in Spanish with retro gaming flavor (use fun pixel terms like "INSERT COIN", "1-UP", "PIXEL-PERFECT", "HIGH SCORE", "LEVEL CLEAR").
You know about:
- Live channels: 801 (8-Bit Arcade TV), 802 (Retro Sci-Fi Theater), 803 (Vintage Toon Vault), 804 (Cosmos & Nature), 805 (Chiptune FM), 806 (Retro Combat Arena), 807 (World Teletext).
- On-Demand movies: Sintel, Tears of Steel, Big Buck Bunny, Elephants Dream.
- Features: Parental PIN locks (1984), Offline downloads, Cloud multi-device sync, Battery Saver 8-bit modes.
Keep answers concise, fun, and helpful.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `${systemPrompt}\nUser says: ${message}`,
      });

      return res.json({ reply: response.text });
    } catch (err: any) {
      console.error('Error in chat:', err);
      return res.json({
        reply: `🤖 [RETROBOT 8000]: *BZZZZT* ¡Sobrecarga de circuito! Te recomiendo ver 'Sintel' o sintonizar el canal 801 para acción arcade inmediata.`
      });
    }
  });

  // Smart Voice Command Parser
  app.post('/api/gemini/voice-parse', async (req, res) => {
    try {
      const { transcript } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback regex parsing
        const lower = (transcript || '').toLowerCase();
        if (lower.includes('801') || lower.includes('arcade') || lower.includes('gaming')) {
          return res.json({ action: 'change_channel', channelId: 'ch-retro-1', channelNumber: 801, feedback: 'Cambiando a Canal 801 Arcade TV' });
        }
        if (lower.includes('802') || lower.includes('cine') || lower.includes('sci fi') || lower.includes('ciencia')) {
          return res.json({ action: 'change_channel', channelId: 'ch-cinema-2', channelNumber: 802, feedback: 'Cambiando a Canal 802 Sci-Fi Theater' });
        }
        if (lower.includes('803') || lower.includes('dibujos') || lower.includes('toons') || lower.includes('popeye')) {
          return res.json({ action: 'change_channel', channelId: 'ch-toons-3', channelNumber: 803, feedback: 'Cambiando a Canal 803 Toon Vault' });
        }
        if (lower.includes('crt') || lower.includes('scanline') || lower.includes('filtro')) {
          return res.json({ action: 'toggle_crt', feedback: 'Alternando filtro de pantalla CRT Scanlines' });
        }
        if (lower.includes('descarg') || lower.includes('offline') || lower.includes('bajar')) {
          return res.json({ action: 'open_offline', feedback: 'Abriendo Gestor de Descargas Offline' });
        }
        if (lower.includes('parental') || lower.includes('bloque') || lower.includes('niñ')) {
          return res.json({ action: 'open_parental', feedback: 'Abriendo Control Parental Arcade' });
        }
        if (lower.includes('ar') || lower.includes('habitacion') || lower.includes('sala')) {
          return res.json({ action: 'open_ar_room', feedback: 'Entrando a la Sala Arcade Retro Inmersiva' });
        }
        return res.json({ action: 'search', query: transcript, feedback: `Buscando en el catálogo: "${transcript}"` });
      }

      const prompt = `Parse this spoken TV command into an action for PixelStream IPTV: "${transcript}".
Available actions:
- change_channel (requires channelId and channelNumber: ch-retro-1=801, ch-cinema-2=802, ch-toons-3=803, ch-docs-4=804, ch-music-5=805, ch-esports-6=806, ch-news-7=807)
- open_vod (requires vodId: vod-sintel-1, vod-tears-2, vod-bunny-3, vod-elephant-4, vod-speedrun-5, vod-synth-6)
- toggle_crt
- toggle_sound
- open_offline
- open_parental
- open_sync
- open_ar_room
- search (requires query)

Return JSON with schema: action, channelId (optional), channelNumber (optional), vodId (optional), query (optional), feedback (string in Spanish with 8-bit arcade tone).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error parsing voice command:', err);
      return res.json({ action: 'search', query: req.body?.transcript, feedback: `Comando recibido: ${req.body?.transcript}` });
    }
  });

  // Simulated Cloud Sync State API
  app.get('/api/sync/state', (req, res) => {
    res.json({
      cloudServer: 'PixelStream Cloud Matrix v3.4',
      e2eeEncrypted: true,
      encryptionCipher: 'AES-256-GCM + Retro-Diffie-Hellman',
      activeSyncNodes: 3,
      streamIntegrity: '100% DRM-Compliant Public Domain & Creative Commons',
      lastSyncedTimestamp: Date.now(),
    });
  });

  // Server-Side IPTV Playlist Proxy (Bypasses CORS for external iptv-org playlists)
  app.get('/api/iptv/playlist', async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
      });
      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(data);
    } catch (err: any) {
      console.error('Error proxying IPTV playlist:', err);
      return res.status(500).json({ error: 'Failed to fetch playlist' });
    }
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PixelStream 8-Bit server running on http://localhost:${PORT}`);
  });
}

startServer();
