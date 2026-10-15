import { 
  UserProfile, 
  ParentalSettings, 
  BatteryOptimizationSettings, 
  DownloadedItem, 
  ConnectedDevice,
  NotificationItem 
} from '../types';
import { LEGAL_CHANNELS, VOD_CATALOG } from '../data/channelsData';

const STORAGE_KEYS = {
  PROFILES: 'pixelstream_profiles_v1',
  ACTIVE_PROFILE_ID: 'pixelstream_active_profile_id',
  PARENTAL: 'pixelstream_parental_v1',
  BATTERY: 'pixelstream_battery_v1',
  DOWNLOADS: 'pixelstream_downloads_v1',
  DEVICES: 'pixelstream_devices_v1',
  NOTIFICATIONS: 'pixelstream_notifications_v1',
  CRT_SETTINGS: 'pixelstream_crt_settings',
  LANGUAGE: 'pixelstream_language',
};

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'prof-p1',
    name: 'PLAYER 1',
    avatarIcon: '👾',
    color: '#10b981',
    isKids: false,
    pinProtected: false,
    dailyTimeLimitMinutes: 180,
    usedTimeMinutes: 45,
    favorites: ['ch-retro-1', 'ch-cinema-2', 'vod-sintel-1'],
    watchHistory: [
      { contentId: 'ch-retro-1', title: '8-BIT ARCADE TV', type: 'live', timestamp: Date.now() - 1000 * 60 * 30, progressPercent: 60 },
      { contentId: 'vod-sintel-1', title: 'Sintel: The Dragon Quest', type: 'vod', timestamp: Date.now() - 1000 * 60 * 120, progressPercent: 100 },
    ],
    preferredGenres: ['retro_gaming', 'movies_cinema', 'chiptune_music'],
  },
  {
    id: 'prof-kids',
    name: 'KIDS ARCADE',
    avatarIcon: '🍄',
    color: '#f59e0b',
    isKids: true,
    pinProtected: true,
    dailyTimeLimitMinutes: 60,
    usedTimeMinutes: 20,
    favorites: ['ch-toons-3', 'vod-bunny-3'],
    watchHistory: [
      { contentId: 'ch-toons-3', title: 'VINTAGE TOON VAULT', type: 'live', timestamp: Date.now() - 1000 * 60 * 45, progressPercent: 80 },
    ],
    preferredGenres: ['cartoons_anime', 'science_docs'],
  },
];

const DEFAULT_PARENTAL: ParentalSettings = {
  enabled: true,
  pin: '1984',
  maxAllowedRating: 'PG-13',
  restrictedCategories: [],
  enforceTimeLimit: false,
  timeLimitMinutes: 120,
  hideAdultChannels: true,
};

const DEFAULT_BATTERY: BatteryOptimizationSettings = {
  mode: 'battery_saver',
  maxFramerate: 60,
  enableCrtBloom: true,
  enableScanlines: true,
  audioSampleRate: 'full',
  autoReduceOnBattery: true,
};

const DEFAULT_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-crt-living',
    name: 'Living Room Sony Trinitron CRT (Sync Box)',
    type: 'crt_tv',
    ip: '192.168.1.104',
    location: 'Salón Principal',
    isCurrentDevice: true,
    activeChannelOrVod: 'ch-retro-1',
    playbackPositionSeconds: 420,
    lastActive: 'Ahora mismo',
    syncState: 'synchronized',
  },
  {
    id: 'dev-handheld',
    name: 'GameBoy Macro HD Handheld',
    type: 'gameboy_handheld',
    ip: '192.168.1.142',
    location: 'Habitación Retro',
    isCurrentDevice: false,
    activeChannelOrVod: 'vod-sintel-1',
    playbackPositionSeconds: 310,
    lastActive: 'Hace 12 min',
    batteryStatus: 78,
    syncState: 'synchronized',
  },
  {
    id: 'dev-arcade-cab',
    name: 'NeoGeo MVS Arcade Cabinet Display',
    type: 'arcade_cabinet',
    ip: '192.168.1.205',
    location: 'Arcade Room',
    isCurrentDevice: false,
    activeChannelOrVod: 'ch-esports-6',
    playbackPositionSeconds: 0,
    lastActive: 'Hace 1 hora',
    syncState: 'idle',
  },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🎮 Gran Estreno: Torneo Speedrun 1989',
    message: 'Comienza en directo el torneo internacional de plataformas 8-bit en Canal 801.',
    time: 'Hace 10 min',
    type: 'premiere',
    isRead: false,
    targetId: 'ch-retro-1',
  },
  {
    id: 'notif-2',
    title: '🔒 Control Parental Activado',
    message: 'El perfil KIDS ARCADE tiene activado el filtro de contenidos seguros.',
    time: 'Hace 1 hora',
    type: 'parental',
    isRead: true,
  },
  {
    id: 'notif-3',
    title: '☁️ Sincronización en la Nube',
    message: 'GameBoy Macro HD se ha sincronizado con tu lista de favoritos.',
    time: 'Hace 2 horas',
    type: 'device_sync',
    isRead: true,
  },
];

export class StorageService {
  // Profiles
  static getProfiles(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      this.saveProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILES;
    }
  }

  static saveProfiles(profiles: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  static getActiveProfile(): UserProfile {
    const profiles = this.getProfiles();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    const found = profiles.find(p => p.id === activeId);
    return found || profiles[0] || DEFAULT_PROFILES[0];
  }

  static setActiveProfileId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
  }

  static updateProfile(updated: UserProfile) {
    const profiles = this.getProfiles().map(p => p.id === updated.id ? updated : p);
    this.saveProfiles(profiles);
  }

  // Parental
  static getParentalSettings(): ParentalSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.PARENTAL);
    if (!raw) return DEFAULT_PARENTAL;
    try {
      return { ...DEFAULT_PARENTAL, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PARENTAL;
    }
  }

  static saveParentalSettings(settings: ParentalSettings) {
    localStorage.setItem(STORAGE_KEYS.PARENTAL, JSON.stringify(settings));
  }

  // Battery
  static getBatterySettings(): BatteryOptimizationSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.BATTERY);
    if (!raw) return DEFAULT_BATTERY;
    try {
      return { ...DEFAULT_BATTERY, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_BATTERY;
    }
  }

  static saveBatterySettings(settings: BatteryOptimizationSettings) {
    localStorage.setItem(STORAGE_KEYS.BATTERY, JSON.stringify(settings));
  }

  // Downloads (Offline Mode)
  static getDownloads(): DownloadedItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    if (!raw) {
      // Seed initial sample downloaded VOD for immediate offline demonstration
      const initial: DownloadedItem[] = [
        {
          id: 'dl-bunny',
          contentId: 'vod-bunny-3',
          title: 'Big Buck Bunny: Forest Guardian',
          duration: '09:56',
          thumbnail: VOD_CATALOG[2].thumbnail,
          videoUrl: VOD_CATALOG[2].videoUrl,
          fileSizeBytes: 70000000,
          downloadedAt: Date.now() - 1000 * 60 * 60 * 5,
          quality: 'CRT Standard (720p)',
          category: 'cartoons_anime',
        }
      ];
      this.saveDownloads(initial);
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveDownloads(items: DownloadedItem[]) {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(items));
  }

  static addDownload(vod: typeof VOD_CATALOG[0], qualityLabel: string): DownloadedItem {
    const current = this.getDownloads();
    const existing = current.find(d => d.contentId === vod.id);
    if (existing) return existing;

    const opt = vod.qualityOptions.find(q => q.label === qualityLabel) || vod.qualityOptions[0];
    const newItem: DownloadedItem = {
      id: `dl-${Date.now()}`,
      contentId: vod.id,
      title: vod.title,
      duration: vod.duration,
      thumbnail: vod.thumbnail,
      videoUrl: vod.videoUrl,
      fileSizeBytes: opt.sizeMb * 1024 * 1024,
      downloadedAt: Date.now(),
      quality: opt.label,
      category: vod.category,
    };
    this.saveDownloads([newItem, ...current]);
    return newItem;
  }

  static removeDownload(id: string) {
    const current = this.getDownloads().filter(d => d.id !== id);
    this.saveDownloads(current);
  }

  // Connected Devices
  static getConnectedDevices(): ConnectedDevice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!raw) {
      this.saveConnectedDevices(DEFAULT_DEVICES);
      return DEFAULT_DEVICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_DEVICES;
    }
  }

  static saveConnectedDevices(devices: ConnectedDevice[]) {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }

  static pairNewDevice(name: string, type: ConnectedDevice['type']): ConnectedDevice {
    const devices = this.getConnectedDevices();
    const newDev: ConnectedDevice = {
      id: `dev-${Date.now()}`,
      name,
      type,
      ip: `192.168.1.${Math.floor(Math.random() * 150 + 50)}`,
      location: 'Dispositivo Sincronizado',
      isCurrentDevice: false,
      activeChannelOrVod: 'ch-retro-1',
      playbackPositionSeconds: 0,
      lastActive: 'Recién emparejado',
      syncState: 'synchronized',
    };
    this.saveConnectedDevices([...devices, newDev]);
    return newDev;
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      this.saveNotifications(DEFAULT_NOTIFICATIONS);
      return DEFAULT_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  static saveNotifications(notifs: NotificationItem[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static markAllNotificationsRead() {
    const updated = this.getNotifications().map(n => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
  }

  // Language
  static getLanguage(): string {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'es';
  }

  static setLanguage(lang: string) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }
}
