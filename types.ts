
export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  lastModified: number;
  isAudio: boolean;
  subtitleUrl?: string;
  subtitleName?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPiP: boolean;
  isControlsVisible: boolean;
}

export interface AIAnalysis {
  timestamp: number;
  description: string;
  confidence?: number;
}
