'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Gauge,
  Layers,
  Thermometer,
  Wind,
  Zap,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
  FileCode2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';

export default function PrintProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<any>({});

  // Forms
  const [newProfileForm, setNewProfileForm] = useState({
    name: 'Bambu PA-CF High Tensile Structural',
    printerModel: 'Bambu Lab X1-Carbon',
    material: 'PA-CF',
    nozzleSize: '0.4',
    layerHeight: '0.16',
    wallLoops: '4',
    topLayers: '5',
    bottomLayers: '4',
    infillPercent: '35',
    infillPattern: 'Gyroid',
    printSpeed: '120',
    nozzleTemp: '285',
    bedTemp: '90',
    coolingFanSpeed: '20',
    retractionDistance: '0.8',
    retractionSpeed: '30',
    supportType: 'Tree',
    slicerName: 'OrcaSlicer',
    slicerVersion: 'v2.1.0',
    version: '1.2',
    status: 'PRODUCTION',
    notes: 'Maximized inter-layer bond strength for aerodynamic drone arms and load-bearing brackets.',
  });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/print-profiles?material=${materialFilter}&status=${statusFilter}`);
      if (res.ok) setProfiles(await res.json());
    } catch (err) {
      console.error('Failed to load print profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [materialFilter, statusFilter]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/print-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfileForm),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadProfiles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditProfile = (profile: any) => {
    setEditProfileForm({
      id: profile.id,
      name: profile.name || '',
      slicerName: profile.slicerName || '',
      version: profile.version || '',
      status: profile.status || 'PRODUCTION',
      layerHeight: profile.layerHeight || 0.2,
      printSpeed: profile.printSpeed || 100,
      infillPercent: profile.infillPercent || 20,
      infillPattern: profile.infillPattern || 'Gyroid',
      nozzleTemp: profile.nozzleTemp || 220,
      bedTemp: profile.bedTemp || 60,
      wallCount: profile.wallCount || profile.wallLoops || 3,
      notes: profile.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/print-profiles/${editProfileForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadProfiles();
      } else {
        alert('Failed to update print profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      const res = await fetch(`/api/print-profiles/${id}`, { method: 'DELETE' });
      if (res.ok) loadProfiles();
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalProfiles = profiles.length;
  const productionApproved = profiles.filter((p) => p.status === 'PRODUCTION' || p.status === 'APPROVED').length;
  const avgSuccessRate =
    totalProfiles > 0
      ? Math.round(profiles.reduce((acc, p) => acc + (p.successRate || 100), 0) / totalProfiles)
      : 100;
  const materialsList = Array.from(new Set(profiles.map((p) => p.material)));

  // Filtered by Search
  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.profileCode.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.printerModel.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.slicerName.toLowerCase().includes(q);
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-red)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Precision Engineering
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Section 19: Slicer Parameter Presets
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: 4,
            }}
          >
            Print Profiles Master
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Centralized slicer presets for OrcaSlicer, Bambu Studio, and PrusaSlicer with validated speeds, layer heights, and thermals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              backgroundColor: 'var(--accent-red)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px var(--accent-red-glow)',
            }}
          >
            <Plus size={16} />
            Create Print Profile
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <KPICard
          label="Total Profiles"
          value={totalProfiles}
          subtext="Validated slicing recipes"
          icon={Sliders}
        />
        <KPICard
          label="Production Certified"
          value={productionApproved}
          subtext="Approved for live dispatch"
          icon={CheckCircle2}
        />
        <KPICard
          label="Farm Success Rate"
          value={`${avgSuccessRate}%`}
          subtext="Average first pass yield"
          icon={Zap}
        />
        <KPICard
          label="Primary Slicer"
          value="OrcaSlicer"
          subtext="Engineering standard"
          icon={FileCode2}
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              width: '100%',
              maxWidth: 360,
            }}
          >
            <Search size={16} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search profile name, machine, material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} color="var(--text-tertiary)" />
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 13,
                padding: '6px 10px',
                outline: 'none',
              }}
            >
              <option value="ALL">All Materials</option>
              {materialsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 13,
                padding: '6px 10px',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRODUCTION">Production Certified</option>
              <option value="APPROVED">Approved</option>
              <option value="TESTING">Testing</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Showing {filteredProfiles.length} profiles
        </div>
      </div>

      {/* Profiles Grid / Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading print profiles...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No print profiles match the selected filters.
          </div>
        ) : (
          filteredProfiles.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 12,
                        color: 'var(--accent-red)',
                      }}
                    >
                      {p.profileCode}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      v{p.version}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: 4,
                    }}
                  >
                    {p.name}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {p.printerModel}
                  </div>
                </div>

                <StatusBadge status={p.status} />
              </div>

              {/* Slicer Settings Quick Matrix */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  backgroundColor: 'var(--bg-canvas)',
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Layer / Nozzle</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {p.layerHeight}mm / {p.nozzleSize}mm
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Speed</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {p.printSpeed} mm/s
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Infill</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {p.infillPercent}% {p.infillPattern}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Nozzle / Bed Temp</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {p.nozzleTemp}°C / {p.bedTemp}°C
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Walls / Top / Bot</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {p.wallLoops} / {p.topLayers} / {p.bottomLayers}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Slicer</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {p.slicerName}
                  </div>
                </div>
              </div>

              {/* Success Rate Telemetry */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Production Success: <strong>{p.successRate}%</strong> ({p.successfulPrints || 0} / {p.totalPrints || 0} jobs)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {p.material}
                </span>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => {
                    setSelectedProfile(p);
                    setIsDetailModalOpen(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  View Parameters
                </button>
                <button
                  onClick={() => handleOpenEditProfile(p)}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  title="Edit Profile"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteProfile(p.id)}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--accent-red)',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE PROFILE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Engineered Print Profile"
      >
        <form onSubmit={handleCreateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Profile Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PETG High Detail - Cosmetic Exterior"
              value={newProfileForm.name}
              onChange={(e) => setNewProfileForm({ ...newProfileForm, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Target Printer Model
              </label>
              <input
                type="text"
                required
                value={newProfileForm.printerModel}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, printerModel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Material
              </label>
              <input
                type="text"
                required
                value={newProfileForm.material}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, material: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Layer Height (mm)
              </label>
              <input
                type="number"
                step="0.02"
                required
                value={newProfileForm.layerHeight}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, layerHeight: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Nozzle Size (mm)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newProfileForm.nozzleSize}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, nozzleSize: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Speed (mm/s)
              </label>
              <input
                type="number"
                required
                value={newProfileForm.printSpeed}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, printSpeed: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Nozzle Temp (°C)
              </label>
              <input
                type="number"
                required
                value={newProfileForm.nozzleTemp}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, nozzleTemp: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Bed Temp (°C)
              </label>
              <input
                type="number"
                required
                value={newProfileForm.bedTemp}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, bedTemp: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Infill (%)
              </label>
              <input
                type="number"
                required
                value={newProfileForm.infillPercent}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, infillPercent: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Infill Pattern
              </label>
              <select
                value={newProfileForm.infillPattern}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, infillPattern: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="Gyroid">Gyroid (Isotropic Strength)</option>
                <option value="Grid">Grid</option>
                <option value="Honeycomb">Honeycomb</option>
                <option value="Cross Hatch">Cross Hatch</option>
                <option value="100% Solid">100% Solid Infill</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Slicer Engine
              </label>
              <select
                value={newProfileForm.slicerName}
                onChange={(e) => setNewProfileForm({ ...newProfileForm, slicerName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="OrcaSlicer">OrcaSlicer</option>
                <option value="Bambu Studio">Bambu Studio</option>
                <option value="PrusaSlicer">PrusaSlicer</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                backgroundColor: 'var(--accent-red)',
                border: 'none',
                borderRadius: 4,
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Profile Specification: ${selectedProfile?.name}`}
      >
        {selectedProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                backgroundColor: 'var(--bg-canvas)',
                padding: 12,
                borderRadius: 4,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Profile Code</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontFamily: 'monospace' }}>
                  {selectedProfile.profileCode} (v{selectedProfile.version})
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Approval Status</span>
                <div style={{ marginTop: 2 }}>
                  <StatusBadge status={selectedProfile.status} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Slicer Software</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedProfile.slicerName} {selectedProfile.slicerVersion}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Support Geometry</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedProfile.supportType || 'None'}
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Manufacturing Notes</span>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {selectedProfile.notes || 'No notes specified.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Print Profile & Parameters"
      >
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Profile Name *
            </label>
            <input
              type="text"
              required
              value={editProfileForm.name || ''}
              onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Slicer Name
              </label>
              <input
                type="text"
                value={editProfileForm.slicerName || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, slicerName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Revision / Version
              </label>
              <input
                type="text"
                value={editProfileForm.version || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, version: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Status
              </label>
              <select
                value={editProfileForm.status || 'PRODUCTION'}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="PRODUCTION">PRODUCTION</option>
                <option value="EXPERIMENTAL">EXPERIMENTAL</option>
                <option value="APPROVED">APPROVED</option>
                <option value="DEPRECATED">DEPRECATED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Layer Height (mm)
              </label>
              <input
                type="number"
                step="0.02"
                value={editProfileForm.layerHeight || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, layerHeight: parseFloat(e.target.value) || 0.2 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Print Speed (mm/s)
              </label>
              <input
                type="number"
                step="5"
                value={editProfileForm.printSpeed || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, printSpeed: parseInt(e.target.value) || 100 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Wall Loops / Count
              </label>
              <input
                type="number"
                step="1"
                value={editProfileForm.wallCount || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, wallCount: parseInt(e.target.value) || 3 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Infill (%)
              </label>
              <input
                type="number"
                step="1"
                value={editProfileForm.infillPercent || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, infillPercent: parseInt(e.target.value) || 20 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Nozzle Temp (°C)
              </label>
              <input
                type="number"
                step="1"
                value={editProfileForm.nozzleTemp || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, nozzleTemp: parseInt(e.target.value) || 220 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Bed Temp (°C)
              </label>
              <input
                type="number"
                step="1"
                value={editProfileForm.bedTemp || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, bedTemp: parseInt(e.target.value) || 60 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Manufacturing Notes
            </label>
            <textarea
              rows={2}
              value={editProfileForm.notes || ''}
              onChange={(e) => setEditProfileForm({ ...editProfileForm, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                backgroundColor: 'var(--accent-red)',
                border: 'none',
                borderRadius: 4,
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
