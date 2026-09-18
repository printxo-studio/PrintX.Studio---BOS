'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gauge,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Layers,
  Sparkles,
  Sliders,
  Check,
  X,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';

const CALIBRATION_TYPES = [
  { id: 'ALL', name: 'All Calibration Types' },
  { id: 'FIRST_LAYER', name: 'First Layer / Bed Leveling' },
  { id: 'FLOW', name: 'Flow Rate / Extrusion Multiplier' },
  { id: 'PRESSURE_ADVANCE', name: 'Pressure Advance / Linear Advance' },
  { id: 'TEMPERATURE', name: 'Temperature Tower' },
  { id: 'RETRACTION', name: 'Retraction Distance & Speed' },
  { id: 'DIMENSIONAL', name: 'Dimensional Accuracy (XYZ Steps)' },
  { id: 'OVERHANG', name: 'Overhang & Bridging Angle' },
  { id: 'COOLING', name: 'Cooling & Fan Curves' },
  { id: 'SPEED', name: 'Max Volumetric Flow / Speed' },
  { id: 'BED_ADHESION', name: 'Bed Surface Adhesion & Release' },
];

export default function CalibrationsPage() {
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [printerFilter, setPrinterFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCal, setSelectedCal] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Forms
  const [newCalForm, setNewCalForm] = useState({
    printerId: '',
    material: 'PA-CF',
    brand: 'Bambu Lab',
    nozzleSize: '0.4',
    calibrationType: 'PRESSURE_ADVANCE',
    parameterName: 'PA (K-Factor)',
    previousValue: '0.025',
    testValue: '0.015 - 0.040',
    measuredValue: '0.022',
    recommendedValue: '0.022',
    tolerance: '±0.002',
    result: 'PASSED',
    operator: 'PrintXO Lead Engineer',
    approvalStatus: 'APPROVED',
    notes: 'Clean corners on 45° test piece. Zero blobbing at direction changes.',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [calRes, prtRes] = await Promise.all([
        fetch(`/api/calibrations?type=${typeFilter}&status=${statusFilter}&printerId=${printerFilter}`),
        fetch('/api/printers'),
      ]);

      if (calRes.ok) setCalibrations(await calRes.json());
      if (prtRes.ok) {
        const prtData = await prtRes.json();
        setPrinters(prtData);
        if (prtData.length > 0 && !newCalForm.printerId) {
          setNewCalForm((prev) => ({ ...prev, printerId: prtData[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load calibrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, statusFilter, printerFilter]);

  const handleCreateCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calibrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCalForm),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/calibrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalStatus: 'APPROVED',
          approvedBy: 'PrintXO Chief Engineer',
        }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalCals = calibrations.length;
  const approvedCals = calibrations.filter((c) => c.approvalStatus === 'APPROVED' || c.approvalStatus === 'ACTIVE').length;
  const passedCals = calibrations.filter((c) => c.result === 'PASSED').length;
  const passRate = totalCals > 0 ? Math.round((passedCals / totalCals) * 100) : 100;

  // Filtered by Search
  const filteredCalibrations = calibrations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.calibrationCode.toLowerCase().includes(q) ||
      c.parameterName.toLowerCase().includes(q) ||
      c.material.toLowerCase().includes(q) ||
      (c.printer && c.printer.name.toLowerCase().includes(q)) ||
      (c.operator && c.operator.toLowerCase().includes(q));
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
              Section 18: Engineering-Grade Calibrations
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
            Calibration Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Engineering-grade tuning of flow rates, pressure advance, temperature towers, and mechanical tolerances.
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
            Log New Calibration
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
          label="Total Calibrations"
          value={totalCals}
          subtext="Engineering baseline tests"
          icon={Gauge}
        />
        <KPICard
          label="Production Approved"
          value={approvedCals}
          subtext="Certified for live print farm"
          icon={ShieldCheck}
        />
        <KPICard
          label="Calibration Pass Rate"
          value={`${passRate}%`}
          subtext={`${passedCals} of ${totalCals} passed specs`}
          icon={CheckCircle2}
        />
        <KPICard
          label="Printers Calibrated"
          value={printers.length}
          subtext="Machines with active profiles"
          icon={Printer}
        />
      </div>

      {/* Requirement Notice */}
      <div
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <ShieldCheck size={18} color="var(--accent-red)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Section 18 Quality Principle:</strong> Only{' '}
          <span style={{ color: 'var(--accent-green, #10b981)', fontWeight: 600 }}>APPROVED</span> calibration
          parameters are injected into production print jobs and print profiles to guarantee zero dimensional deviation.
        </div>
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
              placeholder="Search code, parameter, machine, material..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              {CALIBRATION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
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
              <option value="ALL">All Approvals</option>
              <option value="APPROVED">Approved</option>
              <option value="TESTING">Testing</option>
              <option value="DRAFT">Draft</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Showing {filteredCalibrations.length} records
        </div>
      </div>

      {/* Calibrations Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code / Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Printer & Material</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type & Parameter</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Measured vs Recommended</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tolerance</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Result</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Approval Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Loading calibration logs...
                  </td>
                </tr>
              ) : filteredCalibrations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No calibration records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCalibrations.map((cal) => (
                  <tr
                    key={cal.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: 13,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Code / Date */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {cal.calibrationCode}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {new Date(cal.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Printer & Material */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {cal.printer ? cal.printer.name : 'All Printers'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            backgroundColor: 'var(--bg-surface-elevated)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {cal.material}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {cal.nozzleSize}mm Nozzle
                        </span>
                      </div>
                    </td>

                    {/* Type & Parameter */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {cal.parameterName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {cal.calibrationType.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Values */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          Measured: <strong>{cal.measuredValue || '-'}</strong>
                        </span>
                        <ArrowRight size={12} color="var(--text-tertiary)" />
                        <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                          {cal.recommendedValue}
                        </span>
                      </div>
                      {cal.previousValue && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Prev: {cal.previousValue}
                        </div>
                      )}
                    </td>

                    {/* Tolerance */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {cal.tolerance || 'Standard'}
                    </td>

                    {/* Result */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge
                        status={cal.result}
                        variant={cal.result === 'PASSED' ? 'success' : 'danger'}
                      />
                    </td>

                    {/* Approval Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge
                        status={cal.approvalStatus}
                        variant={
                          cal.approvalStatus === 'APPROVED' || cal.approvalStatus === 'ACTIVE'
                            ? 'success'
                            : cal.approvalStatus === 'TESTING'
                            ? 'warning'
                            : 'neutral'
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {cal.approvalStatus !== 'APPROVED' && (
                          <button
                            title="Approve for Production"
                            onClick={() => handleApprove(cal.id)}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              borderRadius: 4,
                              color: 'var(--accent-green, #10b981)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                        )}

                        <button
                          title="View Details"
                          onClick={() => {
                            setSelectedCal(cal);
                            setIsDetailModalOpen(true);
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
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CALIBRATION MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Engineering Calibration Run"
      >
        <form onSubmit={handleCreateCalibration} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Target Printer
              </label>
              <select
                required
                value={newCalForm.printerId}
                onChange={(e) => setNewCalForm({ ...newCalForm, printerId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {printers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Calibration Type
              </label>
              <select
                value={newCalForm.calibrationType}
                onChange={(e) => setNewCalForm({ ...newCalForm, calibrationType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {CALIBRATION_TYPES.filter((t) => t.id !== 'ALL').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Material
              </label>
              <input
                type="text"
                required
                value={newCalForm.material}
                onChange={(e) => setNewCalForm({ ...newCalForm, material: e.target.value })}
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
                Filament Brand
              </label>
              <input
                type="text"
                value={newCalForm.brand}
                onChange={(e) => setNewCalForm({ ...newCalForm, brand: e.target.value })}
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
                value={newCalForm.nozzleSize}
                onChange={(e) => setNewCalForm({ ...newCalForm, nozzleSize: e.target.value })}
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
                Parameter Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flow Ratio / Pressure Advance K-factor"
                value={newCalForm.parameterName}
                onChange={(e) => setNewCalForm({ ...newCalForm, parameterName: e.target.value })}
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
                Tolerance Spec
              </label>
              <input
                type="text"
                placeholder="e.g. ±0.02mm"
                value={newCalForm.tolerance}
                onChange={(e) => setNewCalForm({ ...newCalForm, tolerance: e.target.value })}
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
                Previous Value
              </label>
              <input
                type="text"
                value={newCalForm.previousValue}
                onChange={(e) => setNewCalForm({ ...newCalForm, previousValue: e.target.value })}
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
                Measured Value
              </label>
              <input
                type="text"
                value={newCalForm.measuredValue}
                onChange={(e) => setNewCalForm({ ...newCalForm, measuredValue: e.target.value })}
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
                Recommended Value
              </label>
              <input
                type="text"
                required
                value={newCalForm.recommendedValue}
                onChange={(e) => setNewCalForm({ ...newCalForm, recommendedValue: e.target.value })}
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
                Result
              </label>
              <select
                value={newCalForm.result}
                onChange={(e) => setNewCalForm({ ...newCalForm, result: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="PASSED">PASSED</option>
                <option value="FAILED">FAILED</option>
                <option value="INCONCLUSIVE">INCONCLUSIVE</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Approval Status
              </label>
              <select
                value={newCalForm.approvalStatus}
                onChange={(e) => setNewCalForm({ ...newCalForm, approvalStatus: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="APPROVED">APPROVED (Active for Production)</option>
                <option value="TESTING">TESTING (Under Observation)</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Engineering Observation & Notes
            </label>
            <textarea
              rows={2}
              value={newCalForm.notes}
              onChange={(e) => setNewCalForm({ ...newCalForm, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                resize: 'none',
              }}
            />
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
              Save Calibration
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Calibration Record: ${selectedCal?.calibrationCode}`}
      >
        {selectedCal && (
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
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Machine</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedCal.printer?.name}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Material & Nozzle</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedCal.material} • {selectedCal.nozzleSize}mm
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Parameter</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedCal.parameterName}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Recommended Production Value</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: 16 }}>
                  {selectedCal.recommendedValue}
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Engineering Notes</span>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {selectedCal.notes || 'No extra notes recorded.'}
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
    </div>
  );
}
