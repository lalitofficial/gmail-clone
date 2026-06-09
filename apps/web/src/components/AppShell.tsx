import { useState, type ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AppsPanel } from './AppsPanel';
import { ComposeManager } from './compose/ComposeManager';
import './AppShell.css';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="gm-app">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="gm-body">
        <Sidebar open={sidebarOpen} />
        <main className="gm-content">{children}</main>
        <AppsPanel />
      </div>
      <ComposeManager />
    </div>
  );
}
