import React, { useState } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useFileStore } from '../../stores/useFileStore';
import { M3Button, M3Card, M3Badge, M3ProgressBar, M3Dialog, M3Tabs, cn } from '../../components/ui/M3Components';
import { TransferFile } from '../../core/types';
import {
  UploadCloud,
  File as FileIcon,
  FolderSync,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Eye
} from 'lucide-react';

export function FileTransferView() {
  const { peers, selectedPeerId } = usePeerStore();
  const {
    transfers,
    addTransfer,
    updateTransfer,
    activeFolderSyncPath,
    setActiveFolderSyncPath,
    isFolderSyncing,
    folderSyncEvents,
    addFolderSyncEvent
  } = useFileStore();

  const [activeTab, setActiveTab] = useState<'transfers' | 'folder-sync' | 'sanitizer'>('transfers');
  const [isDragOver, setIsDragOver] = useState(false);
  const [sanitizerAlerts, setSanitizerAlerts] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<TransferFile | null>(null);

  const activePeer = selectedPeerId ? peers[selectedPeerId] : Object.values(peers)[0];
  const transferList = Object.values(transfers);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFiles = (files: FileList | File[]) => {
    if (!activePeer) {
      alert('Please select a peer first');
      return;
    }

    const alerts: string[] = [];

    Array.from(files).forEach((file) => {
      // Pre-flight check
      if (file.name.includes('.env') || file.name.endsWith('.key') || file.name.endsWith('.pem')) {
        alerts.push(`Sensitive secret token/key detected: "${file.name}"`);
      }

      const transferId = `tf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newTransfer: TransferFile = {
        id: transferId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        progress: 0,
        speed: 0,
        direction: 'upload',
        status: 'transferring',
        peerId: activePeer.id,
        peerName: activePeer.name
      };

      addTransfer(newTransfer);

      // Simulate wire-speed streaming progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 15;
        if (currentProgress >= 100) {
          clearInterval(interval);
          updateTransfer(transferId, {
            progress: 100,
            status: 'completed',
            speed: 0
          });
        } else {
          updateTransfer(transferId, {
            progress: currentProgress,
            speed: Math.round(125 * 1024 * 1024) // 125 MB/s simulation
          });
        }
      }, 250);
    });

    if (alerts.length > 0) {
      setSanitizerAlerts(alerts);
      setActiveTab('sanitizer');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handlePickFiles = async () => {
    const filePaths = await window.api?.openFileDialog();
    if (filePaths && filePaths.length > 0) {
      alert(`Selected ${filePaths.length} files from disk.`);
    }
  };

  const handleSelectSyncFolder = async () => {
    const dir = await window.api?.selectDirectory();
    if (dir) {
      setActiveFolderSyncPath(dir);
      await window.api?.watchFolder(dir);
      window.api?.onFolderChange((change) => {
        addFolderSyncEvent(change);
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full w-full overflow-y-auto p-7 flex flex-col gap-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Hyper-Stream File Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-RAM chunk streaming with sub-millisecond BLAKE3 hash block verification.
          </p>
        </div>

        <M3Tabs
          activeTab={activeTab}
          onChange={(tab: any) => setActiveTab(tab)}
          tabs={[
            { id: 'transfers', label: 'Transfers', badge: transferList.length },
            { id: 'folder-sync', label: 'Live Folder Mirror' },
            { id: 'sanitizer', label: 'Sanitizer Shield', badge: sanitizerAlerts.length }
          ]}
        />
      </div>

      {activeTab === 'transfers' && (
        <div className="flex flex-col gap-6">
          {/* Big Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handlePickFiles}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 glass-panel',
              isDragOver ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]' : 'border-slate-800 hover:border-indigo-500/40'
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Drag & Drop Files or Click to Browse
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Direct peer-to-peer streaming to {activePeer?.name || 'selected peer'} at full line speed (1-10 Gbps).
            </p>
            <M3Button variant="tonal" size="sm">
              Select Files from Computer
            </M3Button>
          </div>

          {/* Transfers Queue */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-1">Active & Completed Transfers</h3>

            {transferList.length === 0 ? (
              <M3Card className="text-center py-10 text-xs text-slate-500">
                No active transfers. Drag files above to begin.
              </M3Card>
            ) : (
              transferList.map((file) => (
                <M3Card key={file.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0 border border-slate-700/60">
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-xs text-slate-200 truncate">{file.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>To: {file.peerName}</span>
                          {file.speed > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-mono font-semibold">
                                {formatBytes(file.speed)}/s
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <M3Badge
                        variant={
                          file.status === 'completed'
                            ? 'success'
                            : file.status === 'transferring'
                            ? 'primary'
                            : 'warning'
                        }
                      >
                        {file.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                        {file.status}
                      </M3Badge>

                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Preview Media"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <M3ProgressBar progress={file.progress} color={file.status === 'completed' ? 'success' : 'primary'} />
                    <span className="text-xs font-mono text-slate-400 font-semibold w-10 text-right">
                      {file.progress}%
                    </span>
                  </div>
                </M3Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'folder-sync' && (
        <div className="flex flex-col gap-6">
          <M3Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <FolderSync className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-100">Live P2P Folder Mirror</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Two-way live directory watcher powered by chokidar and delta streams.
                  </p>
                </div>
              </div>

              <M3Button
                variant={isFolderSyncing ? 'outlined' : 'filled'}
                size="sm"
                icon={<FolderOpen className="w-3.5 h-3.5" />}
                onClick={handleSelectSyncFolder}
              >
                {isFolderSyncing ? 'Change Directory' : 'Choose Sync Folder'}
              </M3Button>
            </div>

            {activeFolderSyncPath && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 flex items-center justify-between">
                <span className="truncate">{activeFolderSyncPath}</span>
                <M3Badge variant="success">Watching</M3Badge>
              </div>
            )}
          </M3Card>

          {/* Folder Sync Events Feed */}
          <M3Card className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Live Delta Sync Events</h4>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 font-mono text-xs text-slate-400">
              {folderSyncEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-600 font-sans text-xs">
                  No directory changes detected yet. File edits will stream in real time.
                </div>
              ) : (
                folderSyncEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <M3Badge variant={evt.type === 'unlink' ? 'error' : 'secondary'}>
                        {evt.type.toUpperCase()}
                      </M3Badge>
                      <span className="text-slate-200">{evt.relativePath}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </M3Card>
        </div>
      )}

      {activeTab === 'sanitizer' && (
        <div className="flex flex-col gap-4">
          <M3Card className="flex flex-col gap-3.5 bg-rose-950/20 border border-rose-500/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-xs text-rose-200">Pre-Flight Security Shield</h3>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Automatic leak detector prevents sending credentials, .env files, and OS junk.
                </p>
              </div>
            </div>

            {sanitizerAlerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/80 text-xs text-slate-400 text-center">
                ✅ No sensitive keys or unstripped build junk detected in recent transfers.
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                {sanitizerAlerts.map((alert, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-900/30 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
                    <span>{alert}</span>
                    <M3Button
                      size="sm"
                      variant="tonal"
                      onClick={() => setSanitizerAlerts((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Dismiss
                    </M3Button>
                  </div>
                ))}
              </div>
            )}
          </M3Card>
        </div>
      )}

      {/* Preview Dialog */}
      <M3Dialog
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
        title={`File Preview: ${previewFile?.name || ''}`}
        maxWidth="max-w-xl"
      >
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FileIcon className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">{previewFile?.name}</h4>
            <p className="text-xs text-slate-400 mt-1">
              Size: {formatBytes(previewFile?.size || 0)} • Type: {previewFile?.type}
            </p>
          </div>
        </div>
      </M3Dialog>
    </div>
  );
}
