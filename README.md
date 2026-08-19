<div align="center">

# ⚡ ZeroHop (v2.0)

### *The 100% Free & Open-Source, Zero-Cloud P2P Desktop Suite*
**Wire-Speed File Transfers • 60 FPS Remote Desktop • Encrypted Calls • P2P Terminal Pairing • 100% Offline Whisper AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue.svg?style=for-the-badge)](https://github.com/gaurav10610/zerohop-desktop)
[![Build Status](https://img.shields.io/badge/Tests-57%2F57%20Passing-emerald.svg?style=for-the-badge)](https://github.com/gaurav10610/zerohop-desktop)
[![Electron](https://img.shields.io/badge/Electron-34.x-61dafb.svg?style=for-the-badge)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg?style=for-the-badge)](https://react.dev/)

<br/>

### 🎥 Watch Live Product Demo (Interactive Wire-Speed File Transfer & Calling)

https://github.com/user-attachments/assets/demo.mp4

*(Click above or play [`docs/videos/demo.mp4`](docs/videos/demo.mp4) locally)*

<video src="docs/videos/demo.mp4" controls="controls" width="100%" poster="docs/screenshots/dashboard.png">
  Your browser does not support the video tag. Watch <a href="docs/videos/demo.mp4">docs/videos/demo.mp4</a> directly.
</video>

<br/>

[**Download Latest Release**](https://github.com/gaurav10610/zerohop-desktop/releases) • [**Feature Matrix**](#-comprehensive-feature--capabilities-matrix) • [**Features**](#-killer-features) • [**Quick Start**](#-quick-start--development)

</div>

---

## 🎯 Why ZeroHop?

Today's remote collaboration tools are fragmented, bloated with SaaS subscriptions, and siphon your private data to cloud servers. **ZeroHop** unifies everything you need into a single, ultra-lightweight, native desktop application that runs **100% peer-to-peer directly between your devices**:

- 🚫 **Zero Subscriptions & Zero Cloud Telemetry:** No servers storing your files, video calls, or keystrokes.
- ⚡ **Wire-Speed Line Rate:** Automatically routes transfers across local LAN/Wi-Fi sockets up to **10 Gbps**.
- 📱 **Zero-Install Web Guest Bridge:** Share files and screen streams with iOS/Android smartphones via an instant QR code—no app install required.
- 💻 **Hardware Remote Desktop (60 FPS):** Low-latency native input automation across macOS, Windows, and Linux.
- 🤖 **100% Local Offline AI Whisper:** Transcribe calls and generate meeting minutes on-device with 0 cloud calls and 0 API keys.

---

## 📸 Product Walkthrough & Screenshots

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/dashboard.png" alt="Local Peer Radar Dashboard" width="100%" />
      <br/>
      <b>📡 Local Peer Radar & Quick Connect</b>
      <p><i>Sub-millisecond UDP multicast discovery, 6-digit room PINs, and Web Gateway.</i></p>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/file-transfer.png" alt="Hyper-Stream File Transfer Hub" width="100%" />
      <br/>
      <b>⚡ Hyper-Stream File Hub & Live Folder Sync</b>
      <p><i>Zero-RAM backpressure streaming with BLAKE3 chunk block healing.</i></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/remote.png" alt="60 FPS Hardware Remote Desktop" width="100%" />
      <br/>
      <b>🖥️ 60 FPS Remote Desktop & Copilot</b>
      <p><i>Sub-pixel Retina/DPI scaling, native input engine, and Privacy Shield.</i></p>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/terminal.png" alt="P2P Collaborative Terminal Shell" width="100%" />
      <br/>
      <b>⌨️ P2P Interactive Shell & AI Debugger</b>
      <p><i>Collaborative terminal pairing over WebRTC with AI command diagnostics.</i></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/ai-hub.png" alt="Local Whisper AI Copilot Hub" width="100%" />
      <br/>
      <b>🤖 100% Local Offline Whisper & BYOK AI</b>
      <p><i>On-device speech transcription and multi-provider AI vault (Claude/Gemini/Ollama).</i></p>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/settings.png" alt="Settings & Encrypted Keyring Vault" width="100%" />
      <br/>
      <b>🔐 Local SafeStorage Vault & System Settings</b>
      <p><i>OS-level encrypted keyring (macOS Keychain / Windows DPAPI / Linux Secret Service).</i></p>
    </td>
  </tr>
</table>

---

## 📊 Comprehensive Feature & Capabilities Matrix

| Feature Module | Underlying Technology | Performance & Specifications | Security & Privacy Guarantee |
| :--- | :--- | :--- | :--- |
| **LAN Wire-Speed Discovery** | UDP Multicast (`239.255.255.250`) & mDNS | Sub-millisecond peer discovery; up to 10 Gbps LAN speeds | 100% Local Subnet; 0 Cloud Servers |
| **Zero-Install Web Guest Bridge** | Ephemeral Node.js HTTP/WS + High-Density QR | Direct browser & mobile phone upload/download portal | Zero App Install; Ephemeral Port Isolation |
| **Zero-RAM Hyper-Stream Files** | BLAKE3 Hash Chunks + WebRTC DataChannels | 64KB chunk backpressure streams; flat $<100\text{ MB}$ RAM | End-to-End Encrypted (DTLS/SCTP) |
| **Live P2P Folder Mirror** | Delta streaming via `chokidar` | Two-way directory watcher with automatic sync | Local Direct P2P; Never Stored in Cloud |
| **Pre-Flight Security Sanitizer** | Regex pattern secret detector | Scans `.env`, API keys (`sk-`, `ghp_`, `AKIA`), PEM certs | Blocks accidental credential leaks |
| **60 FPS Hardware Remote Desktop** | `@nut-tree/nut-js` N-API Input Engine | Sub-pixel Retina/4K DPI coordinate mapping | Privacy Shield sensitive window masking |
| **P2P Interactive Terminal (PTY)** | `node-pty` + `xterm.js` | Collaborative real-time shell pairing over WebRTC | DataChannel encrypted raw PTY stream |
| **1:1 Encrypted Audio/Video Calls**| WebRTC Opus (48kHz) + VP9 / AV1 Video | Hardware video acceleration + System Sound Loopback | DTLS-SRTP 256-bit End-to-End Encryption |
| **Live Screen Markup & Laser** | High-performance HTML5 Canvas overlay | Real-time transparent pen, shapes, and laser pointer | Synchronized locally via DataChannels |
| **100% Local Offline AI Whisper** | `@xenova/transformers` (Whisper ONNX WebGPU) | Real-time speech transcription & meeting minutes | 100% On-Device GPU/CPU; 0 Cloud API Keys |
| **Encrypted BYOK AI Keyring** | OS `safeStorage` (Keychain / DPAPI / SecretService)| BYOK vault for Gemini, Claude, OpenAI, Groq, Ollama | OS-level hardware-backed key encryption |
| **Centralized Theme Engine** | Material Design 3 (M3) CSS Custom Properties | Instant dark, light, and OS system appearance sync | 100% Zero-Runtime CSS tokens |
| **Footprint & Memory Efficiency**| Vite 6 tree-shaken React 19 + Electron 34 | $< 80\text{ MB}$ idle RAM; $< 65\text{ MB}$ packaged binary | Ultra-lightweight native performance |

---

## 🚀 Killer Features

### 1. ⚡ Zero-Config Hybrid Transport & Web Guest Bridge
- **Subnet Wire-Speed Line Rate:** Sub-millisecond mDNS & UDP Multicast (`239.255.255.250:53535`) discovery routes data over local LAN sockets (up to 10 Gbps).
- **Global WebRTC ICE:** Seamless hole-punching for peers across different networks and NATs.
- **Zero-Install Web Gateway:** Generate a local QR code; any smartphone (iOS / Android) or guest browser can download/upload files and view your screen without installing any app.

### 2. 🗂️ Zero-RAM Hyper-Stream File Transfer & Live Folder Sync
- **Stream Unlimited Sizes:** Transfer 100GB+ files or directory trees with flat $<100\text{ MB}$ RAM consumption using chunk backpressure streams.
- **BLAKE3 Hash Block Healing:** Instant sub-millisecond cryptographic chunk verification with automatic resume on reconnect.
- **Ad-Hoc Live Synced Folders:** Right-click any folder to establish a live two-way delta sync mirror powered by `chokidar`.
- **Pre-Flight Security Shield:** Scans and warns before transmitting `.env` files, leaked API tokens, and strips OS junk (`.DS_Store`, `node_modules`).

### 3. 🖥️ 60 FPS Remote Desktop Copilot & P2P Shell
- **Hardware-Accelerated Remote Desktop:** Ultra-low latency input injection via `@nut-tree/nut-js` N-API bindings across macOS, Windows, and Linux.
- **Sub-Pixel Retina & DPI Scaling:** Flawless coordinate transformation across mismatched display resolutions and aspect ratios.
- **Privacy Shield:** Automatically black out sensitive windows (e.g. password managers, banking tabs) from remote video feeds.
- **P2P Remote Terminal (`xterm.js` + `node-pty`):** Real-time collaborative shell pairing over encrypted WebRTC DataChannels with integrated AI Command Debugger.

### 4. 📞 Encrypted Audio/Video Calling & Screen Markup
- **Opus & VP9/AV1 Calling:** High-fidelity encrypted calling with system sound loopback.
- **Live Screen Markup & Laser Pointer:** Draw arrows, highlights, boxes, and use real-time laser pointers directly on top of active screen streams.

### 5. 🤖 Dual-Mode Privacy-First AI Copilot
- **100% Local Offline Whisper:** On-device speech-to-text powered by `@xenova/transformers` (Whisper ONNX via WebGPU/WASM in Web Workers). Generates Markdown meeting minutes and action items with 0 cloud calls and 0 API keys.
- **Bring-Your-Own-Key (BYOK):** Multi-provider AI workspace supporting Google Gemini 2.0, Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, Groq, and 100% offline Local Ollama.
- **SafeStorage Vault:** Keys are encrypted on your local machine using macOS Keychain / Windows DPAPI / Linux Secret Service.

---

## 🛠️ Technology Stack

```text
├── Desktop Shell: Electron 34+ (Context Isolation, Typed ContextBridge)
├── Bundler & Build Engine: electron-vite 3 + Vite 6
├── Frontend Framework: React 19 + TypeScript 5.7
├── Design System: Tailwind CSS v4 + Material Design 3 (M3) Reusable Tokens
├── State Engine: Zustand 5 + Immer (Pure Functional State Machines)
├── Networking: WebRTC 2.0 DataChannels + multicast-dns + Node.js HTTP/WS
├── Input & Terminal: @nut-tree-fork/nut-js + node-pty + xterm.js
├── Local Speech AI: @xenova/transformers (Whisper ONNX WebGPU)
├── Cryptography: @noble/hashes (BLAKE3 & SHA-256)
└── Test Engine: Vitest 4.x (57 Automated Tests across 16 Suites)
```

---

## 📦 Quick Start & Development

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### 1. Clone & Install
```bash
git clone https://github.com/gaurav10610/zerohop-desktop.git
cd zerohop-desktop
npm install --legacy-peer-deps
```

### 2. Run Local Development (Instant HMR)
```bash
npm run dev
```

### 3. Run Multi-Instance Test (Alice ⟷ Bob)
```bash
./scripts/launch-multi-instance.sh
```

### 4. Run Test Suite & Typecheck
```bash
npm run typecheck   # Strict TypeScript checks across Node & Web
npm test            # Runs full 57-test automated suite
```

### 5. Build Local Release Binaries (100% Offline)
```bash
npm run release          # Build for current OS (macOS DMG/Zip)
npm run release:mac      # macOS DMG (Apple Silicon & Intel)
npm run release:win      # Windows NSIS Installer (.exe)
npm run release:linux    # Linux AppImage & Debian package
npm run release:all      # Build all targets simultaneously
```

---

## 📄 License
Released under the **[MIT License](LICENSE)**. Free and open-source forever. Built with ❤️ by Gaurav Kumar Yadav.