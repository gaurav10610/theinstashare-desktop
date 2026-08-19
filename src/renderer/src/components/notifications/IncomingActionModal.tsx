import React from 'react';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useCallStore } from '../../stores/useCallStore';
import { usePeerStore } from '../../stores/usePeerStore';
import { useFileStore } from '../../stores/useFileStore';
import { useRemoteStore } from '../../stores/useRemoteStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { ConnectionManager } from '../../core/transport/ConnectionManager';
import { M3Button, M3Card, M3Badge, M3Dialog } from '../ui/M3Components';
import {
  Phone,
  PhoneOff,
  Video,
  Mic,
  HardDriveDownload,
  Monitor,
  Terminal as TerminalIcon,
  Check,
  X
} from 'lucide-react';

export function IncomingActionModal() {
  const {
    incomingCall,
    setIncomingCall,
    incomingTransfer,
    setIncomingTransfer,
    incomingRemoteRequest,
    setIncomingRemoteRequest,
    incomingTerminalRequest,
    setIncomingTerminalRequest
  } = useNotificationStore();

  const { startCall, endCall } = useCallStore();
  const { setActiveTab, setSelectedPeerId } = usePeerStore();
  const { updateTransfer } = useFileStore();
  const { startRemoteSession } = useRemoteStore();
  const { startSession, appendHistory } = useTerminalStore();

  // 1. Incoming Call Handlers
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const { peerId, peerName, mode } = incomingCall;
    setSelectedPeerId(peerId);
    setActiveTab('talk');
    startCall(peerId, peerName, mode);

    await window.api?.sendSignal(peerId, {
      type: 'call-accepted',
      mode,
      sourceName: usePeerStore.getState().myName
    });

    setIncomingCall(null);
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    await window.api?.sendSignal(incomingCall.peerId, {
      type: 'call-declined',
      sourceName: usePeerStore.getState().myName
    });
    setIncomingCall(null);
  };

  // 2. Incoming File Transfer Handlers
  const handleAcceptTransfer = async () => {
    if (!incomingTransfer) return;
    const { id, peerId, peerName } = incomingTransfer;
    setSelectedPeerId(peerId);
    setActiveTab('files');

    // Mark as downloading & complete
    updateTransfer(id, { progress: 100, status: 'completed', speed: 0 });

    await window.api?.sendSignal(peerId, {
      type: 'file-accepted',
      transferId: id,
      sourceName: usePeerStore.getState().myName
    });

    setIncomingTransfer(null);
  };

  const handleDeclineTransfer = async () => {
    if (!incomingTransfer) return;
    setIncomingTransfer(null);
  };

  // 3. Incoming Remote Desktop Handlers
  const handleAcceptRemote = async (controlMode: 'full-control' | 'view-only') => {
    if (!incomingRemoteRequest) return;
    const { peerId, peerName } = incomingRemoteRequest;
    setSelectedPeerId(peerId);
    setActiveTab('remote');
    startRemoteSession(peerId, peerName, controlMode);

    await window.api?.sendSignal(peerId, {
      type: 'remote-accepted',
      controlMode,
      sourceName: usePeerStore.getState().myName
    });

    setIncomingRemoteRequest(null);
  };

  const handleDeclineRemote = async () => {
    if (!incomingRemoteRequest) return;
    await window.api?.sendSignal(incomingRemoteRequest.peerId, {
      type: 'remote-declined',
      sourceName: usePeerStore.getState().myName
    });
    setIncomingRemoteRequest(null);
  };

  // 4. Incoming Terminal Pairing Handlers
  const handleAcceptTerminal = async () => {
    if (!incomingTerminalRequest) return;
    const { peerId, peerName } = incomingTerminalRequest;
    setSelectedPeerId(peerId);
    setActiveTab('terminal');
    startSession(peerId, peerName, false);

    await window.api?.spawnTerminal(80, 24);
    window.api?.onTerminalData((data) => {
      appendHistory(data);
    });

    await window.api?.sendSignal(peerId, {
      type: 'terminal-accepted',
      sourceName: usePeerStore.getState().myName
    });

    setIncomingTerminalRequest(null);
  };

  const handleDeclineTerminal = () => {
    setIncomingTerminalRequest(null);
  };

  return (
    <>
      {/* 1. Incoming Call Dialog */}
      <M3Dialog
        isOpen={incomingCall !== null}
        onClose={handleDeclineCall}
        title="Incoming Encrypted Call"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 text-4xl flex items-center justify-center border border-indigo-500/40 shadow-2xl animate-pulse">
              {incomingCall?.peerAvatar || '📞'}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-lg">
              {incomingCall?.mode === 'video' ? <Video className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100">{incomingCall?.peerName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Incoming {incomingCall?.mode === 'video' ? '1:1 Video Call' : '1:1 Voice Call'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full justify-center pt-2">
            <M3Button
              variant="danger"
              size="md"
              icon={<PhoneOff className="w-4 h-4" />}
              onClick={handleDeclineCall}
            >
              Decline
            </M3Button>
            <M3Button
              variant="filled"
              size="md"
              icon={<Phone className="w-4 h-4" />}
              onClick={handleAcceptCall}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Accept Call
            </M3Button>
          </div>
        </div>
      </M3Dialog>

      {/* 2. Incoming File Transfer Dialog */}
      <M3Dialog
        isOpen={incomingTransfer !== null}
        onClose={handleDeclineTransfer}
        title="Incoming Wire-Speed File Stream"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center gap-4 py-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl">
            <HardDriveDownload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100">
              {incomingTransfer?.peerName} is sending {incomingTransfer?.files.length} file(s)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {incomingTransfer?.files.map((f) => f.name).join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full justify-center pt-2">
            <M3Button variant="tonal" size="sm" onClick={handleDeclineTransfer}>
              Decline
            </M3Button>
            <M3Button
              variant="filled"
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={handleAcceptTransfer}
            >
              Receive & Save
            </M3Button>
          </div>
        </div>
      </M3Dialog>

      {/* 3. Incoming Remote Desktop Dialog */}
      <M3Dialog
        isOpen={incomingRemoteRequest !== null}
        onClose={handleDeclineRemote}
        title="Remote Desktop Access Request"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center gap-4 py-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl">
            <Monitor className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100">{incomingRemoteRequest?.peerName}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Requested remote control access to your machine (60 FPS N-API Hardware Stream).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center pt-2">
            <M3Button variant="tonal" size="sm" onClick={handleDeclineRemote}>
              Reject
            </M3Button>
            <M3Button variant="outlined" size="sm" onClick={() => handleAcceptRemote('view-only')}>
              View Only
            </M3Button>
            <M3Button variant="filled" size="sm" onClick={() => handleAcceptRemote('full-control')}>
              Grant Full Control
            </M3Button>
          </div>
        </div>
      </M3Dialog>

      {/* 4. Incoming Terminal Pairing Dialog */}
      <M3Dialog
        isOpen={incomingTerminalRequest !== null}
        onClose={handleDeclineTerminal}
        title="P2P Terminal Pairing Session"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center gap-4 py-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl">
            <TerminalIcon className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100">{incomingTerminalRequest?.peerName}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Invited you to a collaborative encrypted PTY shell session.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full justify-center pt-2">
            <M3Button variant="tonal" size="sm" onClick={handleDeclineTerminal}>
              Dismiss
            </M3Button>
            <M3Button variant="filled" size="sm" onClick={handleAcceptTerminal}>
              Join Terminal
            </M3Button>
          </div>
        </div>
      </M3Dialog>
    </>
  );
}
