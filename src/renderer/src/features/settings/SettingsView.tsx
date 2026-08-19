import React, { useState, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useAIStore } from '../../stores/useAIStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { M3Button, M3Card, M3TextField, M3Switch, M3Badge, M3Tabs } from '../../components/ui/M3Components';
import { ReleaseService, AppVersionData, UpdateCheckResult } from '../../core/release/ReleaseService';
import { ReleaseModal } from '../../components/release/ReleaseModal';
import { Key, User, Globe, Save, Check, RefreshCw, Sparkles, Tag, GitCommit, Cpu } from 'lucide-react';

export function SettingsView() {
  const { myName, myAvatar, setMyName, setMyAvatar } = usePeerStore();
  const { settings, updateSettings } = useAIStore();
  const { defaultDownloadDir, setDefaultDownloadDir } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'ai-vault' | 'version'>('profile');
  const [localName, setLocalName] = useState(myName);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Versioning state
  const [versionInfo, setVersionInfo] = useState<AppVersionData | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    window.api?.getSecret('ai_api_key').then((k) => {
      if (k) {
        setApiKeyInput(k);
        updateSettings({ apiKey: k });
      }
    }).catch(() => {});

    ReleaseService.getVersionInfo().then(setVersionInfo).catch(() => {});
  }, [updateSettings]);

  const handleSaveSettings = async () => {
    setMyName(localName);
    if (apiKeyInput.trim()) {
      await window.api?.saveSecret('ai_api_key', apiKeyInput.trim());
      updateSettings({ apiKey: apiKeyInput.trim() });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const result = await ReleaseService.checkForUpdates();
      setUpdateResult(result);
      setIsUpdateModalOpen(true);
    } catch (err: any) {
      alert(`Update check failed: ${err.message}`);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const AVATARS = ['🚀', '⚡', '🦊', '🦅', '🌌', '💎', '🔥', '🛡️', '💻', '🤖', '🛸', '🎯'];

  return (
    <div className="h-full w-full overflow-y-auto p-7 flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Settings & System</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure local device identity, encrypted BYOK AI keys, network, and app updates.
          </p>
        </div>

        <M3Tabs
          activeTab={activeTab}
          onChange={(tab: any) => setActiveTab(tab)}
          tabs={[
            { id: 'profile', label: 'Device Profile' },
            { id: 'ai-vault', label: 'BYOK Vault' },
            { id: 'version', label: 'Version & Releases' }
          ]}
        />
      </div>

      {/* Tab 1: Profile & Storage */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6">
          <M3Card className="flex flex-col gap-4">
            <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Local Device Profile</span>
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700/80 shrink-0">
                {myAvatar}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setMyAvatar(av)}
                    className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-base transition-transform hover:scale-110 cursor-pointer ${
                      myAvatar === av ? 'bg-indigo-600/30 border border-indigo-500 shadow-sm' : 'bg-slate-800/80 border border-slate-700/60'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <M3TextField
              label="Device / User Nickname"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </M3Card>

          <M3Card className="flex flex-col gap-4">
            <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Network & Storage</span>
            </h3>

            <M3TextField
              label="Default Download Directory"
              value={defaultDownloadDir}
              onChange={(e) => setDefaultDownloadDir(e.target.value)}
            />
          </M3Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <M3Button
              variant="filled"
              size="md"
              icon={isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              onClick={handleSaveSettings}
            >
              {isSaved ? 'Settings Saved!' : 'Save Changes'}
            </M3Button>
          </div>
        </div>
      )}

      {/* Tab 2: BYOK Vault */}
      {activeTab === 'ai-vault' && (
        <div className="flex flex-col gap-6">
          <M3Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Encrypted AI Keyring (BYOK)</span>
              </h3>
              <M3Badge variant="success">OS SafeStorage Encrypted</M3Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your API keys are encrypted locally using macOS Keychain / Windows DPAPI / Linux Secret Service. Zero keys are ever sent to our servers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">AI Provider</label>
                <select
                  value={settings.provider}
                  onChange={(e) => updateSettings({ provider: e.target.value as any })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 h-10 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ollama">100% Local Offline Ollama (Free)</option>
                  <option value="gemini">Google Gemini (Gemini 2.0 / 1.5 Pro)</option>
                  <option value="claude">Anthropic Claude (3.5 Sonnet)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="groq">Groq (Ultra-Fast Llama 3.3)</option>
                </select>
              </div>

              {settings.provider === 'ollama' ? (
                <M3TextField
                  label="Ollama Server URL"
                  value={settings.ollamaUrl}
                  onChange={(e) => updateSettings({ ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                />
              ) : (
                <M3TextField
                  label={`${settings.provider.toUpperCase()} API Key`}
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                />
              )}
            </div>

            <M3Switch
              checked={settings.enablePreFlightSanitizer}
              onChange={(checked) => updateSettings({ enablePreFlightSanitizer: checked })}
              label="Pre-Flight Sanitizer Shield"
              description="Automatically scan folders before sending to prevent leaking .env secrets or credentials"
            />
          </M3Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <M3Button
              variant="filled"
              size="md"
              icon={isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              onClick={handleSaveSettings}
            >
              {isSaved ? 'Settings Saved!' : 'Save Keyring'}
            </M3Button>
          </div>
        </div>
      )}

      {/* Tab 3: Versioning & Releases */}
      {activeTab === 'version' && (
        <div className="flex flex-col gap-6">
          <M3Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-lg border border-indigo-500/20">
                  v2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">InstaShare Next Desktop</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Version {versionInfo?.version || '2.0.0'}</span>
                    <span>•</span>
                    <M3Badge variant="success">{versionInfo?.channel || 'Stable'}</M3Badge>
                  </div>
                </div>
              </div>

              <M3Button
                variant="filled"
                size="sm"
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />}
                disabled={isCheckingUpdate}
                onClick={handleCheckUpdates}
              >
                {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
              </M3Button>
            </div>

            {/* Architecture Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Platform</span>
                <span className="font-semibold text-slate-200">{versionInfo?.platform || 'Darwin'} ({versionInfo?.arch || 'arm64'})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Electron</span>
                <span className="font-semibold text-slate-200">v{versionInfo?.electronVersion || '34.2.0'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Node.js</span>
                <span className="font-semibold text-slate-200">v{versionInfo?.nodeVersion || '22.13.4'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Release Channel</span>
                <span className="font-semibold text-indigo-300">Production</span>
              </div>
            </div>
          </M3Card>

          {/* Release Notes Preview */}
          <M3Card className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Version 2.0.0 Highlights</span>
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <p>✨ <strong>Complete React 19 + Electron 34 Rewrite:</strong> Zero legacy Angular code, instantaneous Vite 6 bundling.</p>
              <p>⚡ <strong>Zero-Install Web Guest Bridge:</strong> Share files and screens with iOS/Android via local QR codes.</p>
              <p>🖥️ <strong>60 FPS Hardware Remote Desktop:</strong> Sub-pixel Retina/DPI scaling and Privacy Shield.</p>
              <p>🤖 <strong>Dual-Mode AI:</strong> 100% Offline Local Whisper speech transcription + BYOK multi-provider vault.</p>
              <p>🔒 <strong>BLAKE3 Chunk Healing:</strong> Stream multi-gigabyte transfers with zero RAM footprint.</p>
            </div>
          </M3Card>
        </div>
      )}

      {/* In-App Release Update Modal */}
      <ReleaseModal
        isOpen={isUpdateModalOpen}
        updateInfo={updateResult}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
}
