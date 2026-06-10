import { useState, type ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AppsPanel } from './AppsPanel';
import { Snackbar } from './Snackbar';
import { ComposeManager } from './compose/ComposeManager';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import './AppShell.css';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  useKeyboardShortcuts();

  return (
    <div className="gm-app">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="gm-body">
        <Sidebar open={sidebarOpen} />
        <main className="gm-content">{children}</main>
        <AppsPanel open={sidePanelOpen} onToggle={() => setSidePanelOpen((value) => !value)} />
      </div>
      <ComposeManager />
      <Snackbar />
    </div>
  );
}
