'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Disc,
  Plus,
  Scale,
  Flame,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
  History,
  Info,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';
import { FILAMENT_STATUSES } from '@/lib/constants';

interface FilamentSpool {
  id: string;
  spoolCode: string;
  brand: string;
  material: string;
  series: string | null;
  color: string;
  colorHex: string | null;
  diameter: number;
  initialWeightG: number;
  currentWeightG: number;
  usedWeightG: number;
  wasteWeightG: number;
  spoolCost: number;
  costPerGram: number;
  supplier: string | null;
  purchaseDate: string | null;
  batchLotNumber: string | null;
  storageLocation: string | null;
  dryingStatus: string;
  lastDriedAt: string | null;
  status: string;
  reorderLevelG: number;
  remainingPercent: number;
  calculatedCostPerGram: string;
  _count?: { printJobs: number };
}

export default function FilamentPage() {
  const [spools, setSpools] = useState<FilamentSpool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeighModalOpen, setIsWeighModalOpen] = useState(false);
  const [isDryModalOpen, setIsDryModalOpen] = useState(false);
  const [selectedSpool, setSelectedSpool] = useState<FilamentSpool | null>(null);

  // Forms
  const [newSpoolForm, setNewSpoolForm] = useState({
    brand: 'Polymaker',
    material: 'PLA',
    series: 'PolyLite',
    color: 'Matte Black',
    colorHex: '#18181b',
    diameter: '1.75',
    initialWeightG: '1000',
    spoolCost: '1850',
    supplier: 'MakerBazaar India',
    batchLotNumber: 'LOT-2026-08',
    storageLocation: 'Drybox Rack A1',
    dryingStatus: 'DRIED',
    reorderLevelG: '200',
  });

  const [weightInput, setWeightInput] = useState('');
  const [dryingInput, setDryingInput] = useState('DRIED');

  const loadSpools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/filament');
      if (res.ok) {
        const data = await res.json();
        setSpools(data);
      }
    } catch (err) {
      console.error('Failed to load filament spools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpools();
  }, []);

  const handleCreateSpool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/filament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpoolForm),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadSpools();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpool) return;
    try {
      const res = await fetch(`/api/filament/${selectedSpool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentWeightG: weightInput }),
      });
      if (res.ok) {
        setIsWeighModalOpen(false);
        setSelectedSpool(null);
        loadSpools();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDrying = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpool) return;
    try {
      const res = await fetch(`/api/filament/${selectedSpool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryingStatus: dryingInput }),
      });
      if (res.ok) {
        setIsDryModalOpen(false);
        setSelectedSpool(null);
        loadSpools();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSpool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spool record?')) return;
    try {
      const res = await fetch(`/api/filament/${id}`, { method: 'DELETE' });
      if (res.ok) loadSpools();
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalActiveSpools = spools.filter((s) => s.status !== 'EMPTY' && s.status !== 'ARCHIVED').length;
  const totalWeightKg = (
    spools.reduce((sum, s) => sum + s.currentWeightG, 0) / 1000
  ).toFixed(2);
  const lowSpools = spools.filter(
    (s) => s.currentWeightG <= s.reorderLevelG && s.status !== 'EMPTY'
  ).length;
  const totalValue = spools.reduce(
    (sum, s) => sum + (s.currentWeightG / s.initialWeightG) * s.spoolCost,
    0
  );

  // Filtered
  const filteredSpools = spools.filter((s) => {
    const matchesSearch =
      s.spoolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.storageLocation && s.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMaterial = materialFilter === 'ALL' || s.material === materialFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesMaterial && matchesStatus;
  });

  const materialsList = Array.from(new Set(spools.map((s) => s.material)));

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
              Manufacturing Operations
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Section 16: Spool Level Traceability
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
            Filament & Spool Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Real-time tracking of individual spools, weight consumption, moisture/drying status, and batch traceability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
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
            Add New Spool
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
          label="Active Spools"
          value={totalActiveSpools}
          subtext="In stock or on printers"
          icon={Disc}
        />
        <KPICard
          label="Filament in Stock"
          value={`${totalWeightKg} kg`}
          subtext="Live net available mass"
          icon={Scale}
        />
        <KPICard
          label="Low Stock Alert"
          value={lowSpools}
          subtext={`Under reorder threshold`}
          icon={AlertTriangle}
        />
        <KPICard
          label="Filament Inventory Value"
          value={formatCurrency(totalValue)}
          subtext="Net prorated material value"
          icon={Layers}
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
              placeholder="Search by code, brand, color, location..."
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
              {FILAMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Showing {filteredSpools.length} of {spools.length} spools
        </div>
      </div>

      {/* Spools Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Spool Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Material & Brand</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Color</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Remaining Weight</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cost / Rate</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Drying / Location</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Loading filament inventory...
                  </td>
                </tr>
              ) : filteredSpools.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No spools found matching filters.
                  </td>
                </tr>
              ) : (
                filteredSpools.map((spool) => {
                  const percent = spool.remainingPercent;
                  const isLow = spool.currentWeightG <= spool.reorderLevelG;
                  const progressColor =
                    percent > 40
                      ? 'var(--accent-green, #10b981)'
                      : percent > 15
                      ? 'var(--accent-yellow, #f59e0b)'
                      : 'var(--accent-red, #ef4444)';

                  return (
                    <tr
                      key={spool.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: 13,
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Spool Code */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Disc size={16} color="var(--accent-red)" />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                              {spool.spoolCode}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              {spool.batchLotNumber ? `Lot: ${spool.batchLotNumber}` : 'Standard Batch'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Material & Brand */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {spool.brand}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {spool.material}
                          </span>
                          {spool.series && (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              {spool.series}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {spool.diameter}mm
                          </span>
                        </div>
                      </td>

                      {/* Color */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: spool.colorHex || '#18181b',
                              border: '1px solid rgba(255,255,255,0.2)',
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ color: 'var(--text-secondary)' }}>{spool.color}</span>
                        </div>
                      </td>

                      {/* Remaining Weight & Bar */}
                      <td style={{ padding: '14px 16px', minWidth: 160 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: isLow ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                            {spool.currentWeightG}g
                          </span>
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            / {spool.initialWeightG}g ({percent}%)
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: 6,
                            backgroundColor: 'var(--bg-canvas)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              backgroundColor: progressColor,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </td>

                      {/* Cost / Rate */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {formatCurrency(spool.spoolCost)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          ₹{spool.costPerGram || spool.calculatedCostPerGram}/g
                        </div>
                      </td>

                      {/* Drying / Location */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor:
                                spool.dryingStatus === 'DRIED'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : spool.dryingStatus === 'IN_DRYER'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              color:
                                spool.dryingStatus === 'DRIED'
                                  ? 'var(--accent-green, #10b981)'
                                  : spool.dryingStatus === 'IN_DRYER'
                                  ? 'var(--accent-yellow, #f59e0b)'
                                  : 'var(--accent-red, #ef4444)',
                            }}
                          >
                            {spool.dryingStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {spool.storageLocation || 'Workshop Shelf'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={spool.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            title="Weigh on Physical Scale"
                            onClick={() => {
                              setSelectedSpool(spool);
                              setWeightInput(String(spool.currentWeightG));
                              setIsWeighModalOpen(true);
                            }}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 4,
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            <Scale size={14} />
                          </button>

                          <button
                            title="Update Moisture / Drying Status"
                            onClick={() => {
                              setSelectedSpool(spool);
                              setDryingInput(spool.dryingStatus);
                              setIsDryModalOpen(true);
                            }}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 4,
                              color: 'var(--accent-yellow, #f59e0b)',
                              cursor: 'pointer',
                            }}
                          >
                            <Flame size={14} />
                          </button>

                          <button
                            title="Delete Spool"
                            onClick={() => handleDeleteSpool(spool.id)}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 4,
                              color: 'var(--accent-red)',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SPOOL MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Filament Spool"
      >
        <form onSubmit={handleCreateSpool} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Brand
              </label>
              <input
                type="text"
                required
                value={newSpoolForm.brand}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, brand: e.target.value })}
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
              <select
                value={newSpoolForm.material}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, material: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU 95A</option>
                <option value="PA-CF">PA-CF (Carbon Fiber Nylon)</option>
                <option value="ASA">ASA</option>
                <option value="PC">Polycarbonate</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Series / Variant
              </label>
              <input
                type="text"
                placeholder="e.g. PolyLite, Matte, Silk, Tough"
                value={newSpoolForm.series}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, series: e.target.value })}
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
                Color Name
              </label>
              <input
                type="text"
                required
                value={newSpoolForm.color}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, color: e.target.value })}
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
                Color Swatch
              </label>
              <input
                type="color"
                value={newSpoolForm.colorHex}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, colorHex: e.target.value })}
                style={{
                  width: '100%',
                  height: 38,
                  padding: 2,
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Initial Weight (g)
              </label>
              <input
                type="number"
                required
                value={newSpoolForm.initialWeightG}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, initialWeightG: e.target.value })}
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
                Spool Cost (₹)
              </label>
              <input
                type="number"
                required
                value={newSpoolForm.spoolCost}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, spoolCost: e.target.value })}
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
                Storage Location
              </label>
              <input
                type="text"
                value={newSpoolForm.storageLocation}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, storageLocation: e.target.value })}
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
                Supplier Name
              </label>
              <input
                type="text"
                value={newSpoolForm.supplier}
                onChange={(e) => setNewSpoolForm({ ...newSpoolForm, supplier: e.target.value })}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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
              Save Spool
            </button>
          </div>
        </form>
      </Modal>

      {/* WEIGH ON PHYSICAL SCALE MODAL */}
      <Modal
        isOpen={isWeighModalOpen}
        onClose={() => setIsWeighModalOpen(false)}
        title={`Scale Check: ${selectedSpool?.spoolCode}`}
      >
        <form onSubmit={handleUpdateWeight} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Weigh the spool on the workshop digital scale and enter the gross filament weight remaining.
          </p>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Current Weight (grams)
            </label>
            <input
              type="number"
              step="1"
              required
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                fontSize: 16,
                fontWeight: 700,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsWeighModalOpen(false)}
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
              Update Scale Weight
            </button>
          </div>
        </form>
      </Modal>

      {/* DRYING STATUS MODAL */}
      <Modal
        isOpen={isDryModalOpen}
        onClose={() => setIsDryModalOpen(false)}
        title={`Moisture & Drying Protocol: ${selectedSpool?.spoolCode}`}
      >
        <form onSubmit={handleUpdateDrying} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Track moisture control compliance. Technical polymers like PA-CF, TPU, and PETG require strict drying cycles.
          </p>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Drying Status
            </label>
            <select
              value={dryingInput}
              onChange={(e) => setDryingInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            >
              <option value="DRIED">DRIED — Ready for High-Quality Production</option>
              <option value="IN_DRYER">IN_DRYER — Currently Running in Active Heated Dryer</option>
              <option value="NEEDS_DRYING">NEEDS_DRYING — High Ambient Moisture Exposure</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsDryModalOpen(false)}
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
              Save Drying State
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
