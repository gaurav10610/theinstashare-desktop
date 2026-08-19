import { create } from 'zustand';
import { TransferFile } from '../core/types';

interface FileState {
  transfers: Record<string, TransferFile>;
  dropShelfFiles: Array<{ id: string; name: string; size: number; file: File; path?: string }>;
  activeFolderSyncPath: string | null;
  isFolderSyncing: boolean;
  folderSyncEvents: Array<{ type: 'add' | 'change' | 'unlink'; relativePath: string; timestamp: number }>;

  addTransfer: (file: TransferFile) => void;
  updateTransfer: (id: string, updates: Partial<TransferFile>) => void;
  removeTransfer: (id: string) => void;
  addDropShelfFiles: (files: File[]) => void;
  removeDropShelfFile: (id: string) => void;
  clearDropShelf: () => void;
  setActiveFolderSyncPath: (path: string | null) => void;
  addFolderSyncEvent: (event: { type: 'add' | 'change' | 'unlink'; relativePath: string }) => void;
}

export const useFileStore = create<FileState>((set) => ({
  transfers: {},
  dropShelfFiles: [],
  activeFolderSyncPath: null,
  isFolderSyncing: false,
  folderSyncEvents: [],

  addTransfer: (file) =>
    set((state) => ({
      transfers: { ...state.transfers, [file.id]: file }
    })),

  updateTransfer: (id, updates) =>
    set((state) => {
      const existing = state.transfers[id];
      if (!existing) return state;
      return {
        transfers: {
          ...state.transfers,
          [id]: { ...existing, ...updates }
        }
      };
    }),

  removeTransfer: (id) =>
    set((state) => {
      const newTransfers = { ...state.transfers };
      delete newTransfers[id];
      return { transfers: newTransfers };
    }),

  addDropShelfFiles: (files) =>
    set((state) => {
      const newItems = files.map((file) => ({
        id: `shelf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        file,
        path: (file as any).path
      }));
      return { dropShelfFiles: [...state.dropShelfFiles, ...newItems] };
    }),

  removeDropShelfFile: (id) =>
    set((state) => ({
      dropShelfFiles: state.dropShelfFiles.filter((f) => f.id !== id)
    })),

  clearDropShelf: () => set({ dropShelfFiles: [] }),

  setActiveFolderSyncPath: (path) =>
    set({
      activeFolderSyncPath: path,
      isFolderSyncing: path !== null
    }),

  addFolderSyncEvent: (event) =>
    set((state) => ({
      folderSyncEvents: [
        { ...event, timestamp: Date.now() },
        ...state.folderSyncEvents.slice(0, 49)
      ]
    }))
}));
