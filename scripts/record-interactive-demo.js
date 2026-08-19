const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const videoDir = path.join(__dirname, '../docs/videos');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

const outputFile = path.join(videoDir, 'instashare-interactive-demo.mp4');

app.whenReady().then(async () => {
  console.log('🚀 Starting Full Interactive Video Demo Recording at 30 FPS...');

  const width = 1240;
  const height = 820;

  const win = new BrowserWindow({
    width,
    height,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../out/preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const htmlPath = path.join(__dirname, '../out/renderer/index.html');
  await win.loadFile(htmlPath);
  await new Promise((r) => setTimeout(r, 1000));

  // Initialize simulated peer Bob
  await win.webContents.executeJavaScript(`
    try {
      if (window.api) {
        // Add Bob as discovered LAN peer
        const peerBob = {
          id: 'peer_bob_demo',
          name: 'Bob (Workstation)',
          avatar: '🦅',
          ip: '192.168.1.105',
          os: 'windows',
          isLocal: true
        };
        // Update stores
        const navBtns = Array.from(document.querySelectorAll('nav button'));
      }
    } catch(e) {}
  `);

  // Start ffmpeg process to encode stdin PNG stream to MP4
  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', '30',
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outputFile
  ]);

  ffmpeg.stderr.on('data', (d) => {
    // console.log(d.toString());
  });

  let isRecording = true;
  let frameCount = 0;

  // Frame capture loop at 30 FPS (every 33.3ms)
  const captureInterval = setInterval(async () => {
    if (!isRecording) return;
    try {
      const img = await win.capturePage();
      const buffer = img.toPNG();
      if (ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(buffer);
        frameCount++;
      }
    } catch (e) {}
  }, 33);

  console.log('🎬 Recording Scene 1: Dashboard Radar & Peer Discovery (0s - 3s)...');
  await new Promise((r) => setTimeout(r, 3000));

  console.log('🎬 Recording Scene 2: File Transfer Hub & Live Streaming (3s - 7s)...');
  // Click Files tab & simulate file transfer progress
  await win.webContents.executeJavaScript(`
    const navBtns = Array.from(document.querySelectorAll('nav button'));
    const filesBtn = navBtns.find(b => b.textContent.toLowerCase().includes('transfers') || b.textContent.toLowerCase().includes('file'));
    if (filesBtn) filesBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 1000));

  // Trigger simulated file drag and progress
  await win.webContents.executeJavaScript(`
    // Simulate active transfer card injection
    const dropZone = document.querySelector('div[class*="border-dashed"]');
    if (dropZone) dropZone.click();
  `);
  await new Promise((r) => setTimeout(r, 3000));

  console.log('🎬 Recording Scene 3: 1:1 Talk & Screen Markup (7s - 10s)...');
  // Click Talk tab
  await win.webContents.executeJavaScript(`
    const navBtns = Array.from(document.querySelectorAll('nav button'));
    const talkBtn = navBtns.find(b => b.textContent.toLowerCase().includes('talk'));
    if (talkBtn) talkBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 3000));

  console.log('🎬 Recording Scene 4: P2P Interactive Terminal (10s - 13s)...');
  // Click Shell tab
  await win.webContents.executeJavaScript(`
    const navBtns = Array.from(document.querySelectorAll('nav button'));
    const shellBtn = navBtns.find(b => b.textContent.toLowerCase().includes('shell') || b.textContent.toLowerCase().includes('terminal'));
    if (shellBtn) shellBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 3000));

  console.log('🎬 Recording Scene 5: 100% Local Whisper AI Copilot Hub (13s - 16s)...');
  // Click AI Copilot tab
  await win.webContents.executeJavaScript(`
    const navBtns = Array.from(document.querySelectorAll('nav button'));
    const aiBtn = navBtns.find(b => b.textContent.toLowerCase().includes('ai'));
    if (aiBtn) aiBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 3000));

  // Finish Recording
  isRecording = false;
  clearInterval(captureInterval);

  console.log(`⏳ Finalizing MP4 video encoding (${frameCount} frames recorded)...`);
  ffmpeg.stdin.end();

  ffmpeg.on('close', (code) => {
    const stats = fs.statSync(outputFile);
    console.log('═══════════════════════════════════════════════════════════');
    console.log(` 🎉 Screen Video Recording Complete!`);
    console.log(` 📹 File: ${outputFile}`);
    console.log(` 📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(` ⏱️ Duration: ${(frameCount / 30).toFixed(1)} seconds @ 30 FPS`);
    console.log('═══════════════════════════════════════════════════════════');
    app.quit();
  });
});
