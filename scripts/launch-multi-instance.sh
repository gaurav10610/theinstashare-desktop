#!/bin/bash
# Multi-Instance Launcher for ZeroHop
# Spawns two distinct peer instances for testing

echo "🚀 Building latest ZeroHop assets..."
npm run build

echo "⚡ Spawning Instance 1: Alice (MacBook)..."
npx electron . --user-data-dir=/tmp/zerohop-alice --peer-name="Alice (MacBook)" --peer-avatar="🦊" &
PID1=$!

sleep 1

echo "⚡ Spawning Instance 2: Bob (Workstation)..."
npx electron . --user-data-dir=/tmp/zerohop-bob --peer-name="Bob (Workstation)" --peer-avatar="🦅" &
PID2=$!

echo "✅ Both instances spawned successfully (PID: $PID1, $PID2)."
echo "Press Ctrl+C to terminate both instances."

wait $PID1 $PID2
