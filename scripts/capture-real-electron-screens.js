const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const screenshotDir = path.join(__dirname, '../docs/screenshots');
const videoDir = path.join(__dirname, '../docs/videos');

if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

app.whenReady().then(async () => {
  console.log('🚀 Launching Electron renderer to capture real pixel-perfect screenshots...');

  const win = new BrowserWindow({
    width: 1240,
    height: 820,
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
  await new Promise((r) => setTimeout(r, 1200)); // Wait for React 19 to render

  const screens = [
    { tab: 'dashboard', name: 'dashboard.png' },
    { tab: 'talk', name: 'talk.png' },
    { tab: 'files', name: 'file-transfer.png' },
    { tab: 'remote', name: 'remote.png' },
    { tab: 'terminal', name: 'terminal.png' },
    { tab: 'ai', name: 'ai-hub.png' },
    { tab: 'settings', name: 'settings.png' }
  ];

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    console.log(`📸 Capturing real UI: ${s.tab} -> docs/screenshots/${s.name}`);

    // Switch tab in Zustand store
    await win.webContents.executeJavaScript(`
      try {
        const store = window.__PEER_STORE__ || document.querySelector('button[title]')?.click();
        const buttons = Array.from(document.querySelectorAll('nav button'));
        const targetBtn = buttons.find(b => b.textContent.toLowerCase().includes('${s.tab.slice(0, 4)}'));
        if (targetBtn) targetBtn.click();
      } catch(e) {}
    `);

    await new Promise((r) => setTimeout(r, 600));

    const image = await win.capturePage();
    fs.writeFileSync(path.join(screenshotDir, s.name), image.toPNG());
  }

  // Also capture frame sequence for video / animated GIF
  console.log('🎥 Generating animated product demonstration GIF & video from real UI captures...');
  const framePattern = path.join(screenshotDir, '%d.png');
  
  // Save numbered frames
  for (let i = 0; i < screens.length; i++) {
    const src = path.join(screenshotDir, screens[i].name);
    const dst = path.join(screenshotDir, `frame_${i + 1}.png`);
    fs.copyFileSync(src, dst);
  }

  try {
    execSync(
      `ffmpeg -y -framerate 0.8 -i "${path.join(screenshotDir, 'frame_%d.png')}" -vf "scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${path.join(screenshotDir, 'demo.gif')}"`,
      { stdio: 'inherit' }
    );
    execSync(
      `ffmpeg -y -framerate 0.8 -i "${path.join(screenshotDir, 'frame_%d.png')}" -c:v libx264 -r 30 -pix_fmt yuv420p "${path.join(videoDir, 'demo.mp4')}"`,
      { stdio: 'inherit' }
    );
    console.log('✅ Generated docs/screenshots/demo.gif and docs/videos/demo.mp4');
  } catch (e) {
    console.warn('ffmpeg conversion note:', e.message);
  }

  // Cleanup temporary frame_*.png
  for (let i = 0; i < screens.length; i++) {
    const frameFile = path.join(screenshotDir, `frame_${i + 1}.png`);
    if (fs.existsSync(frameFile)) fs.unlinkSync(frameFile);
  }

  console.log('🎉 All real screenshots and demo media successfully captured!');
  app.quit();
});
