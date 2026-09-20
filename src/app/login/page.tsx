'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Layers,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirectUrl);
        }
      })
      .catch(() => {});
  }, [redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Success: redirect to target dashboard or root
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to connect to authentication service.');
      setIsLoading(false);
    }
  };

  const handleFillOwnerCredentials = () => {
    setEmail('printxo.studio@gmail.com');
    setPassword('PrintX@2026!');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#090a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(9, 10, 15, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: '500px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(9, 10, 15, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#12141d',
          border: '1px solid #232738',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.03)',
          padding: '40px 36px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <img
              src="/logo.png"
              alt="PrintX Studio"
              style={{
                height: '48px',
                width: 'auto',
                maxWidth: '220px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#f87171',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            <Cpu style={{ width: '12px', height: '12px' }} />
            Business Operating System (BOS)
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Studio Operator Access
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Sign in to manage print farm, quotations, CRM & orders.
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ lineHeight: 1.4 }}>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '6px',
              }}
            >
              Operator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#64748b',
                }}
              />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="operator@printx.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  backgroundColor: '#181b26',
                  border: '1px solid #2d3348',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#cbd5e1',
                }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#64748b',
                }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 40px',
                  backgroundColor: '#181b26',
                  border: '1px solid #2d3348',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Eye style={{ width: '16px', height: '16px' }} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12.5px',
                color: '#94a3b8',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#dc2626',
                  cursor: 'pointer',
                  width: '14px',
                  height: '14px',
                }}
              />
              Stay authenticated for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 18px',
              backgroundColor: isLoading ? '#991b1b' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              transition: 'all 0.2s ease',
              marginTop: '6px',
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Authenticating Operator...
              </>
            ) : (
              <>
                Sign In to Studio BOS
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Credentials Card for Owner */}
        <div
          style={{
            marginTop: '28px',
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: '#161924',
            border: '1px solid #23293c',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#f1f5f9',
              }}
            >
              <KeyRound style={{ width: '13px', height: '13px', color: '#ef4444' }} />
              Default Owner Credentials
            </div>
            <button
              type="button"
              onClick={handleFillOwnerCredentials}
              style={{
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '6px',
                color: '#f87171',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Auto-Fill
            </button>
          </div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.5 }}>
            Email: <strong style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>printxo.studio@gmail.com</strong>
            <br />
            Password: <strong style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>PrintX@2026!</strong>
          </div>
        </div>

        {/* Security Footer */}
        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck style={{ width: '13px', height: '13px', color: '#22c55e' }} />
          Encrypted Session &bull; ISO/IEC 27001 Manufacturing Access
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
