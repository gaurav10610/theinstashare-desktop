import { create } from 'zustand';
import { AISettings, MeetingNote } from '../core/types';

interface AIState {
  settings: AISettings;
  isTranscribing: boolean;
  liveTranscript: { time: string; speaker: string; text: string }[];
  meetingNotes: MeetingNote[];
  isGeneratingSummary: boolean;

  updateSettings: (updates: Partial<AISettings>) => void;
  setTranscribing: (active: boolean) => void;
  addTranscriptSegment: (segment: { time: string; speaker: string; text: string }) => void;
  clearLiveTranscript: () => void;
  addMeetingNote: (note: MeetingNote) => void;
  setGeneratingSummary: (generating: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  settings: {
    provider: 'ollama',
    apiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    enableLocalWhisper: true,
    enablePreFlightSanitizer: true
  },
  isTranscribing: false,
  liveTranscript: [],
  meetingNotes: [],
  isGeneratingSummary: false,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates }
    })),

  setTranscribing: (isTranscribing) => set({ isTranscribing }),

  addTranscriptSegment: (segment) =>
    set((state) => ({
      liveTranscript: [...state.liveTranscript, segment]
    })),

  clearLiveTranscript: () => set({ liveTranscript: [] }),

  addMeetingNote: (note) =>
    set((state) => ({
      meetingNotes: [note, ...state.meetingNotes]
    })),

  setGeneratingSummary: (isGeneratingSummary) => set({ isGeneratingSummary })
}));
