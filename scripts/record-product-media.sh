#!/bin/bash
# Real Product Screenshot & Video Recorder
# Runs the actual Electron application and captures real screenshots and demo video

echo "🚀 Building and launching InstaShare Next for media capture..."
npm run build

# Start Electron app in background
npx electron . --user-data-dir=/tmp/instashare-media --peer-name="Gaurav (MacBook M3)" --peer-avatar="🚀" &
APP_PID=$!

sleep 3

# Focus Electron window via AppleScript
osascript -e 'tell application "System Events" to set frontmost of first process whose unix id is '"$APP_PID"' to true' 2>/dev/null || true
sleep 1

# Capture real screenshot of main screen
echo "📸 Capturing real screenshot of InstaShare Next..."
screencapture -x docs/screenshots/dashboard.png

# Capture 5-second real video recording of the app
echo "🎥 Recording real video demo..."
screencapture -v -V 5 docs/videos/instashare-demo.mp4

# Convert video to optimized preview GIF for GitHub README
echo "🎞️ Generating optimized animated GIF for README..."
ffmpeg -y -i docs/videos/instashare-demo.mp4 -vf "fps=10,scale=1000:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" docs/screenshots/demo.gif 2>/dev/null || true

# Terminate test app
kill $APP_PID 2>/dev/null || true

echo "✅ Real media capture complete:"
echo "   - Screenshot: docs/screenshots/dashboard.png"
echo "   - Video: docs/videos/instashare-demo.mp4"
echo "   - Animated GIF: docs/screenshots/demo.gif"
