import React, { useState, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { ConnectionManager } from '../../core/transport/ConnectionManager';
import { Button, Card, Badge, Input, Dialog } from '../../components/ui';
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

  useEffect(() => {
    ConnectionManager.getInstance().init().catch(console.error);
  }, []);

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

  const handleQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    ConnectionManager.getInstance().joinRoomByCode(roomCode.trim());
    const mockId = `peer_${roomCode.trim().toLowerCase()}`;
    upsertPeer({
      id: mockId,
      name: `Room-${roomCode.trim().toUpperCase()}`,
      avatar: '🌐',
      ip: 'LAN / Multicast',
      os: 'unknown',
      isLocal: true,
      connectionState: 'connecting'
    });
    setSelectedPeerId(mockId);
    setActiveTab('talk');
  };

  const handleConnectToPeer = async (peerId: string, targetTab: 'talk' | 'files' | 'remote' | 'terminal') => {
    setSelectedPeerId(peerId);
    setActiveTab(targetTab);
    try {
      await ConnectionManager.getInstance().connectToPeer(peerId);
    } catch (err) {
      console.warn('Direct peer connection error:', err);
    }
  };

  const peerList = Object.values(peers);

  return (
    <div className="h-full w-full overflow-y-auto p-7 flex flex-col gap-6 text-slate-900 dark:text-slate-100">
      {/* Hero Welcome & Quick Status Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 glass-panel border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Next-Gen P2P Suite</Badge>
            <Badge variant="success">Zero-Cloud E2EE</Badge>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Welcome to ZeroHop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Wire-speed file transfer, ultra-low-latency remote desktop, and encrypted calls directly between devices.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Button
            variant="tonal"
            size="md"
            icon={<QrCode className="w-4 h-4" />}
            onClick={() => {
              if (!isWebBridgeActive) handleToggleWebBridge();
              else setIsWebBridgeModalOpen(true);
            }}
          >
            {isWebBridgeActive ? 'View Web QR' : 'Share with Phone/Browser'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Radar & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Active Peer Radar */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
              <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Discovered Nearby Peers</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {peerList.length} {peerList.length === 1 ? 'device' : 'devices'} on LAN
            </span>
          </div>

          {peerList.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-slate-300 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3 text-indigo-500 dark:text-indigo-400 animate-pulse-slow">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Scanning Local Network</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
                Open ZeroHop on any other PC on your Wi-Fi network or use the Web Gateway to connect a mobile device.
              </p>
              <Button
                variant="outlined"
                size="sm"
                icon={<QrCode className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!isWebBridgeActive) handleToggleWebBridge();
                  else setIsWebBridgeModalOpen(true);
                }}
              >
                Launch Zero-Install Web QR
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {peerList.map((peer) => (
                <Card
                  key={peer.id}
                  interactive
                  className="flex flex-col justify-between gap-4 p-4.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl border border-slate-200 dark:border-slate-700/80 shrink-0">
                        {peer.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{peer.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{peer.ip}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">
                            {peer.os}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge variant={peer.connectionState === 'connected' ? 'success' : peer.isLocal ? 'primary' : 'secondary'}>
                      {peer.connectionState === 'connected' ? 'Connected' : peer.isLocal ? 'LAN Wire' : 'WAN P2P'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
                    <button
                      onClick={() => handleConnectToPeer(peer.id, 'talk')}
                      title="1:1 Encrypted Talk"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-600/15 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Talk</span>
                    </button>

                    <button
                      onClick={() => handleConnectToPeer(peer.id, 'files')}
                      title="Send Files"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-600/15 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <HardDriveUpload className="w-3.5 h-3.5" />
                      <span>Files</span>
                    </button>

                    <button
                      onClick={() => handleConnectToPeer(peer.id, 'remote')}
                      title="Remote Control"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-600/15 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      <span>Remote</span>
                    </button>

                    <button
                      onClick={() => handleConnectToPeer(peer.id, 'terminal')}
                      title="P2P Terminal Pairing"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-600/15 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 transition-colors text-[11px] font-medium gap-1"
                    >
                      <TerminalIcon className="w-3.5 h-3.5" />
                      <span>Shell</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Connect & Zero-Install Web Gateway */}
        <div className="flex flex-col gap-5">
          {/* Quick Connect by PIN */}
          <Card className="flex flex-col gap-3.5">
            <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Connect by Room PIN</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter a 6-character room PIN or invite token to pair with any peer across subnets.
            </p>

            <form onSubmit={handleQuickConnect} className="flex gap-2">
              <Input
                placeholder="e.g. 7X9K2P"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono uppercase font-bold text-center tracking-widest text-sm"
              />
              <Button type="submit" variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Join
              </Button>
            </form>
          </Card>

          {/* Web Gateway Card */}
          <Card className="flex flex-col gap-3.5 bg-gradient-to-br from-indigo-500/10 dark:from-indigo-950/30 to-white dark:to-slate-900/60 border-indigo-500/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Zero-Install Phone Bridge</span>
              </h3>
              <Badge variant={isWebBridgeActive ? 'success' : 'secondary'}>
                {isWebBridgeActive ? 'Active' : 'Offline'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Scan with your iPhone or Android camera to beam files or view your screen directly in Safari / Chrome with no app installation.
            </p>

            <Button
              variant={isWebBridgeActive ? 'tonal' : 'primary'}
              size="md"
              icon={<QrCode className="w-4 h-4" />}
              onClick={handleToggleWebBridge}
            >
              {isWebBridgeActive ? 'View Web Gateway QR' : 'Launch Web Gateway'}
            </Button>
          </Card>
        </div>
      </div>

      {/* Web Bridge Modal */}
      <Dialog
        isOpen={isWebBridgeModalOpen}
        onClose={() => setIsWebBridgeModalOpen(false)}
        title="Zero-Install Web Gateway"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {webBridgeQR && (
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
              <img src={webBridgeQR} alt="Web Bridge QR Code" className="w-52 h-52" />
            </div>
          )}

          <div className="text-center">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Scan with Mobile Camera</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Opens instant upload & download portal on your local Wi-Fi without installing any application.
            </p>
          </div>

          {webBridgeUrl && (
            <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-indigo-600 dark:text-indigo-300">
              <span className="truncate mr-2">{webBridgeUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webBridgeUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
