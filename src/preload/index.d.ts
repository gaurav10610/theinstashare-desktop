import { ElectronAPI } from './types';

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
