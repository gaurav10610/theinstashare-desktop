import React, { useState, useRef, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useCallStore } from '../../stores/useCallStore';
import { ConnectionManager } from '../../core/transport/ConnectionManager';
import { Button, IconButton, Badge, Input } from '../../components/ui';
import { ScreenAnnotationOverlay } from './ScreenAnnotationOverlay';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Volume2,
  VolumeX,
  PhoneOff,
  PenTool,
  Send,
  CheckCheck
} from 'lucide-react';

export function TalkView() {
  const { selectedPeerId, peers, myId, myName, messages, addMessage } = usePeerStore();
  const {
    isActive: isCallActive,
    peerId: callPeerId,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    isSystemSoundEnabled,
    isAnnotationEnabled,
    durationSeconds,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleSystemSound,
    toggleAnnotation,
    incrementDuration
  } = useCallStore();

  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePeer = selectedPeerId ? peers[selectedPeerId] : (callPeerId ? peers[callPeerId] : Object.values(peers)[0]);
  const currentPeerId = activePeer?.id || 'demo_peer';
  const peerMessages = messages[currentPeerId] || [];

  // Duration timer
  useEffect(() => {
    let timer: any;
    if (isCallActive) {
      timer = setInterval(() => incrementDuration(), 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive, incrementDuration]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [peerMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    addMessage(currentPeerId, {
      id: `msg_${Date.now()}`,
      senderId: myId,
      senderName: myName,
      text,
      timestamp: Date.now(),
      status: 'delivered'
    });

    // Send through active P2P DataChannel and multicast signaling
    ConnectionManager.getInstance().sendChatMessage(currentPeerId, text);
    window.api?.sendSignal(currentPeerId, {
      type: 'chat',
      text,
      senderName: myName
    }).catch(() => {});

    setChatInput('');
  };

  const handleStartCall = async (mode: 'audio' | 'video' | 'screen') => {
    if (!activePeer) return;
    startCall(activePeer.id, activePeer.name, mode);

    window.api?.sendSignal(activePeer.id, {
      type: 'call-start',
      callType: mode,
      sourceName: myName,
      sourceAvatar: usePeerStore.getState().myAvatar
    }).catch(() => {});

    try {
      const transport = await ConnectionManager.getInstance().connectToPeer(activePeer.id);
      transport.send('control', { type: 'call-start', callType: mode });
    } catch (err) {
      console.warn('Call setup error:', err);
    }
  };

  const handleEndCall = () => {
    if (activePeer) {
      const transport = ConnectionManager.getInstance().getTransport(activePeer.id);
      transport?.send('control', { type: 'call-end' });
      window.api?.sendSignal(activePeer.id, { type: 'call-end' }).catch(() => {});
    }
    endCall();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full flex overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Left: Video / Media Call Arena */}
      <div className="flex-1 flex flex-col justify-between p-6 border-r border-slate-200/80 dark:border-slate-800/80 relative bg-slate-100/40 dark:bg-slate-950/40">
        {/* Top Call Status Bar */}
        <div className="flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg border border-slate-200 dark:border-slate-700/80 shrink-0">
              {activePeer?.avatar || '👤'}
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{activePeer?.name || 'Select a Peer'}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isCallActive ? `Live Call (${formatTime(durationSeconds)})` : 'Direct P2P Ready'}
                </span>
              </div>
            </div>
          </div>

          {isCallActive && (
            <div className="flex items-center gap-2">
              <Badge variant="success">E2EE Opus/VP9</Badge>
              {isSystemSoundEnabled && <Badge variant="secondary">System Audio Loopback</Badge>}
            </div>
          )}
        </div>

        {/* Center: Video Surface / Placeholder */}
        <div className="relative flex-1 my-5 rounded-3xl overflow-hidden glass-panel border border-slate-200/90 dark:border-slate-800/90 flex items-center justify-center">
          {isCallActive ? (
            <div className="w-full h-full relative flex items-center justify-center bg-black/95">
              {/* Remote Video Stream Visualizer */}
              <div className="flex flex-col items-center gap-3 text-center z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-3xl shadow-2xl animate-pulse-slow">
                  {activePeer?.avatar || '📹'}
                </div>
                <h2 className="text-base font-bold text-white">
                  {activePeer?.name || 'Remote Peer'}
                </h2>
                <p className="text-xs text-slate-300 max-w-xs">
                  {isScreenSharing ? 'Sharing 60 FPS Desktop Screen' : 'High Definition Encrypted Video Feed'}
                </p>
              </div>

              {/* Local Pip Video */}
              <div className="absolute bottom-5 right-5 w-44 h-28 rounded-2xl overflow-hidden glass-panel-elevated border border-slate-700/80 shadow-2xl flex items-center justify-center z-20">
                <span className="text-[11px] font-semibold text-slate-300">Local Camera ({myName})</span>
              </div>

              {/* Screen Annotation Layer */}
              <ScreenAnnotationOverlay />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3.5 text-center max-w-sm p-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-2xl mb-1">
                💬
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Start a Peer Communication Session</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect directly for ultra-low-latency voice, video, screen share, or mark up live screens collaboratively.
              </p>
              <div className="flex items-center gap-2.5 mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Video className="w-3.5 h-3.5" />}
                  onClick={() => handleStartCall('video')}
                >
                  Video Call
                </Button>
                <Button
                  variant="tonal"
                  size="sm"
                  icon={<Mic className="w-3.5 h-3.5" />}
                  onClick={() => handleStartCall('audio')}
                >
                  Voice Call
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  icon={<ScreenShare className="w-3.5 h-3.5" />}
                  onClick={() => handleStartCall('screen')}
                >
                  Share Screen
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls Bar */}
        {isCallActive && (
          <div className="flex items-center justify-center gap-3 z-20 shrink-0">
            <IconButton
              size="lg"
              variant={isAudioMuted ? 'tonal' : 'filled'}
              onClick={toggleAudio}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              icon={isAudioMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
            />

            <IconButton
              size="lg"
              variant={isVideoMuted ? 'tonal' : 'filled'}
              onClick={toggleVideo}
              title={isVideoMuted ? 'Start Camera' : 'Stop Camera'}
              icon={isVideoMuted ? <VideoOff className="w-5 h-5 text-rose-400" /> : <Video className="w-5 h-5" />}
            />

            <IconButton
              size="lg"
              variant="tonal"
              onClick={toggleScreenShare}
              title="Toggle Screen Share"
              icon={<ScreenShare className="w-5 h-5" />}
            />

            <IconButton
              size="lg"
              variant="tonal"
              onClick={toggleSystemSound}
              title="Share System Audio Loopback"
              icon={isSystemSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            />

            <IconButton
              size="lg"
              variant="tonal"
              onClick={toggleAnnotation}
              title="Live Screen Annotation Markup"
              icon={<PenTool className="w-5 h-5 text-indigo-400" />}
            />

            <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-2" />

            <IconButton
              size="lg"
              variant="filled"
              className="bg-rose-600 hover:bg-rose-500 text-white"
              onClick={handleEndCall}
              title="End Call"
              icon={<PhoneOff className="w-5 h-5" />}
            />
          </div>
        )}
      </div>

      {/* Right: Integrated E2EE Text Chat */}
      <div className="w-96 flex flex-col justify-between p-5 bg-white/70 dark:bg-slate-950/80 border-l border-slate-200/80 dark:border-slate-800/80 select-text shrink-0">
        <div className="pb-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Encrypted Chat</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">WebRTC DataChannel</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2.5 pr-1">
          {peerMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-500 text-xs gap-1">
              <span>No messages yet.</span>
              <span className="text-[11px]">Say hello to begin end-to-end encrypted chat!</span>
            </div>
          ) : (
            peerMessages.map((msg) => {
              const isMe = msg.senderId === myId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
                >
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 px-1">{msg.senderName}</span>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 shrink-0">
          <Input
            placeholder="Type encrypted message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="text-xs"
          />
          <IconButton type="submit" variant="filled" size="md" disabled={!chatInput.trim()} icon={<Send className="w-4 h-4" />} />
        </form>
      </div>
    </div>
  );
}
