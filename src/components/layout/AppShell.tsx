'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { QuickAddModal } from '@/components/ui/QuickAddModal';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Collapsible Left Navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="main-content">
        {/* Global Sticky Topbar */}
        <Topbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />

        {/* Page Content Body */}
        <main className="page-body">{children}</main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Global Quick Add Action Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
