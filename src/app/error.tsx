'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
      <div
        className="card"
        style={{
          padding: 36,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-danger, #ef4444)',
            }}
          >
            <AlertTriangle size={28} />
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
          Application Encountered An Issue
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          {error?.message || 'Could not load data. If you recently configured environment variables on Vercel, please trigger a Redeploy.'}
        </p>

        {error?.digest && (
          <div
            style={{
              background: 'var(--bg-subtle, rgba(255,255,255,0.05))',
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              display: 'inline-block',
              marginBottom: 24,
            }}
          >
            Error Digest: {error.digest}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={() => reset()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Home size={16} /> Reload Page
          </Link>
        </div>
      </div>
    </div>
  );
}
