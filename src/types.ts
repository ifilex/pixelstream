export type ContentRating = 'G' | 'PG' | 'PG-13' | '18+';

export type ChannelCategory = 
  | 'retro_gaming'
  | 'movies_cinema'
  | 'cartoons_anime'
  | 'science_docs'
  | 'chiptune_music'
  | 'sports_esports'
  | 'news_culture';

export interface Channel {
  id: string;
  number: number;
  name: string;
  tagline: string;
  category: ChannelCategory;
  logo: string;
  banner: string;
  streamUrl: string;
  backupStreamUrl?: string;
  isLive: boolean;
  rating: ContentRating;
  currentShow: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    progressPercent: number;
    genre: string;
    nextShow: string;
  };
  schedule: Array<{
    time: string;
    title: string;
    duration: string;
    rating: ContentRating;
  }>;
  resolution: string;
  bitrate: string;
  fps: number;
  isLegalPublicDomain: boolean;
}

export interface VideoContent {
  id: string;
  title: string;
  year: number;
  duration: string;
  durationSeconds: number;
  category: ChannelCategory;
  rating: ContentRating;
  thumbnail: string;
  videoUrl: string;
  description: string;
  director?: string;
  license: string;
  tags: string[];
  views: number;
  fileSizeBytes: number;
  qualityOptions: Array<{
    label: string;
    resolution: string;
    sizeMb: number;
    bitrate: string;
  }>;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarIcon: string;
  color: string;
  isKids: boolean;
  pinProtected: boolean;
  dailyTimeLimitMinutes: number;
  usedTimeMinutes: number;
  favorites: string[];
  watchHistory: Array<{
    contentId: string;
    title: string;
    type: 'live' | 'vod';
    timestamp: number;
    progressPercent: number;
  }>;
  preferredGenres: ChannelCategory[];
}

export interface DownloadedItem {
  id: string;
  contentId: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  fileSizeBytes: number;
  downloadedAt: number;
  quality: string;
  category: ChannelCategory;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'crt_tv' | 'gameboy_handheld' | 'retro_tablet' | 'arcade_cabinet' | 'mobile';
  ip: string;
  location: string;
  isCurrentDevice: boolean;
  activeChannelOrVod?: string;
  playbackPositionSeconds: number;
  lastActive: string;
  batteryStatus?: number;
  syncState: 'synchronized' | 'buffering' | 'idle';
}

export interface ParentalSettings {
  enabled: boolean;
  pin: string;
  maxAllowedRating: ContentRating;
  restrictedCategories: ChannelCategory[];
  enforceTimeLimit: boolean;
  timeLimitMinutes: number;
  hideAdultChannels: boolean;
}

export interface BatteryOptimizationSettings {
  mode: 'battery_saver' | 'ultra_data_saver' | 'turbo_arcade';
  maxFramerate: 30 | 60;
  enableCrtBloom: boolean;
  enableScanlines: boolean;
  audioSampleRate: 'eco' | 'full';
  autoReduceOnBattery: boolean;
}

export interface AIRecommendation {
  id: string;
  title: string;
  type: 'live' | 'vod';
  channelOrContentId: string;
  category: ChannelCategory;
  badge: string;
  reason: string;
  matchScore: number;
  suggestedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'premiere' | 'live_event' | 'parental' | 'device_sync' | 'download_complete';
  isRead: boolean;
  targetId?: string;
}
