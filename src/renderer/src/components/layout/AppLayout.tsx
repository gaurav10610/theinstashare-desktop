import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DropShelf } from '../ui/DropShelf';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative bg-slate-900/30">
          {children}
        </main>
        <DropShelf />
      </div>
    </div>
  );
}
