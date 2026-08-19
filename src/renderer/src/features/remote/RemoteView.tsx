import React, { useRef } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useRemoteStore } from '../../stores/useRemoteStore';
import { ConnectionManager } from '../../core/transport/ConnectionManager';
import { Button, IconButton, Badge, cn } from '../../components/ui';
import {
  Monitor,
  Shield,
  Clipboard
} from 'lucide-react';

export function RemoteView() {
  const { selectedPeerId, peers } = usePeerStore();
  const {
    isActive,
    peerName,
    controlMode,
    isPrivacyMaskEnabled,
    isClipboardSyncEnabled,
    startRemoteSession,
    endRemoteSession,
    setControlMode,
    togglePrivacyMask,
    toggleClipboardSync
  } = useRemoteStore();

  const activePeer = selectedPeerId ? peers[selectedPeerId] : Object.values(peers)[0];
  const viewportRef = useRef<HTMLDivElement>(null);

  const sendRemoteEvent = (event: any) => {
    if (!activePeer) return;
    const transport = ConnectionManager.getInstance().getTransport(activePeer.id);
    if (transport) {
      transport.send('remote', event);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || controlMode !== 'full-control') return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    const event = {
      type: 'mouse-move',
      x: normalizedX,
      y: normalizedY,
      normalized: true
    };
    sendRemoteEvent(event);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || controlMode !== 'full-control') return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    const event = {
      type: 'mouse-click',
      x: normalizedX,
      y: normalizedY,
      button: e.button === 2 ? 'right' : (e.button === 1 ? 'middle' : 'left'),
      normalized: true
    };
    sendRemoteEvent(event);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isActive || controlMode !== 'full-control') return;
    sendRemoteEvent({
      type: 'scroll',
      deltaY: e.deltaY
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isActive || controlMode !== 'full-control') return;
    sendRemoteEvent({
      type: 'key-tap',
      text: e.key
    });
  };

  const handleStartSession = async () => {
    if (!activePeer) return;
    startRemoteSession(activePeer.id, activePeer.name);

    window.api?.sendSignal(activePeer.id, {
      type: 'remote-request',
      sourceName: usePeerStore.getState().myName,
      sourceAvatar: usePeerStore.getState().myAvatar
    }).catch(() => {});

    await ConnectionManager.getInstance().connectToPeer(activePeer.id);
  };

  return (
    <div className="h-full w-full flex flex-col p-6 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Top Remote Desktop Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/80 shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {isActive ? `Connected: ${peerName}` : 'Remote Machine Control'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={cn('w-2 h-2 rounded-full', isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600')} />
              <span>{isActive ? '60 FPS Hardware Stream Active' : 'Ready to Connect'}</span>
            </div>
          </div>
        </div>

        {isActive ? (
          <div className="flex items-center gap-2">
            <Badge variant={controlMode === 'full-control' ? 'primary' : 'secondary'}>
              {controlMode === 'full-control' ? 'Full Control' : 'View Only'}
            </Badge>

            <IconButton
              size="sm"
              variant="tonal"
              onClick={togglePrivacyMask}
              title="Toggle Privacy Shield (Mask sensitive apps)"
              icon={<Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
            />

            <IconButton
              size="sm"
              variant="tonal"
              onClick={toggleClipboardSync}
              title="Toggle Clipboard Sync"
              icon={<Clipboard className="w-4 h-4" />}
            />

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            <Button
              size="sm"
              variant="tonal"
              onClick={() => setControlMode(controlMode === 'full-control' ? 'view-only' : 'full-control')}
            >
              {controlMode === 'full-control' ? 'Switch to View Only' : 'Take Control'}
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={endRemoteSession}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            disabled={!activePeer}
            icon={<Monitor className="w-4 h-4" />}
            onClick={handleStartSession}
          >
            Connect to {activePeer?.name || 'Peer'}
          </Button>
        )}
      </div>

      {/* Main Remote Viewport */}
      <div className="flex-1 my-4 rounded-3xl overflow-hidden glass-panel border border-slate-200/90 dark:border-slate-800/90 relative flex items-center justify-center bg-black/95">
        {isActive ? (
          <div
            ref={viewportRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onWheel={handleWheel}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="w-full h-full relative cursor-default outline-none flex items-center justify-center select-none"
          >
            {/* Remote Screen Viewport Frame */}
            <div className="w-[94%] h-[90%] rounded-2xl border border-slate-700/60 bg-slate-950 flex flex-col items-center justify-center text-center p-8 shadow-2xl relative text-white">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl mb-3 animate-pulse">
                💻
              </div>
              <h3 className="text-sm font-bold text-slate-100">{peerName}'s Desktop</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Sub-pixel coordinate transformation active across Retina / 4K displays with @nut-tree/nut-js N-API input engine.
              </p>

              {isPrivacyMaskEnabled && (
                <div className="mt-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Shield: Sensitive Windows Auto-Masked</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5 text-center max-w-sm p-6 text-slate-900 dark:text-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-2xl">
              🖱️
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cross-Platform Remote Copilot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Control remote machines at 60 FPS with hardware video acceleration, smooth mouse/keyboard injection, and clipboard sync.
            </p>
            <Button
              variant="primary"
              size="sm"
              disabled={!activePeer}
              onClick={handleStartSession}
            >
              Request Remote Access
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
