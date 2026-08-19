import React, { useEffect } from 'react';
import { usePeerStore } from './stores/usePeerStore';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { TalkView } from './features/talk/TalkView';
import { FileTransferView } from './features/file-transfer/FileTransferView';
import { RemoteView } from './features/remote/RemoteView';
import { TerminalView } from './features/terminal/TerminalView';
import { AIWorkspaceView } from './features/ai/AIWorkspaceView';
import { SettingsView } from './features/settings/SettingsView';

export function App() {
  const { activeTab, initFromAppArgs } = usePeerStore();

  useEffect(() => {
    initFromAppArgs();
  }, [initFromAppArgs]);

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
