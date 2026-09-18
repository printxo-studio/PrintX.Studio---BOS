'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Shield,
  Building2,
  Calculator,
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  DollarSign,
  FileText,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'gst' | 'company' | 'pricing' | 'currency'>('gst');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [logoPreviewBg, setLogoPreviewBg] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background removal algorithm on client canvas
  const processImageTransparency = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Strip near-white background pixels (R, G, B > 232)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If pixel is near-white or white
          if (r > 232 && g > 232 && b > 232) {
            // Feather edge slightly if near boundary
            const brightness = (r + g + b) / 3;
            if (brightness > 248) {
              data[i + 3] = 0; // Fully transparent
            } else {
              const factor = (248 - brightness) / 16;
              data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, factor)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        }, 'image/png');
      };

      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      let uploadBlob: Blob = file;

      if (autoRemoveBg) {
        uploadBlob = await processImageTransparency(file);
      }

      const formData = new FormData();
      formData.append('file', uploadBlob, 'logo.png');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        handleChange('logoUrl', data.url);
        localStorage.setItem('printxo_custom_logo', data.url);
        window.dispatchEvent(new CustomEvent('printxo:logo-updated', { detail: data.url }));
      } else {
        alert(data.error || 'Failed to upload logo');
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      alert('Error uploading logo: ' + err.message);
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetLogo = () => {
    handleChange('logoUrl', '/logo.png');
    localStorage.setItem('printxo_custom_logo', '/logo.png');
    window.dispatchEvent(new CustomEvent('printxo:logo-updated', { detail: '/logo.png' }));
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.settings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleToggleGst = () => {
    setSettings((prev: any) => ({
      ...prev,
      gstEnabled: !prev.gstEnabled,
    }));
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSaveSuccess(true);
        if (data.settings.logoUrl) {
          localStorage.setItem('printxo_custom_logo', data.settings.logoUrl);
          window.dispatchEvent(new CustomEvent('printxo:logo-updated', { detail: data.settings.logoUrl }));
        }
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading system configuration...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-red-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={20} color="var(--accent-red)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>System Settings & GST Master</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              One-toggle GST compliance, workshop pricing constants, and business profile
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveSuccess && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--status-success)',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} />
              Settings updated across the system!
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 24,
        }}
      >
        {[
          { id: 'gst', label: 'GST Compliance & Taxes', icon: Shield },
          { id: 'company', label: 'Company Profile & Branding', icon: Building2 },
          { id: 'pricing', label: '3D Printing Costing Constants', icon: Calculator },
          { id: 'currency', label: 'Currency & Localization', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-red)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--accent-red)' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GST COMPLIANCE & ONE-TOGGLE MODE */}
      {/* ========================================================================= */}
      {activeTab === 'gst' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Master GST Compliance Switch Box */}
          <div
            className="card"
            style={{
              padding: 24,
              border: settings.gstEnabled
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px solid rgba(239, 68, 68, 0.4)',
              backgroundColor: settings.gstEnabled
                ? 'rgba(16, 185, 129, 0.03)'
                : 'rgba(239, 68, 68, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ maxWidth: 650 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                    Master GST Mode Switch
                  </h3>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: settings.gstEnabled ? '#dcfce7' : '#fee2e2',
                      color: settings.gstEnabled ? '#15803d' : '#991b1b',
                    }}
                  >
                    {settings.gstEnabled ? 'FULL GST MODE ACTIVE' : 'NON-GST / UNREGISTERED ACTIVE'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                  {settings.gstEnabled
                    ? 'Your system is in Registered GST Mode. Invoices are issued as "TAX INVOICE", your GSTIN is displayed, and 18% GST (9% CGST + 9% SGST or 18% IGST) is automatically computed on quotes and invoices.'
                    : 'Your system is currently configured in Non-GST / Unregistered Mode (per Indian GST Act). All quotes and invoices are issued as "BILL OF SUPPLY / COMMERCIAL INVOICE" with ₹0 tax and legal exemption declarations. When you register for GST in the future, flip this toggle ON to transition your entire business to Full GST compliance instantly.'}
                </p>
              </div>

              {/* The Master Toggle Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <button
                  type="button"
                  onClick={handleToggleGst}
                  style={{
                    width: 64,
                    height: 34,
                    borderRadius: 20,
                    backgroundColor: settings.gstEnabled ? 'var(--status-success)' : 'var(--border-strong)',
                    position: 'relative',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: settings.gstEnabled ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: 4,
                      left: settings.gstEnabled ? 34 : 4,
                      transition: 'all 0.25s ease',
                    }}
                  />
                </button>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Click to Toggle
                </span>
              </div>
            </div>

            {/* Impact Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
                marginTop: 20,
                paddingTop: 18,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Invoice Document Title
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {settings.gstEnabled ? settings.invoiceTypeWithGst : settings.invoiceTypeWithoutGst}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Tax Charged on Quotes
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: settings.gstEnabled ? 'var(--accent-red)' : 'var(--status-success)', marginTop: 2 }}>
                  {settings.gstEnabled ? `${settings.defaultGstRate}% GST added` : '₹0 (Zero / Exempt)'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  GSTIN on Customer Documents
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {settings.gstEnabled && settings.gstin ? settings.gstin : 'Hidden (Unregistered)'}
                </div>
              </div>
            </div>
          </div>

          {/* GST Configuration Details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>
              Tax Configuration Parameters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  GSTIN (15-Digit Goods & Services Tax Number)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={settings.gstEnabled ? 'e.g. 29ABCDE1234F1Z5' : 'Leave empty (Unregistered)'}
                  value={settings.gstin || ''}
                  onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {settings.gstEnabled
                    ? 'Enter your official GSTIN when issued by the tax department.'
                    : 'Disabled in Non-GST mode. Will automatically appear once GST Mode is toggled ON.'}
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Default GST Tax Rate (%)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.defaultGstRate}
                  onChange={(e) => handleChange('defaultGstRate', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Standard Indian GST rate for additive manufacturing is 18% (9% CGST + 9% SGST).
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Tax Invoice Title (When GST Mode is ON)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.invoiceTypeWithGst}
                  onChange={(e) => handleChange('invoiceTypeWithGst', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Bill of Supply Title (When GST Mode is OFF)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.invoiceTypeWithoutGst}
                  onChange={(e) => handleChange('invoiceTypeWithoutGst', e.target.value)}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Non-GST Exemption Declaration Notice
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={settings.taxExemptionNote}
                  onChange={(e) => handleChange('taxExemptionNote', e.target.value)}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Printed on invoices and bills of supply to satisfy statutory auditor requirements.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY PROFILE & BRANDING */}
      {/* ========================================================================= */}
      {activeTab === 'company' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Brand Logo & Studio Identity */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Official Brand Logo & Image Manager</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Upload, replace, or customize your studio logo deployed across the sidebar, quotes, tax invoices, and shop floor reports.
                </p>
              </div>

              {/* Preview Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-surface-elevated)', padding: '3px 6px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Preview Canvas:</span>
                <button
                  type="button"
                  onClick={() => setLogoPreviewBg('dark')}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    backgroundColor: logoPreviewBg === 'dark' ? 'var(--bg-surface)' : 'transparent',
                    color: logoPreviewBg === 'dark' ? '#ffffff' : 'var(--text-muted)',
                    border: logoPreviewBg === 'dark' ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <Moon size={12} style={{ marginRight: 4 }} /> Dark Theme
                </button>
                <button
                  type="button"
                  onClick={() => setLogoPreviewBg('light')}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    backgroundColor: logoPreviewBg === 'light' ? '#ffffff' : 'transparent',
                    color: logoPreviewBg === 'light' ? '#0f172a' : 'var(--text-muted)',
                    border: logoPreviewBg === 'light' ? '1px solid #cbd5e1' : 'none',
                  }}
                >
                  <Sun size={12} style={{ marginRight: 4 }} /> Paper / Invoice
                </button>
              </div>
            </div>

            {/* Logo Display & Actions Container */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 24, alignItems: 'center' }}>
              {/* Dynamic Logo Preview Area */}
              <div
                style={{
                  height: 120,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: logoPreviewBg === 'dark' ? '#080808' : '#ffffff',
                  border: logoPreviewBg === 'dark' ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: logoPreviewBg === 'dark' ? 'inset 0 0 20px rgba(0,0,0,0.5)' : 'inset 0 0 20px rgba(0,0,0,0.05)',
                  backgroundImage: logoPreviewBg === 'dark'
                    ? 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              >
                <img
                  src={settings.logoUrl || '/logo.png'}
                  alt="Brand Logo"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: uploadingLogo ? 'opacity(0.3)' : 'none',
                    transition: 'filter 0.2s ease',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                />

                {uploadingLogo && (
                  <div style={{ position: 'absolute', fontSize: 12, fontWeight: 700, color: 'var(--accent-red)' }}>
                    Processing & Uploading...
                  </div>
                )}
              </div>

              {/* Upload Controls & Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    <Upload size={14} /> Upload New Logo Image
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Restore default PRINTXO Studio logo"
                  >
                    <RotateCcw size={14} /> Restore Default Logo
                  </button>
                </div>

                {/* White Background Removal Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={(e) => setAutoRemoveBg(e.target.checked)}
                    style={{ accentColor: 'var(--accent-red)', width: 14, height: 14 }}
                  />
                  <span>
                    <strong>Auto-remove white background</strong> (converts solid white pixels to transparent PNG)
                  </span>
                </label>

                {/* Direct Image URL Path */}
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>
                    Active Logo Asset URL / Path:
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: 12, padding: '5px 10px' }}
                      value={settings.logoUrl || ''}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="/logo.png or https://..."
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--status-success)', marginTop: 4, display: 'block' }}>
                    ✓ Seamlessly applied across Topbar/Sidebar, Quotations, and Tax Invoices.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Profile Details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Corporate & Workshop Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Brand / Studio Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Legal Registered Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Address Line
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  City, State, Pincode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={settings.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={settings.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 3D PRINTING COSTING CONSTANTS */}
      {/* ========================================================================= */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 0' }}>
              Slicer Engine & Quotation Pricing Constants
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
              These parameters feed directly into the Section 10 & 49 calculation engine for instant cost estimations.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Commercial Electricity Rate (₹ / kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={settings.electricityRatePerKwh}
                  onChange={(e) => handleChange('electricityRatePerKwh', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Commercial tariff in Bangalore / Karnataka is ~₹9.5 per kWh.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Average Machine Power Draw (Watts)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.powerConsumptionWatts}
                  onChange={(e) => handleChange('powerConsumptionWatts', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Typically 200W-350W for modern enclosed FDM printers (Bambu X1C, P1S).
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Machine Depreciation Rate (₹ / hour)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.machineDepreciationPerHour}
                  onChange={(e) => handleChange('machineDepreciationPerHour', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Based on machine purchase cost amortized over 4000-5000 runtime hours.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Direct Labor Rate (₹ / hour)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.laborRatePerHour}
                  onChange={(e) => handleChange('laborRatePerHour', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Applies to file pre-flight, slicing, support removal, and post-processing.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Operational Overhead Markup (%)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.overheadPercent}
                  onChange={(e) => handleChange('overheadPercent', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Facility rent, software licenses, CAD subscriptions, and shop maintenance.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Default Desired Gross Margin (%)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.defaultMarginPercent}
                  onChange={(e) => handleChange('defaultMarginPercent', Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Markup margin targeted on custom client additive jobs.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CURRENCY & LOCALIZATION */}
      {/* ========================================================================= */}
      {activeTab === 'currency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>
              Base Currency & International Quotes
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Default Base Currency
                </label>
                <select
                  className="form-input"
                  value={settings.defaultCurrency}
                  onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                >
                  <option value="INR">Indian Rupee (INR - ₹)</option>
                  <option value="USD">US Dollar (USD - $)</option>
                  <option value="EUR">Euro (EUR - €)</option>
                  <option value="GBP">British Pound (GBP - £)</option>
                </select>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Indian Rupee (₹) is the primary base currency for local billing.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Currency Symbol Displayed
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
