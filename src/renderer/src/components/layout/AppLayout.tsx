import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DropShelf } from '../ui/DropShelf';
import { IncomingActionModal } from '../notifications/IncomingActionModal';
import { ToastContainer } from '../notifications/ToastContainer';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative bg-slate-900/30">
          {children}
        </main>
        <DropShelf />
      </div>
      <IncomingActionModal />
      <ToastContainer />
    </div>
  );
}
