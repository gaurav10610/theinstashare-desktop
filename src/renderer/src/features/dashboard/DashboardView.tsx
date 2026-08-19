import React, { useState, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { M3Button, M3Card, M3Badge, M3TextField, M3Dialog } from '../../components/ui/M3Components';
import {
  Radio,
  QrCode,
  ArrowRight,
  Shield,
  Smartphone,
  MessageSquare,
  HardDriveUpload,
  MonitorPlay,
  Terminal as TerminalIcon,
  Copy,
  Check
} from 'lucide-react';

export function DashboardView() {
  const { myId, myName, myAvatar, peers, setSelectedPeerId, setActiveTab, upsertPeer } = usePeerStore();
  const { isWebBridgeActive, setWebBridgeActive, webBridgeUrl, webBridgeQR } = useSettingsStore();

  const [roomCode, setRoomCode] = useState('');
  const [isWebBridgeModalOpen, setIsWebBridgeModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Auto-start LAN discovery on load
  useEffect(() => {
    window.api?.startDiscovery({
      id: myId,
      name: myName,
      avatar: myAvatar,
      ip: '127.0.0.1',
      port: 8484,
      os: window.api?.platform === 'darwin' ? 'mac' : (window.api?.platform === 'win32' ? 'windows' : 'linux'),
      version: '2.0.0',
      capabilities: ['file-stream', 'audio-video', 'remote-control', 'terminal', 'folder-sync'],
      lastSeen: Date.now()
    }).catch(console.error);

    const unsubscribe = window.api?.onPeerFound((peer) => {
      upsertPeer({
        id: peer.id,
        name: peer.name,
        avatar: peer.avatar,
        ip: peer.ip,
        os: peer.os as any,
        isLocal: true
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [myId, myName, myAvatar, upsertPeer]);

  const handleToggleWebBridge = async () => {
    if (isWebBridgeActive) {
      await window.api?.stopWebBridge();
      setWebBridgeActive(false);
    } else {
      const res = await window.api?.startWebBridge(myName);
      if (res) {
        setWebBridgeActive(true, res.url, res.qrCode);
        setIsWebBridgeModalOpen(true);
      }
    }
  };

  const handleQuickConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    const mockId = `peer_${roomCode.trim().toLowerCase()}`;
    upsertPeer({
      id: mockId,
      name: `Room-${roomCode.trim().toUpperCase()}`,
      avatar: '🌐',
      ip: 'WAN / WebRTC',
      os: 'unknown',
      isLocal: false
    });
    setSelectedPeerId(mockId);
    setActiveTab('talk');
  };

  const peerList = Object.values(peers);

  return (
    <div className="h-full w-full overflow-y-auto p-7 flex flex-col gap-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <M3Badge variant="primary">Next-Gen P2P Suite</M3Badge>
            <M3Badge variant="success">Zero-Cloud E2EE</M3Badge>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 tracking-tight">
            Welcome to ZeroHop
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Wire-speed file transfer, ultra-low-latency remote desktop, and encrypted calls directly between devices.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <M3Button
            variant="tonal"
            size="md"
            icon={<QrCode className="w-4 h-4" />}
            onClick={() => {
              if (!isWebBridgeActive) handleToggleWebBridge();
              else setIsWebBridgeModalOpen(true);
            }}
          >
            {isWebBridgeActive ? 'View Web QR' : 'Share with Phone/Browser'}
          </M3Button>
        </div>
      </div>

      {/* Main Grid: Radar & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Active Peer Radar */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Discovered Nearby Peers</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {peerList.length} {peerList.length === 1 ? 'device' : 'devices'} on LAN
            </span>
          </div>

          {peerList.length === 0 ? (
            <M3Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3 text-indigo-400 animate-pulse-slow">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Scanning Local Network</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5">
                Open ZeroHop on any other PC on your Wi-Fi network or use the Web Gateway to connect a mobile device.
              </p>
              <M3Button
                variant="outlined"
                size="sm"
                icon={<QrCode className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!isWebBridgeActive) handleToggleWebBridge();
                  else setIsWebBridgeModalOpen(true);
                }}
              >
                Launch Zero-Install Web QR
              </M3Button>
            </M3Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {peerList.map((peer) => (
                <M3Card
                  key={peer.id}
                  className="flex flex-col justify-between gap-4 p-4.5 hover:border-indigo-500/50 hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-xl border border-slate-700/80 shrink-0">
                        {peer.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-100 truncate max-w-[140px]">{peer.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400">{peer.ip}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">
                            {peer.os}
                          </span>
                        </div>
                      </div>
                    </div>

                    <M3Badge variant={peer.isLocal ? 'success' : 'primary'}>
                      {peer.isLocal ? 'LAN Wire' : 'WAN P2P'}
                    </M3Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedPeerId(peer.id);
                        setActiveTab('talk');
                      }}
                      title="1:1 Encrypted Talk"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Talk</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPeerId(peer.id);
                        setActiveTab('files');
                      }}
                      title="Send Files"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <HardDriveUpload className="w-3.5 h-3.5" />
                      <span>Files</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPeerId(peer.id);
                        setActiveTab('remote');
                      }}
                      title="Remote Control"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      <span>Remote</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPeerId(peer.id);
                        setActiveTab('terminal');
                      }}
                      title="P2P Terminal Pairing"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <TerminalIcon className="w-3.5 h-3.5" />
                      <span>Shell</span>
                    </button>
                  </div>
                </M3Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Connect & Room Codes */}
        <div className="flex flex-col gap-4">
          <M3Card className="flex flex-col gap-3.5">
            <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Connect via Room PIN</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pair with any peer outside your local network using a 6-digit disposable code.
            </p>

            <form onSubmit={handleQuickConnect} className="flex flex-col gap-3">
              <M3TextField
                placeholder="e.g. 7X9K2A"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-center font-mono uppercase tracking-widest font-bold"
              />
              <M3Button
                type="submit"
                variant="filled"
                size="md"
                disabled={!roomCode.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Join Room
              </M3Button>
            </form>
          </M3Card>

          {/* Web Bridge Card */}
          <M3Card className="flex flex-col gap-3 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Zero-Install Web Bridge</h4>
              </div>
              <M3Badge variant={isWebBridgeActive ? 'success' : 'secondary'}>
                {isWebBridgeActive ? 'Online' : 'Standby'}
              </M3Badge>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly share files with any smartphone (iOS / Android) or guest browser with zero app installation.
            </p>
            <M3Button
              variant="tonal"
              size="sm"
              icon={<QrCode className="w-3.5 h-3.5" />}
              onClick={handleToggleWebBridge}
            >
              {isWebBridgeActive ? 'Stop Web Gateway' : 'Start Web Gateway'}
            </M3Button>
          </M3Card>
        </div>
      </div>

      {/* Web Bridge QR Dialog */}
      <M3Dialog
        isOpen={isWebBridgeModalOpen}
        onClose={() => setIsWebBridgeModalOpen(false)}
        title="Zero-Install Web Gateway"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {webBridgeQR && (
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              <img src={webBridgeQR} alt="Web Bridge QR Code" className="w-48 h-48" />
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed">
            Scan this QR code with any smartphone camera on the same Wi-Fi to immediately download/upload files without installing software.
          </p>

          {webBridgeUrl && (
            <div className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-mono text-indigo-300 truncate">{webBridgeUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webBridgeUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </M3Dialog>
    </div>
  );
}
