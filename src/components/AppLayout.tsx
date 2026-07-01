'use client';

import React, { useState } from 'react';
import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AppLayout({ children, allowedRoles }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="flex h-screen overflow-hidden bg-background">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 z-20 lg:hidden fade-in"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-semibold text-foreground text-sm">PharmaControl</span>
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
