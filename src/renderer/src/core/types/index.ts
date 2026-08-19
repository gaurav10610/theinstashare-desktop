export interface Peer {
  id: string;
  name: string;
  avatar: string;
  ip: string;
  os: 'mac' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown';
  isLocal: boolean;
  connectionState: 'idle' | 'connecting' | 'connected' | 'failed' | 'disconnected';
  lastSeen: number;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  attachments?: {
    id: string;
    name: string;
    size: number;
    mime: string;
  }[];
}

export interface TransferFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number; // 0..100
  speed: number; // bytes/sec
  direction: 'upload' | 'download';
  status: 'queued' | 'transferring' | 'paused' | 'completed' | 'error';
  peerId: string;
  peerName: string;
  filePath?: string;
  error?: string;
  totalChunks?: number;
  completedChunks?: number;
  hash?: string;
}

export interface CallState {
  isActive: boolean;
  peerId: string | null;
  peerName: string | null;
  mode: 'audio' | 'video' | 'screen';
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isSystemSoundEnabled: boolean;
  isAnnotationEnabled: boolean;
  durationSeconds: number;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
}

export interface ScreenAnnotation {
  id: string;
  type: 'pen' | 'arrow' | 'rect' | 'laser';
  points: { x: number; y: number }[];
  color: string;
  size: number;
  author: string;
  timestamp: number;
}

export interface AISettings {
  provider: 'ollama' | 'gemini' | 'claude' | 'openai' | 'groq';
  apiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  enableLocalWhisper: boolean;
  enablePreFlightSanitizer: boolean;
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  summary: string;
  transcript: { time: string; speaker: string; text: string }[];
  actionItems: string[];
  decisions: string[];
}
