import { create } from 'zustand';
import { CallState, ScreenAnnotation } from '../core/types';

interface CallStoreState extends CallState {
  annotations: ScreenAnnotation[];
  laserPosition: { x: number; y: number; author: string } | null;

  startCall: (peerId: string, peerName: string, mode: 'audio' | 'video' | 'screen') => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleSystemSound: () => void;
  toggleAnnotation: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  addAnnotation: (annotation: ScreenAnnotation) => void;
  clearAnnotations: () => void;
  setLaserPosition: (pos: { x: number; y: number; author: string } | null) => void;
  incrementDuration: () => void;
}

export const useCallStore = create<CallStoreState>((set) => ({
  isActive: false,
  peerId: null,
  peerName: null,
  mode: 'video',
  isAudioMuted: false,
  isVideoMuted: false,
  isScreenSharing: false,
  isSystemSoundEnabled: false,
  isAnnotationEnabled: false,
  durationSeconds: 0,
  remoteStream: null,
  localStream: null,
  annotations: [],
  laserPosition: null,

  startCall: (peerId, peerName, mode) =>
    set({
      isActive: true,
      peerId,
      peerName,
      mode,
      durationSeconds: 0,
      annotations: []
    }),

  endCall: () =>
    set((state) => {
      state.localStream?.getTracks().forEach((t) => t.stop());
      return {
        isActive: false,
        peerId: null,
        peerName: null,
        remoteStream: null,
        localStream: null,
        isScreenSharing: false,
        isAnnotationEnabled: false,
        durationSeconds: 0,
        annotations: []
      };
    }),

  toggleAudio: () =>
    set((state) => {
      if (state.localStream) {
        state.localStream.getAudioTracks().forEach((t) => {
          t.enabled = state.isAudioMuted;
        });
      }
      return { isAudioMuted: !state.isAudioMuted };
    }),

  toggleVideo: () =>
    set((state) => {
      if (state.localStream) {
        state.localStream.getVideoTracks().forEach((t) => {
          t.enabled = state.isVideoMuted;
        });
      }
      return { isVideoMuted: !state.isVideoMuted };
    }),

  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  toggleSystemSound: () => set((state) => ({ isSystemSoundEnabled: !state.isSystemSoundEnabled })),
  toggleAnnotation: () => set((state) => ({ isAnnotationEnabled: !state.isAnnotationEnabled })),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),

  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [...state.annotations, annotation]
    })),

  clearAnnotations: () => set({ annotations: [] }),
  setLaserPosition: (laserPosition) => set({ laserPosition }),
  incrementDuration: () => set((state) => ({ durationSeconds: state.durationSeconds + 1 }))
}));
