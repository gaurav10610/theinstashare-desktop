import React, { useState, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useAIStore } from '../../stores/useAIStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Button, Card, Input, Switch, Badge, Tabs } from '../../components/ui';
import { ReleaseService, AppVersionData, UpdateCheckResult } from '../../core/release/ReleaseService';
import { ReleaseModal } from '../../components/release/ReleaseModal';
import { Key, User, Globe, Save, Check, RefreshCw, Sparkles, Sun, Moon, Laptop, Palette } from 'lucide-react';

export function SettingsView() {
  const { myName, myAvatar, setMyName, setMyAvatar } = usePeerStore();
  const { settings, updateSettings } = useAIStore();
  const { defaultDownloadDir, setDefaultDownloadDir } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'ai-vault' | 'version'>('profile');
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
    <div className="h-full w-full overflow-y-auto p-7 flex flex-col gap-6 max-w-4xl text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings & Preferences</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure appearance, device profile, encrypted AI keyring, network, and updates.
          </p>
        </div>

        <Tabs
          activeTab={activeTab}
          onChange={(tab: any) => setActiveTab(tab)}
          tabs={[
            { id: 'profile', label: 'Profile' },
            { id: 'appearance', label: 'Appearance' },
            { id: 'ai-vault', label: 'BYOK Vault' },
            { id: 'version', label: 'Version' }
          ]}
        />
      </div>

      {/* Tab 1: Profile & Storage */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Local Device Profile</span>
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700/80 shrink-0">
                {myAvatar}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setMyAvatar(av)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-transform hover:scale-110 cursor-pointer ${
                      myAvatar === av ? 'bg-indigo-600/20 border-2 border-indigo-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Device / User Nickname"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Network & Storage</span>
            </h3>

            <Input
              label="Default Download Directory"
              value={defaultDownloadDir}
              onChange={(e) => setDefaultDownloadDir(e.target.value)}
            />
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              onClick={handleSaveSettings}
            >
              {isSaved ? 'Settings Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Appearance & Theme Engine */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Centralized Theme & Visual Mode</span>
              </h3>
              <Badge variant="primary">{theme.toUpperCase()}</Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose your preferred visual theme. System mode automatically detects and adapts to your OS dark/light mode in real time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Dark Theme Card */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-3xl border flex flex-col gap-3 cursor-pointer transition-all duration-150 ${
                  theme === 'dark'
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10 scale-[1.01]'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === 'dark' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Dark Mode (Default)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Deep slate backdrop with high-contrast glowing accents.</p>
                </div>
              </div>

              {/* Light Theme Card */}
              <div
                onClick={() => setTheme('light')}
                className={`p-4 rounded-3xl border flex flex-col gap-3 cursor-pointer transition-all duration-150 ${
                  theme === 'light'
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10 scale-[1.01]'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-amber-500">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === 'light' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Light Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Crisp, clean surface with optimal readability in daylight.</p>
                </div>
              </div>

              {/* System Auto Theme Card */}
              <div
                onClick={() => setTheme('system')}
                className={`p-4 rounded-3xl border flex flex-col gap-3 cursor-pointer transition-all duration-150 ${
                  theme === 'system'
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10 scale-[1.01]'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {theme === 'system' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">System Sync</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automatically syncs with macOS / Windows system preferences.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: BYOK Vault */}
      {activeTab === 'ai-vault' && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Encrypted AI Keyring (BYOK)</span>
              </h3>
              <Badge variant="success">OS SafeStorage Encrypted</Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your API keys are encrypted locally using macOS Keychain / Windows DPAPI / Linux Secret Service. Zero keys are ever sent to our servers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">AI Provider</label>
                <select
                  value={settings.provider}
                  onChange={(e) => updateSettings({ provider: e.target.value as any })}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 h-10 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ollama" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">100% Local Offline Ollama (Free)</option>
                  <option value="gemini" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Google Gemini (Gemini 2.0 / 1.5 Pro)</option>
                  <option value="claude" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Anthropic Claude (3.5 Sonnet)</option>
                  <option value="openai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="groq" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Groq (Ultra-Fast Llama 3.3)</option>
                </select>
              </div>

              {settings.provider === 'ollama' ? (
                <Input
                  label="Ollama Server URL"
                  value={settings.ollamaUrl}
                  onChange={(e) => updateSettings({ ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                />
              ) : (
                <Input
                  label={`${settings.provider.toUpperCase()} API Key`}
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                />
              )}
            </div>

            <Switch
              checked={settings.enablePreFlightSanitizer}
              onChange={(checked) => updateSettings({ enablePreFlightSanitizer: checked })}
              label="Pre-Flight Sanitizer Shield"
              description="Automatically scan folders before sending to prevent leaking .env secrets or credentials"
            />
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              onClick={handleSaveSettings}
            >
              {isSaved ? 'Settings Saved!' : 'Save Keyring'}
            </Button>
          </div>
        </div>
      )}

      {/* Tab 4: Versioning & Releases */}
      {activeTab === 'version' && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-lg border border-indigo-500/20">
                  v2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">ZeroHop Desktop</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Version {versionInfo?.version || '2.0.0'}</span>
                    <span>•</span>
                    <Badge variant="success">{versionInfo?.channel || 'Stable'}</Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />}
                disabled={isCheckingUpdate}
                onClick={handleCheckUpdates}
              >
                {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
              </Button>
            </div>

            {/* Architecture Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Platform</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{versionInfo?.platform || 'Darwin'} ({versionInfo?.arch || 'arm64'})</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Electron</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">v{versionInfo?.electronVersion || '34.2.0'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Node.js</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">v{versionInfo?.nodeVersion || '22.13.4'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Release Channel</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">Production</span>
              </div>
            </div>
          </Card>

          {/* Release Highlights */}
          <Card className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Version 2.0.0 Highlights</span>
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-100 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p>✨ <strong>Complete React 19 + Electron 34 Architecture:</strong> Ultra-fast Vite 6 bundling, 0 legacy code.</p>
              <p>🎨 <strong>Centralized Theme System:</strong> Instant switching across Dark, Light, and System OS sync.</p>
              <p>⚡ <strong>Zero-Install Web Guest Bridge:</strong> Share files and screens with iOS/Android via local QR codes.</p>
              <p>🖥️ <strong>60 FPS Hardware Remote Desktop:</strong> Sub-pixel Retina/DPI scaling and Privacy Shield.</p>
              <p>🤖 <strong>Dual-Mode AI:</strong> 100% Offline Local Whisper speech transcription + BYOK multi-provider vault.</p>
            </div>
          </Card>
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
