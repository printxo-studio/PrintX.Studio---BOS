'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Users,
  UserCheck,
  FileText,
  ShoppingBag,
  Cpu,
  Box,
  Printer,
  Disc,
  Layers,
  ShieldCheck,
  Gauge,
  Sliders,
  FlaskConical,
  Truck,
  CreditCard,
  CheckSquare,
  FolderArchive,
  BarChart3,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { NAVIGATION_MODULES } from '@/lib/constants';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Zap,
  Users,
  UserCheck,
  FileText,
  ShoppingBag,
  Cpu,
  Box,
  Printer,
  Disc,
  Layers,
  ShieldCheck,
  Gauge,
  Sliders,
  FlaskConical,
  Truck,
  CreditCard,
  CheckSquare,
  FolderArchive,
  BarChart3,
  PieChart,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  // Load and listen for logo updates
  useEffect(() => {
    const savedLogo = localStorage.getItem('printxo_custom_logo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.logoUrl) {
          setLogoUrl(data.settings.logoUrl);
          localStorage.setItem('printxo_custom_logo', data.settings.logoUrl);
        }
      })
      .catch(() => {});

    const handleLogoChange = (e: any) => {
      const nextUrl = e.detail || '/logo.png';
      setLogoUrl(nextUrl);
      localStorage.setItem('printxo_custom_logo', nextUrl);
    };

    window.addEventListener('printxo:logo-updated', handleLogoChange);
    return () => {
      window.removeEventListener('printxo:logo-updated', handleLogoChange);
    };
  }, []);

  // Remember sidebar state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('printxo_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('printxo_sidebar_collapsed', String(next));
  };

  // Group modules
  const groups: Record<string, typeof NAVIGATION_MODULES> = {};
  NAVIGATION_MODULES.forEach((mod) => {
    if (!groups[mod.group]) groups[mod.group] = [];
    groups[mod.group].push(mod);
  });

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 8px' : '0 16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {!collapsed ? (
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              maxWidth: 180,
              overflow: 'hidden',
            }}
          >
            <img
              src={logoUrl || '/logo.png'}
              alt="PRINTXO Studio"
              style={{
                height: 32,
                width: 'auto',
                maxWidth: 165,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>
        ) : (
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="PRINTXO Studio"
          >
            <img
              src="/logo-icon.png"
              alt="PRINTXO"
              style={{
                width: 28,
                height: 28,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>
        )}

        <button
          onClick={toggleCollapse}
          className="btn btn-ghost btn-sm"
          style={{ padding: 4, color: 'var(--text-muted)' }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Menu */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '12px 6px' : '14px 10px',
        }}
      >
        {Object.entries(groups).map(([groupTitle, modules]) => (
          <div key={groupTitle} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  padding: '4px 10px 6px 10px',
                }}
              >
                {groupTitle}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {modules.map((mod) => {
                const IconComponent = ICON_MAP[mod.icon] || Box;
                const isActive = pathname === mod.path || (mod.path !== '/' && pathname.startsWith(mod.path));

                return (
                  <Link
                    key={mod.id}
                    href={mod.path}
                    title={collapsed ? mod.name : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '9px 0' : '7px 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--accent-red-subtle)' : 'transparent',
                      borderLeft: isActive && !collapsed ? '3px solid var(--accent-red)' : '3px solid transparent',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <IconComponent
                      size={17}
                      color={isActive ? 'var(--accent-red)' : 'var(--text-muted)'}
                      style={{ flexShrink: 0 }}
                    />
                    {!collapsed && <span>{mod.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Owner Status */}
      <div
        style={{
          padding: collapsed ? '12px 6px' : '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: 'var(--border-strong)',
            color: 'var(--text-primary)',
            fontSize: 11.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          XO
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              PrintXO Studio
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
              Farm Online
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
