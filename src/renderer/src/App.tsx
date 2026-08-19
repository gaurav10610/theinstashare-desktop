import React, { useEffect } from 'react';
import { usePeerStore } from './stores/usePeerStore';
import { useThemeStore } from './stores/useThemeStore';
import { useCallStore } from './stores/useCallStore';
import { useFileStore } from './stores/useFileStore';
import { useRemoteStore } from './stores/useRemoteStore';
import { useTerminalStore } from './stores/useTerminalStore';
import { useNotificationStore } from './stores/useNotificationStore';
import { ConnectionManager } from './core/transport/ConnectionManager';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { TalkView } from './features/talk/TalkView';
import { FileTransferView } from './features/file-transfer/FileTransferView';
import { RemoteView } from './features/remote/RemoteView';
import { TerminalView } from './features/terminal/TerminalView';
import { AIWorkspaceView } from './features/ai/AIWorkspaceView';
import { SettingsView } from './features/settings/SettingsView';

// Expose stores for automated testing & devtools
if (typeof window !== 'undefined') {
  (window as any).usePeerStore = usePeerStore;
  (window as any).useCallStore = useCallStore;
  (window as any).useFileStore = useFileStore;
  (window as any).useRemoteStore = useRemoteStore;
  (window as any).useTerminalStore = useTerminalStore;
  (window as any).useNotificationStore = useNotificationStore;
  (window as any).ConnectionManager = ConnectionManager;
}

export function App() {
  const { activeTab, initFromAppArgs } = usePeerStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    initFromAppArgs().then(() => {
      ConnectionManager.getInstance().init();
    });
  }, [initTheme, initFromAppArgs]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'talk':
        return <TalkView />;
      case 'files':
        return <FileTransferView />;
      case 'remote':
        return <RemoteView />;
      case 'terminal':
        return <TerminalView />;
      case 'ai':
        return <AIWorkspaceView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <AppLayout>{renderActiveView()}</AppLayout>;
}

export default App;
