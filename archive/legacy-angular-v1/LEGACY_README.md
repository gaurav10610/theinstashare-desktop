# Legacy TheInstaShare Desktop (v0.0.1 - Angular 12 + Electron 13)

This directory contains the historical, archived codebase of **TheInstaShare Desktop v0.0.1**.

## Archived Architecture Summary
- **Frontend Framework:** Angular 12 (Bootstrap with `angular-electron` starter)
- **UI Components:** Angular Material 12
- **Electron Version:** Electron 13.1.6
- **Native Remote Input:** `robotjs` 0.6.0 (Deprecated/Unmaintained)
- **Signaling:** Socket.IO client (`assets/js/socket.io.js`) connected to centralized signaling server
- **Data Transfer:** RTCDataChannel with manual 16KB ArrayBuffer chunk fragmentation and no backpressure stream management
- **Security Posture:** `nodeIntegration: true`, `contextIsolation: false`, `enableRemoteModule: true`

## Successor
This version has been archived and succeeded by **InstaShare Next (v2.0)** located at the repository root, built on **React 19, Electron 34+, TypeScript 5.7+, electron-vite, Tailwind CSS v4 + Material Design 3 tokens, Zustand 5, @nut-tree/nut-js, and Dual-Mode AI (Local Whisper + BYOK)**.
