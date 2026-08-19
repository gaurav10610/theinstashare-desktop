import React from 'react';
import { M3Dialog, M3Button, M3Badge } from '../ui/M3Components';
import { UpdateCheckResult } from '../../core/release/ReleaseService';
import { Sparkles, Download, ExternalLink, CheckCircle } from 'lucide-react';

export function ReleaseModal({
  updateInfo,
  isOpen,
  onClose
}: {
  updateInfo: UpdateCheckResult | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!updateInfo || !isOpen) return null;

  const handleDownload = () => {
    if (updateInfo.downloadUrl) {
      window.api?.openDownloadPage(updateInfo.downloadUrl);
    }
  };

  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={updateInfo.hasUpdate ? 'New Update Available! 🚀' : 'App is Up to Date'}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              {updateInfo.hasUpdate ? <Sparkles className="w-5 h-5 text-amber-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-100">{updateInfo.releaseName}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>Installed: v{updateInfo.currentVersion}</span>
                <span>•</span>
                <span className="font-semibold text-indigo-300">Latest: v{updateInfo.latestVersion}</span>
              </div>
            </div>
          </div>

          <M3Badge variant={updateInfo.hasUpdate ? 'warning' : 'success'}>
            {updateInfo.hasUpdate ? 'Update Ready' : 'Latest Release'}
          </M3Badge>
        </div>

        {/* Release Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Release Notes & Changelog</label>
          <div className="max-h-60 overflow-y-auto p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
            {updateInfo.releaseNotes}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <M3Button variant="tonal" size="sm" onClick={onClose}>
            Close
          </M3Button>

          {updateInfo.hasUpdate && (
            <M3Button
              variant="filled"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download Update ({updateInfo.assetName || 'Installer'})
            </M3Button>
          )}
        </div>
      </div>
    </M3Dialog>
  );
}
