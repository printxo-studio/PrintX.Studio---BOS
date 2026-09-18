'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Zap,
  Users,
  ShoppingBag,
  Cpu,
  Box,
  Printer,
  Disc,
  Layers,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  X,
} from 'lucide-react';
import { NAVIGATION_MODULES } from '@/lib/constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenQuickAdd }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Create New Lead', action: () => { onClose(); onOpenQuickAdd(); } },
    { title: 'Create New Customer', action: () => { onClose(); onOpenQuickAdd(); } },
    { title: 'Create New Quote', action: () => { onClose(); onOpenQuickAdd(); } },
    { title: 'Create New Order', action: () => { onClose(); onOpenQuickAdd(); } },
    { title: 'Create Print Job', action: () => { onClose(); onOpenQuickAdd(); } },
    { title: 'Add Filament Spool', action: () => { onClose(); onOpenQuickAdd(); } },
    { title: 'Record QC Inspection', action: () => { onClose(); onOpenQuickAdd(); } },
  ];

  const filteredModules = NAVIGATION_MODULES.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) || m.group.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 580, marginTop: '-10vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={18} color="var(--accent-red)" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to page... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          />
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '12px 10px' }}>
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                }}
              >
                Quick Actions
              </div>
              {filteredActions.map((action, i) => (
                <div
                  key={i}
                  onClick={action.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <PlusCircle size={15} color="var(--accent-red)" />
                  <span>{action.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Pages */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              Navigation
            </div>
            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => {
                  router.push(mod.path);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LayoutDashboard size={15} color="var(--text-muted)" />
                  <span>{mod.name}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{mod.group}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            fontSize: 11.5,
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Use <strong>Ctrl+K</strong> anywhere to open</span>
          <span>PrintXO BOS</span>
        </div>
      </div>
    </div>
  );
}
