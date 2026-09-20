'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Bell,
  Command,
  Check,
  AlertTriangle,
  Clock,
  ChevronDown,
  User,
  Shield,
  Layers,
  X,
  LogOut,
} from 'lucide-react';
import { COMPANY_DETAILS } from '@/lib/constants';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenQuickAdd: () => void;
}

export function Topbar({ onOpenCommandPalette, onOpenQuickAdd }: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current authenticated user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    router.push('/login');
    router.refresh();
  };

  // Load notifications
  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(data))
      .catch(() => {});
  }, []);

  // Debounced search across all entities (Section 5)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search and notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Global Search Bar (Section 5) */}
      <div ref={searchRef} style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 12px',
            gap: 8,
          }}
        >
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search orders, quotes, customers, SKUs, spools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchDropdown(true);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 12.5,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onOpenCommandPalette}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              padding: '2px 5px',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            title="Open Command Palette (Ctrl+K)"
          >
            <Command size={10} /> K
          </button>
        </div>

        {/* Global Search Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: 400,
              overflowY: 'auto',
              zIndex: 100,
              padding: '6px 0',
            }}
          >
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setShowSearchDropdown(false);
                  setSearchQuery('');
                  router.push(item.url);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 12.5,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.subtitle}</div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Quick Add Button (+) */}
        <button
          onClick={onOpenQuickAdd}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
          title="Quick Add Record"
        >
          <Plus size={15} /> Quick Add
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-sm"
            style={{ position: 'relative', padding: '6px 9px' }}
            title="Notifications & Alerts"
          >
            <Bell size={15} color={unreadCount > 0 ? 'var(--accent-red)' : 'inherit'} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 15,
                  height: 15,
                  backgroundColor: 'var(--accent-red)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: 9,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 340,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                padding: '10px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 14px 10px 14px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>System Alerts & Notifications</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{notifications.length} alerts</span>
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    No unread notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--bg-surface)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: n.type === 'LOW_STOCK' ? 'var(--status-warning)' : 'var(--accent-red)',
                          }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Currency Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <span>₹</span> INR
        </div>

        {/* Studio Operator Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser?.role || 'Owner'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out of BOS"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut style={{ width: 12, height: 12 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
